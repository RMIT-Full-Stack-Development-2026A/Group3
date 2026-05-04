/**
 * HTTP Client Utility
 * Provides axios instance with interceptors.
 */
import axios from 'axios';
import { API_CONFIG } from '../configs/api.config';

const client = axios.create({
    baseURL: API_CONFIG.BASE_URL
});

client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const httpClient = {
    get: (url, config) => client.get(url, config),
    post: (url, data, config) => client.post(url, data, config),
    put: (url, data, config) => client.put(url, data, config),
    delete: (url, config) => client.delete(url, config)
};

export default httpClient;
