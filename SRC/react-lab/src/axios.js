// src/axios.js
import axios from 'axios';
import authApi from './services/authApi'; // Separate Axios instance

const api = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true,
});

// Function to set or remove the Authorization header
export const setAuthToken = (token) => {
    if (token) {
        console.log("Setting auth token in axios:", token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log("Headers after setting:", api.defaults.headers);
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    const now = Date.now();
    failedQueue = failedQueue.filter(req => now - req.timestamp < 10000);
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        if (!error.response) {
            return Promise.reject(new Error('Network Error'));
        }

        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            // Prevent refresh token loop
            if (originalRequest.url === '/api/auth/refresh') {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve,
                        reject,
                        timestamp: Date.now()
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await authApi.get('/api/auth/refresh');
                const newToken = response.data.token;

                setAuthToken(newToken);
                processQueue(null, newToken);

                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;