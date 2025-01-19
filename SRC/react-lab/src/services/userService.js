import api from '../axios';

export const getUserProfile = () => {
    // console.log("check api header when get profile:", api.defaults.headers);
    return api.get('/api/user/profile');
}

export const getCategory = () => {
    return api.get('/api/category');
}
export const createProduct = (data) => {
    return api.post('/api/products', data);
}
const userService = {
    getUserProfile, getCategory, createProduct
}
export default userService;