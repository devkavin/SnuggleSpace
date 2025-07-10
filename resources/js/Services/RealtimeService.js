class RealtimeService {
    constructor() {
        this.eventSource = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second
        this.listeners = new Map();
    }

    connect() {
        if (this.eventSource) {
            this.disconnect();
        }

        try {
            this.eventSource = new EventSource('/v1/realtime/stream');

            this.eventSource.onopen = () => {
                console.log('Real-time connection established');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.reconnectDelay = 1000;
            };

            this.eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleEvent(data);
                } catch (error) {
                    console.error('Error parsing real-time event:', error);
                }
            };

            this.eventSource.onerror = (error) => {
                console.error('Real-time connection error:', error);
                this.isConnected = false;
                this.handleReconnect();
            };

        } catch (error) {
            console.error('Failed to establish real-time connection:', error);
            this.handleReconnect();
        }
    }

    disconnect() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        this.isConnected = false;
    }

    handleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

        console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

        setTimeout(() => {
            this.connect();
        }, delay);
    }

    handleEvent(data) {
        const { type, ...payload } = data;

        // Notify all listeners for this event type
        if (this.listeners.has(type)) {
            this.listeners.get(type).forEach(callback => {
                try {
                    callback(payload);
                } catch (error) {
                    console.error(`Error in event listener for ${type}:`, error);
                }
            });
        }

        // Handle specific events
        switch (type) {
            case 'connected':
                console.log('Real-time service connected for user:', payload.user_id);
                break;
            case 'note.sent':
                this.showNotification('New Love Note', `${payload.sender.name} sent you a note!`, 'note');
                break;
            case 'partnership.request.sent':
                this.showNotification('Partnership Request', `${payload.sender.name} wants to partner with you!`, 'partnership');
                break;
            case 'watchlist.item.added':
                this.showNotification('New Watch List Item', `${payload.user.name} added "${payload.watch_list_item.title}" to their list!`, 'watchlist');
                break;
        }
    }

    on(eventType, callback) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType).push(callback);
    }

    off(eventType, callback) {
        if (this.listeners.has(eventType)) {
            const callbacks = this.listeners.get(eventType);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    showNotification(title, message, type = 'info') {
        // Check if browser supports notifications
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return;
        }

        // Request permission if not granted
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.createNotification(title, message, type);
                }
            });
        } else if (Notification.permission === 'granted') {
            this.createNotification(title, message, type);
        }

        // Also show in-app notification
        this.showInAppNotification(title, message, type);
    }

    createNotification(title, message, type) {
        const notification = new Notification(title, {
            body: message,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: `snugglespace-${type}`,
            requireInteraction: false,
        });

        // Auto-close after 5 seconds
        setTimeout(() => {
            notification.close();
        }, 5000);

        // Handle click
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    }

    showInAppNotification(title, message, type) {
        // Create a simple in-app notification
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 bg-white border-l-4 border-${this.getTypeColor(type)} shadow-lg rounded-lg p-4 max-w-sm z-50 transform transition-all duration-300 translate-x-full`;
        notification.innerHTML = `
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-${this.getTypeColor(type)}" fill="currentColor" viewBox="0 0 20 20">
                        ${this.getTypeIcon(type)}
                    </svg>
                </div>
                <div class="ml-3 flex-1">
                    <p class="text-sm font-medium text-gray-900">${title}</p>
                    <p class="text-sm text-gray-500">${message}</p>
                </div>
                <div class="ml-4 flex-shrink-0 flex">
                    <button class="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none">
                        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Handle close button
        const closeBtn = notification.querySelector('button');
        closeBtn.onclick = () => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        };

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.add('translate-x-full');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }

    getTypeColor(type) {
        switch (type) {
            case 'note': return 'pink-500';
            case 'partnership': return 'blue-500';
            case 'watchlist': return 'green-500';
            default: return 'gray-500';
        }
    }

    getTypeIcon(type) {
        switch (type) {
            case 'note':
                return '<path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"></path>';
            case 'partnership':
                return '<path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>';
            case 'watchlist':
                return '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path>';
            default:
                return '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>';
        }
    }
}

// Create a singleton instance
const realtimeService = new RealtimeService();

export default realtimeService; 