import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import realtimeService from './Services/RealtimeService';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Initialize real-time service if user is authenticated
        if (props.initialPage.props.auth && props.initialPage.props.auth.user) {
            realtimeService.connect();
        }

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
