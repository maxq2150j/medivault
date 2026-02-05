import axios from 'axios';

const api = axios.create({
    // Backend MediVault Spring Boot base URL
    baseURL: 'http://localhost:8080/api',
});


api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token');
    console.log('[API Interceptor] URL:', config.url);
    console.log('[API Interceptor] Token from sessionStorage:', token ? 'Present (' + token.substring(0, 20) + '...)' : 'Missing');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[API Interceptor] Added Authorization header:', config.headers.Authorization.substring(0, 30) + '...');
    }
    console.log('[API Interceptor] Final headers:', config.headers);
    return config;
});

// Global response interceptor to handle auth errors (expired/invalid token)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const url = error?.config?.url || '';

        // For login / auth requests, let the page handle errors (e.g. show Toast)
        const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/login/google');

        if (!isAuthRequest && (status === 401 || status === 403)) {
            console.warn('[API Interceptor] Auth error status:', status, '- clearing auth and redirecting to login');
            try {
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('role');
                sessionStorage.removeItem('specificId');
            } catch (e) {
                console.error('[API Interceptor] Failed to clear localStorage:', e);
            }
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
