import axios from 'axios';
import { API_CONFIG } from '../../configs/apiConfig';

import { useAuthStore } from '../../app/store/authStore';

const httpUtil = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token
httpUtil.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors
httpUtil.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized (e.g., logout)
            useAuthStore.getState().actions.logout();
        }
        return Promise.reject(error.response?.data || error);
    }
);

export default httpUtil;
