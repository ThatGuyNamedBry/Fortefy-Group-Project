import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Where the dev server sends /api requests: Flask's own dev server unless set
const apiTarget = process.env.API_PROXY_TARGET || 'http://localhost:5000';

export default defineConfig({
    plugins: [react()],
    build: {
        // Flask serves the built app from react-app/build (static_folder in
        // app/__init__.py), where Create React App used to put it
        outDir: 'build',
    },
    server: {
        // The port the Flask CORS settings and the Google sign-in docs expect
        port: 3000,
        strictPort: true,
        proxy: {
            // changeOrigin, as Create React App's proxy did: Flask sees its
            // own host, which GOOGLE_REDIRECT_URI in the .env accounts for
            '/api': { target: apiTarget, changeOrigin: true },
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/setupTests.js',
    },
});
