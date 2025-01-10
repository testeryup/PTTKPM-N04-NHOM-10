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

// Flag to check if token is being refreshed
let isRefreshing = false;
let failedQueue = [];

// Function to process the queue of failed requests
const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const originalRequest = error.config;

        // Check if the error is due to unauthorized access
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If token is already being refreshed, queue the request
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                .then((token) => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return api(originalRequest);
                })
                .catch((err) => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt to refresh the token using authApi
                const response = await authApi.get('/api/auth/refresh');
                const newToken = response.data.token;

                // Update the Authorization header with the new token
                setAuthToken(newToken);

                // Process the queued requests
                processQueue(null, newToken);

                // Retry the original request with the new token
                originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
                return api(originalRequest);
            } catch (err) {
                // If token refresh fails, reject all queued requests
                processQueue(err, null);

                // Dispatch logout action to clear auth state
                // **Do not import store here; handle it via middleware instead**
                // **Instead, emit an event or use a callback in middleware**

                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;