import api from '../axios';

export const getUserProfile = () => {
    // console.log("check api header when get profile:", api.defaults.headers);
    return api.get('/api/user/profile');
}

export const getCategory = () => {
    return api.get('/api/category');
}
export const createOrUpdateProduct = (data) => {
    return api.post('/api/products', data);
}
export const getProductById = (id) => {
    return api.get(`/api/seller/products/${id}`);
}
export const userGetProductById = (id) => {
    return api.get(`/api/products/${id}`);
}
export const getProducts = () => {
    return api.get('/api/products');
}

export const initOrder = (items) => {
    return api.post('/api/orders/init', {items})
} 

export const createOrder = (items) => {
    return api.post('/api/orders', {items});
}

export const getSkuNames = (skus) => {
    return api.get('/api/sku', {items: skus});
}

export const getOrderById = (id) => {
    return api.get(`/api/orders/${id}`);
}

export const getOrders = ({page, limit, status='all'}) => {
    return api.get(`/api/orders?page=${page}&limit=${limit}&status=${status}`);
}

export const getUserBalance = () => {
    return api.get(`/api/user/balance`);
}

export const createPaymentLink = (amount) => {
    return api.post('/api/transactions/topup', {amount})
}
const userService = {
    getUserProfile, getCategory, createOrUpdateProduct, getProducts, userGetProductById, getSkuNames
}
export default userService;