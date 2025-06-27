import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';

export default function Dashboard({ auth }) {
    const [activeTab, setActiveTab] = useState('watchlist');
    const [watchList, setWatchList] = useState([]);
    const [partnerWatchList, setPartnerWatchList] = useState([]);
    const [partnerships, setPartnerships] = useState({ pending_requests: [], accepted_partnership: null });
    const [notes, setNotes] = useState({ sent: [], received: [] });
    const [spinnerGames, setSpinnerGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newItem, setNewItem] = useState({ title: '', type: 'movie', status: 'plan_to_watch' });
    const [newNote, setNewNote] = useState({ message: '', color: '#ff6b9d' });
    const [spinnerType, setSpinnerType] = useState('movie');
    const [spinnerResult, setSpinnerResult] = useState(null);
    const [spinning, setSpinning] = useState(false);
    const [error, setError] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        // Global error handler to prevent blank pages
        const handleGlobalError = (event) => {
            console.error('Global error caught:', event.error);
            setError('An unexpected error occurred. Please refresh the page.');
        };

        const handleUnhandledRejection = (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            setError('An unexpected error occurred. Please refresh the page.');
        };

        window.addEventListener('error', handleGlobalError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        loadData();

        return () => {
            window.removeEventListener('error', handleGlobalError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDropdown && !event.target.closest('.dropdown-container')) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDropdown]);

    const loadData = async () => {
        try {
            setError(null);

            // Load data with individual error handling
            let watchListRes, partnershipsRes, notesRes, spinnerRes;

            try {
                watchListRes = await axios.get('/api/watch-list');
            } catch (error) {
                console.error('Error loading watch list:', error);
                watchListRes = { data: [] };
            }

            try {
                partnershipsRes = await axios.get('/api/partnerships');
            } catch (error) {
                console.error('Error loading partnerships:', error);
                partnershipsRes = { data: { pending_requests: [], accepted_partnership: null } };
            }

            try {
                notesRes = await axios.get('/api/notes');
                console.log('Notes API response:', notesRes.data); // Debug log
            } catch (error) {
                console.error('Error loading notes:', error);
                console.error('Notes error response:', error.response?.data); // Debug log
                notesRes = { data: { sent_notes: [], received_notes: [] } };
            }

            try {
                spinnerRes = await axios.get('/api/spinner');
            } catch (error) {
                console.error('Error loading spinner games:', error);
                spinnerRes = { data: [] };
            }

            setWatchList(watchListRes.data || []);
            setPartnerships(partnershipsRes.data || { pending_requests: [], accepted_partnership: null });
            setNotes({
                sent: notesRes.data?.sent_notes || [],
                received: notesRes.data?.received_notes || []
            });
            setSpinnerGames(spinnerRes.data || []);

            // Load partner's watch list if partnership exists
            if (partnershipsRes.data?.accepted_partnership) {
                try {
                    const partnerWatchListRes = await axios.get('/api/watch-list/partner/list');
                    setPartnerWatchList(partnerWatchListRes.data || []);
                } catch (partnerError) {
                    console.error('Error loading partner watch list:', partnerError);
                    setPartnerWatchList([]);
                }
            } else {
                setPartnerWatchList([]);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            setError('Failed to load data. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    const addWatchListItem = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/watch-list', newItem);
            setWatchList([response.data, ...watchList]);
            setNewItem({ title: '', type: 'movie', status: 'plan_to_watch' });
        } catch (error) {
            console.error('Error adding item:', error);
        }
    };

    const sendNote = async (e) => {
        e.preventDefault();
        console.log('sendNote function called'); // Debug log

        if (!newNote.message.trim()) {
            setError('Please enter a message');
            return;
        }

        try {
            setError(null);
            console.log('Sending note:', newNote); // Debug log
            console.log('Current partnerships:', partnerships); // Debug log

            const response = await axios.post('/api/notes', newNote);
            console.log('Note response:', response.data); // Debug log

            // Handle both old and new API response formats
            const noteData = response.data.note || response.data;
            console.log('Processed note data:', noteData); // Debug log

            if (response.data.success || noteData) {
                console.log('Updating notes state...'); // Debug log
                // Ensure notes state is properly initialized
                setNotes(prevNotes => {
                    console.log('Previous notes state:', prevNotes); // Debug log
                    const currentNotes = prevNotes || { sent: [], received: [] };
                    const newSentNotes = [{
                        id: noteData.id,
                        message: noteData.message,
                        color: noteData.color,
                        created_at: noteData.created_at,
                        recipient: {
                            name: partnerships?.accepted_partnership?.partner?.name || 'Partner'
                        }
                    }, ...(currentNotes.sent || [])];
                    console.log('New sent notes:', newSentNotes); // Debug log
                    return {
                        ...currentNotes,
                        sent: newSentNotes
                    };
                });

                // Clear the form
                setNewNote({ message: '', color: '#ff6b9d' });

                console.log('Note sent successfully'); // Debug log
            } else {
                throw new Error(response.data.error || 'Failed to send note');
            }

        } catch (error) {
            console.error('Error sending note:', error);
            console.error('Error response:', error.response?.data); // Debug log

            let errorMessage = 'Failed to send note. Please try again.';

            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }

            setError(errorMessage);

            // Prevent the page from going blank by not throwing the error
            return false;
        }
    };

    const deleteNote = async (noteId) => {
        if (!confirm('Are you sure you want to delete this note?')) {
            return;
        }

        try {
            const response = await axios.delete(`/api/notes/${noteId}`);

            if (response.data.success) {
                // Remove from sent notes
                setNotes(prevNotes => ({
                    ...prevNotes,
                    sent: prevNotes.sent.filter(note => note.id !== noteId)
                }));
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            setError('Failed to delete note');
        }
    };

    const markNoteAsRead = async (noteId) => {
        try {
            await axios.patch(`/api/notes/${noteId}/read`);

            // Update the note in received notes
            setNotes(prevNotes => ({
                ...prevNotes,
                received: prevNotes.received.map(note =>
                    note.id === noteId
                        ? { ...note, is_read: true, read_at: new Date().toISOString() }
                        : note
                )
            }));
        } catch (error) {
            console.error('Error marking note as read:', error);
        }
    };

    const spinWheel = async () => {
        if (spinning) return; // Prevent multiple clicks

        setSpinning(true);
        setSpinnerResult(null);
        setError(null);

        try {
            const response = await axios.post('/api/spinner/spin', { type: spinnerType });

            if (response.data.success) {
                // Add a small delay for better UX
                setTimeout(() => {
                    setSpinnerResult(response.data);
                    // Add to recent games
                    setSpinnerGames(prevGames => [{
                        id: response.data.game_id,
                        selected_title: response.data.selected_title,
                        type: spinnerType,
                        played_at: response.data.played_at
                    }, ...prevGames]);
                    setSpinning(false);
                }, 1500);
            } else {
                throw new Error(response.data.error || 'Unknown error');
            }

        } catch (error) {
            console.error('Spinner error:', error);

            let errorMessage = 'An error occurred while spinning.';

            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }

            setError(errorMessage);
            setSpinning(false);
        }
    };

    const requestPartnership = async (email) => {
        try {
            await axios.post('/api/partnerships', { partner_email: email });
            alert('Partnership request sent!');
            await loadData(); // Reload data to show updated state
        } catch (error) {
            alert('Error sending partnership request: ' + (error.response?.data?.message || error.message));
        }
    };

    const acceptPartnership = async (partnershipId) => {
        try {
            await axios.patch(`/api/partnerships/${partnershipId}/accept`);
            alert('Partnership accepted!');
            await loadData(); // Reload data to show updated state
        } catch (error) {
            alert('Error accepting partnership: ' + (error.response?.data?.message || error.message));
        }
    };

    const rejectPartnership = async (partnershipId) => {
        try {
            await axios.patch(`/api/partnerships/${partnershipId}/reject`);
            alert('Partnership request rejected');
            await loadData(); // Reload data to show updated state
        } catch (error) {
            alert('Error rejecting partnership: ' + (error.response?.data?.message || error.message));
        }
    };

    const endPartnership = async () => {
        if (!partnerships.accepted_partnership) return;

        try {
            await axios.delete(`/api/partnerships/${partnerships.accepted_partnership.id}`);
            alert('Partnership ended');
            await loadData(); // Reload data to show updated state
        } catch (error) {
            alert('Error ending partnership: ' + (error.response?.data?.message || error.message));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                <div className="text-2xl text-pink-600">Loading your cozy space...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-2xl text-red-600 mb-4">Oops! Something went wrong</div>
                    <div className="text-gray-600 mb-4">{error}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title="SnuggleSpace Dashboard" />

            <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100">
                {/* Header */}
                <div className="bg-white shadow-lg border-b border-pink-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div>
                                <h1 className="text-3xl font-bold text-pink-600">💕 SnuggleSpace</h1>
                                <p className="text-gray-600">Welcome back, {auth?.user?.name || 'User'}!</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                {!partnerships?.accepted_partnership && (
                                    <button
                                        onClick={() => {
                                            const email = prompt('Enter your partner\'s email:');
                                            if (email) requestPartnership(email);
                                        }}
                                        className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                                    >
                                        Add Partner
                                    </button>
                                )}
                                {partnerships?.accepted_partnership && (
                                    <div className="text-right mr-4">
                                        <p className="text-sm text-gray-600">Partner</p>
                                        <p className="font-semibold text-pink-600">
                                            {partnerships.accepted_partnership.partner?.name || 'Partner'}
                                        </p>
                                    </div>
                                )}

                                {/* User Dropdown */}
                                <div className="relative dropdown-container">
                                    <button
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                                            {auth?.user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <span className="text-gray-700">{auth?.user?.name || 'User'}</span>
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {showDropdown && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                            <Link
                                                href="/profile"
                                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                                                onClick={() => setShowDropdown(false)}
                                            >
                                                👤 Edit Profile
                                            </Link>
                                            <Link
                                                href="/logout"
                                                method="post"
                                                as="button"
                                                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                                                onClick={() => setShowDropdown(false)}
                                            >
                                                🚪 Logout
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
                        {[
                            { id: 'watchlist', label: '📺 Watch List', icon: '📺' },
                            { id: 'spinner', label: '🎰 Spinner Game', icon: '🎰' },
                            { id: 'notes', label: '💌 Notes', icon: '💌' },
                            { id: 'partner', label: '👥 Partner', icon: '👥' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? 'bg-pink-500 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                    {/* Watch List Tab */}
                    {activeTab === 'watchlist' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* My Watch List */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">My Watch List</h2>

                                {/* Add New Item Form */}
                                <form onSubmit={addWatchListItem} className="mb-6 p-4 bg-pink-50 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                        <input
                                            type="text"
                                            placeholder="Title"
                                            value={newItem.title}
                                            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                            className="px-3 py-2 border border-pink-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            required
                                        />
                                        <select
                                            value={newItem.type}
                                            onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                                            className="px-3 py-2 border border-pink-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        >
                                            <option value="movie">Movie</option>
                                            <option value="tv_series">TV Series</option>
                                            <option value="anime">Anime</option>
                                        </select>
                                        <select
                                            value={newItem.status}
                                            onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
                                            className="px-3 py-2 border border-pink-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        >
                                            <option value="plan_to_watch">Plan to Watch</option>
                                            <option value="watching">Watching</option>
                                            <option value="completed">Completed</option>
                                            <option value="dropped">Dropped</option>
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-pink-500 text-white py-2 rounded-md hover:bg-pink-600 transition-colors"
                                    >
                                        Add to List
                                    </button>
                                </form>

                                {/* Watch List Items */}
                                <div className="space-y-3">
                                    {watchList.map((item) => (
                                        <div key={item.id} className="p-4 border border-pink-200 rounded-lg hover:bg-pink-50 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">{item.title}</h3>
                                                    <div className="flex space-x-2 mt-1">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${item.type === 'movie' ? 'bg-blue-100 text-blue-800' :
                                                            item.type === 'tv_series' ? 'bg-green-100 text-green-800' :
                                                                'bg-purple-100 text-purple-800'
                                                            }`}>
                                                            {item.type.replace('_', ' ')}
                                                        </span>
                                                        <span className={`px-2 py-1 rounded-full text-xs ${item.status === 'plan_to_watch' ? 'bg-yellow-100 text-yellow-800' :
                                                            item.status === 'watching' ? 'bg-blue-100 text-blue-800' :
                                                                item.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                    'bg-red-100 text-red-800'
                                                            }`}>
                                                            {item.status.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </div>
                                                {item.rating && (
                                                    <div className="text-pink-600 font-bold">⭐ {item.rating}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Partner's Watch List */}
                            {partnerships?.accepted_partnership && (
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                        {partnerships.accepted_partnership.partner?.name || 'Partner'}'s Watch List
                                    </h2>
                                    <div className="space-y-3">
                                        {partnerWatchList.map((item) => (
                                            <div key={item.id} className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-800">{item.title}</h3>
                                                        <div className="flex space-x-2 mt-1">
                                                            <span className={`px-2 py-1 rounded-full text-xs ${item.type === 'movie' ? 'bg-blue-100 text-blue-800' :
                                                                item.type === 'tv_series' ? 'bg-green-100 text-green-800' :
                                                                    'bg-purple-100 text-purple-800'
                                                                }`}>
                                                                {item.type.replace('_', ' ')}
                                                            </span>
                                                            <span className={`px-2 py-1 rounded-full text-xs ${item.status === 'plan_to_watch' ? 'bg-yellow-100 text-yellow-800' :
                                                                item.status === 'watching' ? 'bg-blue-100 text-blue-800' :
                                                                    item.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                        'bg-red-100 text-red-800'
                                                                }`}>
                                                                {item.status.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {item.rating && (
                                                        <div className="text-purple-600 font-bold">⭐ {item.rating}</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Spinner Game Tab */}
                    {activeTab === 'spinner' && (
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">🎰 What Should We Watch?</h2>

                            {!partnerships?.accepted_partnership ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">💕</div>
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">You need a partner to play!</h3>
                                    <p className="text-gray-600 mb-6">Add your partner first to start spinning and discovering new content together.</p>
                                    <button
                                        onClick={() => {
                                            const email = prompt('Enter your partner\'s email:');
                                            if (email) requestPartnership(email);
                                        }}
                                        className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
                                    >
                                        Add Partner
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Error Display */}
                                    {error && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <div className="flex items-center">
                                                <div className="text-red-500 mr-3">⚠️</div>
                                                <div>
                                                    <h3 className="text-red-800 font-semibold">Error</h3>
                                                    <p className="text-red-700">{error}</p>
                                                </div>
                                                <button
                                                    onClick={() => setError(null)}
                                                    className="ml-auto text-red-500 hover:text-red-700"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Spinner Controls */}
                                    <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                                        <select
                                            value={spinnerType}
                                            onChange={(e) => setSpinnerType(e.target.value)}
                                            disabled={spinning}
                                            className="px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
                                        >
                                            <option value="movie">🎬 Movie</option>
                                            <option value="tv_series">📺 TV Series</option>
                                            <option value="anime">🌸 Anime</option>
                                        </select>
                                        <button
                                            onClick={spinWheel}
                                            disabled={spinning}
                                            className={`px-8 py-3 rounded-lg font-bold text-white transition-all transform ${spinning
                                                ? 'bg-gray-400 cursor-not-allowed scale-95'
                                                : 'bg-pink-500 hover:bg-pink-600 hover:scale-105 active:scale-95'
                                                }`}
                                        >
                                            {spinning ? (
                                                <div className="flex items-center">
                                                    <div className="animate-spin mr-2">🎰</div>
                                                    Spinning...
                                                </div>
                                            ) : (
                                                'SPIN! 🎰'
                                            )}
                                        </button>
                                    </div>

                                    {/* Spinning Animation */}
                                    {spinning && (
                                        <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-8 rounded-xl border-2 border-pink-200 text-center">
                                            <div className="text-6xl mb-4 animate-bounce">🎰</div>
                                            <div className="text-2xl font-bold text-pink-600 mb-2 animate-pulse">
                                                Spinning the wheel...
                                            </div>
                                            <div className="text-gray-600">
                                                Finding the perfect {spinnerType.replace('_', ' ')} for you and your partner!
                                            </div>
                                        </div>
                                    )}

                                    {/* Spinner Result */}
                                    {spinnerResult && !spinning && (
                                        <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-8 rounded-xl border-2 border-pink-200 text-center animate-fade-in">
                                            <div className="text-4xl mb-4">🎉</div>
                                            <h3 className="text-2xl font-bold text-pink-600 mb-4">You should watch:</h3>
                                            <div className="text-3xl font-bold text-gray-800 mb-4 bg-white p-4 rounded-lg shadow-sm">
                                                {spinnerResult.selected_title}
                                            </div>
                                            <div className="text-gray-600 space-y-2">
                                                <p>From your combined {spinnerType.replace('_', ' ')} list!</p>
                                                {spinnerResult.total_options && (
                                                    <p className="text-sm text-gray-500">
                                                        Selected from {spinnerResult.total_options} options
                                                    </p>
                                                )}
                                                {spinnerResult.user_items_count !== undefined && (
                                                    <p className="text-sm text-gray-500">
                                                        Your list: {spinnerResult.user_items_count} items •
                                                        Partner's list: {spinnerResult.partner_items_count} items
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Recent Spins */}
                                    {spinnerGames.length > 0 && (
                                        <div className="mt-8">
                                            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Recent Spins</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {spinnerGames.slice(0, 6).map((game) => (
                                                    <div key={game.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                                        <div className="font-semibold text-gray-800 mb-1">{game.selected_title}</div>
                                                        <div className="text-sm text-gray-600">
                                                            {game.type.replace('_', ' ')} • {new Date(game.played_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {spinnerGames.length > 6 && (
                                                <div className="text-center mt-4">
                                                    <p className="text-sm text-gray-500">
                                                        And {spinnerGames.length - 6} more spins...
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* No Recent Spins */}
                                    {spinnerGames.length === 0 && !spinning && !spinnerResult && (
                                        <div className="text-center py-8">
                                            <div className="text-4xl mb-4">🎰</div>
                                            <p className="text-gray-600">No spins yet. Click the SPIN button to get started!</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Notes Tab */}
                    {activeTab === 'notes' && (
                        <div className="space-y-8">
                            <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">💌 Love Notes</h2>

                            {!partnerships?.accepted_partnership ? (
                                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                                    <div className="text-6xl mb-4">💕</div>
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">You need a partner to send notes!</h3>
                                    <p className="text-gray-600 mb-6">Add your partner first to start sending cute messages and love notes.</p>
                                    <button
                                        onClick={() => {
                                            const email = prompt('Enter your partner\'s email:');
                                            if (email) requestPartnership(email);
                                        }}
                                        className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
                                    >
                                        Add Partner
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Send Note */}
                                    <div className="bg-white rounded-xl shadow-lg p-6">
                                        <h3 className="text-2xl font-bold text-gray-800 mb-6">💌 Send a Note</h3>

                                        <form onSubmit={(e) => {
                                            console.log('Form submitted'); // Debug log
                                            sendNote(e);
                                        }} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Message for {partnerships.accepted_partnership.partner?.name || 'your partner'}
                                                </label>
                                                <textarea
                                                    placeholder="Write a cute message for your partner..."
                                                    value={newNote.message}
                                                    onChange={(e) => setNewNote({ ...newNote, message: e.target.value })}
                                                    className="w-full p-4 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                                                    rows="4"
                                                    maxLength="1000"
                                                    required
                                                />
                                                <div className="text-sm text-gray-500 mt-1 text-right">
                                                    {newNote.message.length}/1000
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Note Color
                                                    </label>
                                                    <input
                                                        type="color"
                                                        value={newNote.color}
                                                        onChange={(e) => setNewNote({ ...newNote, color: e.target.value })}
                                                        className="w-12 h-10 border border-pink-200 rounded-lg cursor-pointer"
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={!newNote.message.trim()}
                                                    className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${newNote.message.trim()
                                                        ? 'bg-pink-500 text-white hover:bg-pink-600'
                                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        }`}
                                                >
                                                    Send Note 💕
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    {/* Received Notes */}
                                    <div className="bg-white rounded-xl shadow-lg p-6">
                                        <h3 className="text-2xl font-bold text-gray-800 mb-6">📬 Received Notes</h3>

                                        {!notes.received || notes.received.length === 0 ? (
                                            <div className="text-center py-12">
                                                <div className="text-4xl mb-4">📭</div>
                                                <p className="text-gray-600">No notes yet. Send one to your partner!</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                                {notes.received.map((note) => (
                                                    <div
                                                        key={note.id}
                                                        className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${!note.is_read ? 'ring-2 ring-pink-200' : ''
                                                            }`}
                                                        style={{
                                                            borderLeftColor: note.color || '#ff6b9d',
                                                            backgroundColor: `${note.color || '#ff6b9d'}08`
                                                        }}
                                                        onClick={() => !note.is_read && markNoteAsRead(note.id)}
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="text-sm font-medium text-gray-600">
                                                                From: {note.sender?.name || 'Unknown'}
                                                            </span>
                                                            <div className="flex items-center space-x-2">
                                                                {!note.is_read && (
                                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                                                                        New
                                                                    </span>
                                                                )}
                                                                <span className="text-sm text-gray-500">
                                                                    {new Date(note.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-800 leading-relaxed">{note.message}</p>
                                                        {note.is_read && note.read_at && (
                                                            <div className="text-xs text-gray-500 mt-2">
                                                                Read {new Date(note.read_at).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Sent Notes Section */}
                            {partnerships?.accepted_partnership && notes.sent && notes.sent.length > 0 && (
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-6">📤 Sent Notes</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {notes.sent.map((note) => (
                                            <div
                                                key={note.id}
                                                className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all"
                                                style={{
                                                    borderLeftColor: note.color || '#ff6b9d',
                                                    borderLeftWidth: '4px',
                                                    backgroundColor: `${note.color || '#ff6b9d'}08`
                                                }}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-sm font-medium text-gray-600">
                                                        To: {note.recipient?.name || 'Partner'}
                                                    </span>
                                                    <button
                                                        onClick={() => deleteNote(note.id)}
                                                        className="text-red-500 hover:text-red-700 text-sm"
                                                        title="Delete note"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                <p className="text-gray-800 text-sm mb-2 line-clamp-3">{note.message}</p>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(note.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Error Display */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <div className="text-red-500 mr-3">⚠️</div>
                                        <div>
                                            <h3 className="text-red-800 font-semibold">Error</h3>
                                            <p className="text-red-700">{error}</p>
                                        </div>
                                        <button
                                            onClick={() => setError(null)}
                                            className="ml-auto text-red-500 hover:text-red-700"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Partner Tab */}
                    {activeTab === 'partner' && (
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-8">👥 Partner Management</h2>

                            {partnerships?.accepted_partnership ? (
                                <div className="text-center">
                                    <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-8 rounded-xl mb-6">
                                        <h3 className="text-2xl font-bold text-pink-600 mb-2">
                                            {partnerships.accepted_partnership.partner?.name || 'Partner'}
                                        </h3>
                                        <p className="text-gray-600">Your partner since {new Date(partnerships.accepted_partnership.accepted_at).toLocaleDateString()}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (confirm('Are you sure you want to end this partnership?')) {
                                                endPartnership();
                                            }
                                        }}
                                        className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        End Partnership
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center space-y-6">
                                    <div className="text-gray-600">
                                        <p className="text-lg mb-4">You don't have a partner yet.</p>
                                        <p>Add your partner to start sharing watch lists, playing games, and sending notes!</p>
                                    </div>

                                    {/* Pending Requests */}
                                    {partnerships?.pending_requests && partnerships.pending_requests.length > 0 && (
                                        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                                            <h3 className="text-xl font-bold text-yellow-800 mb-4">Pending Requests</h3>
                                            {partnerships.pending_requests.map((request) => (
                                                <div key={request.id} className="flex justify-between items-center p-4 bg-white rounded-lg">
                                                    <span className="font-semibold">{request.user?.name || 'Unknown'}</span>
                                                    <div className="space-x-2">
                                                        <button
                                                            onClick={() => acceptPartnership(request.id)}
                                                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => rejectPartnership(request.id)}
                                                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
