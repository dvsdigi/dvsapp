import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/apiConfig';

// Create Axios instance
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
});

// Request Interceptor: Add Token
apiClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error retrieving token', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle Errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Log error for debugging
        if (error.response) {
            console.error('API Error:', error.response.status, error.response.data);
            if (error.response.status === 401) {
                // Todo: Handle Logout / Refresh Token
            }
        } else if (error.request) {
            console.error('Network Error:', error.request);
        } else {
            console.error('Error', error.message);
        }
        return Promise.reject(error);
    }
);

export default apiClient;
