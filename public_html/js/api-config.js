const API_CONFIG = {
    // Development: Local backend server
    development: 'http://localhost:5000/api',

    // Production: Deployed backend server on Render
    production: 'https://blujay-backend.onrender.com/api',

    // Auto-detect mode: Use localhost if available, otherwise production
    getApiUrl: function () {
        // Use full production URL by default if environment check fails
        const prodUrl = 'https://blujay-backend.onrender.com/api';

        try {
            // Check if we're running on localhost/127.0.0.1
            const isLocalhost = window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1' ||
                window.location.hostname === '' ||
                window.location.protocol === 'file:';

            // Use development backend when running locally
            if (isLocalhost) {
                console.log('🔌 Running in LOCAL mode');
                return this.development || 'http://localhost:5000/api';
            }
        } catch (e) {
            console.warn('⚠️ Environment detection failed, defaulting to production URL');
        }

        // Use production backend for deployed sites
        console.log('🚀 Running in PRODUCTION mode');
        return this.production || prodUrl;
    }
};

// Export for use in other files
window.API_CONFIG = API_CONFIG;

const currentMode = API_CONFIG.getApiUrl() === API_CONFIG.development ? 'DEVELOPMENT' : 'PRODUCTION';
console.log(`🌐 Mode: ${currentMode}`);
console.log('🔧 API URL:', API_CONFIG.getApiUrl());
