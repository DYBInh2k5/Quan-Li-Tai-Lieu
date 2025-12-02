// Configuration for different environments

const config = {
    // Tự động detect environment
    API_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api'
        : '/api', // Relative URL cho production
    
    // Feature flags
    FEATURES: {
        VOICE_COMMANDS: true,
        AI_ASSISTANT: true,
        PWA: true,
        GAMIFICATION: true,
        SOCIAL_LOGIN: false, // Chưa implement
        EMAIL_NOTIFICATIONS: false // Chưa implement
    },
    
    // App settings
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    ITEMS_PER_PAGE: 20,
    AUTO_SAVE_INTERVAL: 30000, // 30 seconds
    
    // Gamification
    XP_RATES: {
        UPLOAD_DOCUMENT: 10,
        SUBMIT_ASSIGNMENT: 15,
        CREATE_NOTE: 5,
        COMPLETE_POMODORO: 25,
        DAILY_LOGIN: 5
    },
    
    // Pomodoro defaults
    POMODORO_TIMES: [25, 15, 5],
    
    // Theme
    DEFAULT_THEME: 'default'
};

// Export config
window.APP_CONFIG = config;

// Update API_URL globally
if (typeof API_URL === 'undefined') {
    window.API_URL = config.API_URL;
}
