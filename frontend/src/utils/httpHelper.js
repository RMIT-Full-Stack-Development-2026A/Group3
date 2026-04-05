/**
 * HTTP Client Utility
 * Provides axios instance with interceptors.
 */
import axios from 'axios';

import { API_CONFIG } from '../configs/api.config';

const axiosInstance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: 10000,
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    const devUserId = localStorage.getItem('userId') || import.meta.env.VITE_DEV_USER_ID;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (!token && devUserId) {
        config.headers['x-user-id'] = devUserId;
    }

    return config;
});

const httpClient = {
    get: (url, config = {}) => axiosInstance.get(url, config),
    post: (url, data = {}, config = {}) => axiosInstance.post(url, data, config),
    put: (url, data = {}, config = {}) => axiosInstance.put(url, data, config),
    delete: (url, config = {}) => axiosInstance.delete(url, config)
};

export default httpClient;
