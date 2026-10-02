// ============================================
// BLUJAY TECH - PRODUCTION CONFIGURATION
// Environment-based API URL Configuration
// ============================================

const CONFIG = {
    // Force production mode - always use deployed backend
    isDevelopment: false,

    // API Base URLs
    get API_BASE_URL() {
        // Always use production Render backend
        return 'https://blujay-backend.onrender.com';
    },

    // API Endpoints
    get API() {
        const base = this.API_BASE_URL;
        return {
            // Authentication
            LOGIN: `${base}/api/auth/login`,
            REGISTER: `${base}/api/auth/register`,

            // Admin routes
            ADMIN_USERS: `${base}/api/admin/users`,
            ADMIN_COURSES: `${base}/api/admin/courses`,
            ADMIN_COMMUNITY_PROFILES: `${base}/api/admin/community/profiles`,
            ADMIN_COMMUNITY_CONNECTIONS: `${base}/api/admin/community/connections`,
            ADMIN_COMMUNITY_LOGS: `${base}/api/admin/community/logs`,

            // Community Portal
            COMMUNITY_PROFILES: `${base}/api/community/profiles`,
            COMMUNITY_CONNECTIONS: `${base}/api/community/connections`,

            // Courses
            COURSES: `${base}/api/courses`,
            ENROLLMENTS: `${base}/api/enrollments`,

            // Contact
            CONTACT: `${base}/api/contact`,

            // SEO
            SEO_META: `${base}/api/seo/meta`
        };
    },

    // Environment Info
    getEnvironment() {
        return this.isDevelopment ? 'Development' : 'Production';
    }
};

// Make it globally available
window.CONFIG = CONFIG;

// Log current environment (only in development)
if (CONFIG.isDevelopment) {
    console.log('🔧 Environment:', CONFIG.getEnvironment());
    console.log('🌐 API Base URL:', CONFIG.API_BASE_URL);
}
