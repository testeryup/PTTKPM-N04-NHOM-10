// src/services/authService.js
import api from '../axios';

const login = (email, password) => {
    return api.post('/api/auth/login', { email, password });
}

const register = (email, password, username) => {
    return api.post('/api/auth/register', { email, password, username });
}

const logout = () => {
    return api.get('/api/auth/logout');
}

const refresh = () => {
    // This will use authApi internally without causing circular dependency
    return import('./authApi').then(module => module.default.get('/api/auth/refresh'));
}

const authService = {
    login, register, logout, refresh
};

export default authService;