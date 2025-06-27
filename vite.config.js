import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    // server: {
    //     https: false,
    // },
    // build: {
    //     rollupOptions: {
    //         output: {
    //             assetFileNames: (assetInfo) => {
    //                 let extType = assetInfo.name.split('.').at(1);
    //                 if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
    //                     extType = 'img';
    //                 }
    //                 return `assets/${extType}/[name]-[hash][extname]`;
    //             },
    //             chunkFileNames: 'assets/js/[name]-[hash].js',
    //             entryFileNames: 'assets/js/[name]-[hash].js',
    //         },
    //     },
    // },
});
