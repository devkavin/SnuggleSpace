import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Landing({ auth, canLogin, canRegister }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <>
            <Head title="SnuggleSpace - Share Your Entertainment Journey" />
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
                {/* Navigation */}
                <nav className="relative z-10 flex items-center justify-between p-6">
                    <div className="flex items-center space-x-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg">
                            SS
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                            SnuggleSpace
                        </span>
                    </div>

                    <div className="flex items-center space-x-4">
                        {canLogin && (
                            <Link
                                href={route('login')}
                                className="rounded-lg px-4 py-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                            >
                                Log in
                            </Link>
                        )}
                        {canRegister && (
                            <Link
                                href={route('register')}
                                className="rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-2 text-white font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Get Started
                            </Link>
                        )}
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="relative px-6 py-20 text-center">
                    <div className="mx-auto max-w-4xl">
                        <h1 className="mb-8 text-5xl font-bold leading-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
                            Share Your
                            <span className="block bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                                Entertainment Journey
                            </span>
                        </h1>

                        <p className="mb-12 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            Create shared watch lists, play fun spinner games to pick what to watch,
                            and send cute notes to your partner. Make every movie night special with SnuggleSpace.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            {canRegister && (
                                <Link
                                    href={route('register')}
                                    className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                    onMouseEnter={() => setIsHovered(true)}
                                    onMouseLeave={() => setIsHovered(false)}
                                >
                                    Start Your Journey
                                    <svg
                                        className={`ml-2 h-5 w-5 transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                            )}

                            {canLogin && (
                                <Link
                                    href={route('login')}
                                    className="px-8 py-4 text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    Already have an account? Sign in
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="px-6 py-20">
                    <div className="mx-auto max-w-6xl">
                        <h2 className="mb-16 text-center text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                            Everything you need for the perfect movie night
                        </h2>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {/* Watch Lists */}
                            <div className="group rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur-sm dark:bg-gray-800/80 hover:shadow-xl transition-all duration-300">
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900">
                                    <svg className="h-8 w-8 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Shared Watch Lists</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Create and share watch lists with your partner. Add movies, TV shows, and anime to your shared collection.
                                </p>
                            </div>

                            {/* Spinner Game */}
                            <div className="group rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur-sm dark:bg-gray-800/80 hover:shadow-xl transition-all duration-300">
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900">
                                    <svg className="h-8 w-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </div>
                                <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Spinner Game</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Can't decide what to watch? Use our fun spinner game to randomly pick from your shared watch list.
                                </p>
                            </div>

                            {/* Notes */}
                            <div className="group rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur-sm dark:bg-gray-800/80 hover:shadow-xl transition-all duration-300">
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900 dark:to-blue-900">
                                    <svg className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Sweet Notes</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Send cute notes to your partner. Share your thoughts, feelings, or just say "I love you" in a special way.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="px-6 py-12 text-center">
                    <div className="mx-auto max-w-4xl">
                        <p className="text-gray-600 dark:text-gray-400">
                            Made with ❤️ for Nikki
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
} 