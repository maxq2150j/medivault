import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5099/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    console.log('[API Interceptor] URL:', config.url);
    console.log('[API Interceptor] Token from localStorage:', token ? 'Present (' + token.substring(0, 20) + '...)' : 'Missing');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[API Interceptor] Added Authorization header:', config.headers.Authorization.substring(0, 30) + '...');
    }
    console.log('[API Interceptor] Final headers:', config.headers);
    return config;
});

export default api;
