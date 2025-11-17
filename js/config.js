// Configuration for frontend
// This file helps avoid hardcoded URLs and supports different environments

const CONFIG = {
    // Backend API URL
    // In production, this should be your actual domain with HTTPS
    // In development, it can be localhost
    API_URL: (() => {
        // Check if running on localhost/development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3001';
        }
        // Production: use HTTPS and relative path or full domain
        // Option 1: Same domain (recommended)
        return window.location.origin;
        // Option 2: Different domain (uncomment and set your API domain)
        // return 'https://api.yourdomain.com';
    })(),

    // API Endpoints
    ENDPOINTS: {
        CONTACT: '/contact',
        CONSULTAS: '/consultas',
        LOGIN: '/login',
        DEBUG_LOGS: '/debug/logs',
        DEBUG_CONSULTAS: '/debug/consultas',
        DEBUG_LAST_CONTACT: '/debug/last-contact',
        HEALTH: '/health'
    },

    // Get full endpoint URL
    getEndpoint(endpoint) {
        return this.API_URL + endpoint;
    }
};

// Make CONFIG available globally
if (typeof window !== 'undefined') {
    window.APP_CONFIG = CONFIG;
}
