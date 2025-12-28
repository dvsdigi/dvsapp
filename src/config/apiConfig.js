import Constants from 'expo-constants';

/**
 * Mobile API Configuration
 * 
 * AUTOMATIC IP DETECTION:
 * In Expo Go, localhost refers to the *phone itself*. To reach the server on your PC,
 * we need your PC's LAN IP (e.g., 192.168.1.X).
 * 
 * We use Constants.expoConfig.hostUri to dynamically get this IP.
 */

const getBaseUrl = () => {
    // 1. If in Production, use the Live URL (Update this when deploying)
    // if (!__DEV__) return 'https://your-production-url.com';

    // 2. If in Development (Expo Go), dynamically find the PC's IP
    const debuggerHost = Constants.expoConfig?.hostUri;
    const localhost = debuggerHost?.split(':')[0];

    if (localhost) {
        return `http://${localhost}:4000`; // Assuming your Node server runs on port 4000
    }

    // 3. Fallback (e.g., for Simulator)
    return 'http://localhost:4000';
};

export const API_BASE_URL = getBaseUrl();
export const API_URL = `${API_BASE_URL}/api/v1`;

console.log('🔗 [Mobile Config] API URL set to:', API_URL);

// Endpoints (Mirrored from dvsclient)
export const ENDPOINTS = {
    LOGIN: '/login',
    // Add others as needed
};
