import axios from 'axios';

const authApi = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

export default authApi;