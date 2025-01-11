// src/middlewares/authMiddleware.js
import { setAuthToken } from '../axios';
import { logout } from '../features/auth/authSlice';

export const authMiddleware = (storeAPI) => (next) => (action) => {
    // Handle successful login
    console.log("Action in middleware:", action);
    if (action.type === 'auth/login/fulfilled' || action.type === 'auth/refreshToken/fulfilled' || action.type === 'auth/register/fulfilled') {
        console.log("Setting token in middleware:", action.payload.token);
        setAuthToken(action.payload.token);
    }

    // Handle successful logout
    if (action.type === 'auth/logout/fulfilled') {
        setAuthToken(null);
    }

    // Handle refreshToken rejected to trigger logout
    if (action.type === 'auth/refreshToken/rejected') {
        storeAPI.dispatch(logout());
    }

    return next(action);
};