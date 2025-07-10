import { useEffect, useRef, useState } from 'react';
import realtimeService from '../Services/RealtimeService';

export function useRealtime(eventType, callback) {
    const callbackRef = useRef(callback);

    // Update the ref when callback changes
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        const wrappedCallback = (data) => {
            if (callbackRef.current) {
                callbackRef.current(data);
            }
        };

        // Register the event listener
        realtimeService.on(eventType, wrappedCallback);

        // Cleanup function
        return () => {
            realtimeService.off(eventType, wrappedCallback);
        };
    }, [eventType]);
}

export function useRealtimeConnection() {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const checkConnection = () => {
            setIsConnected(realtimeService.isConnected);
        };

        // Check initial connection
        checkConnection();

        // Listen for connection changes
        const interval = setInterval(checkConnection, 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    return isConnected;
}

export default realtimeService; 