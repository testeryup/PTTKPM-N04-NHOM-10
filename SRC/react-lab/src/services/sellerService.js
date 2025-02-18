import api from '../axios';

export const deleteProduct = (id) => {
    return api.delete(`/api/seller/products/${id}`)
}

export const getAllProducts = () => {
    return api.get(`/api/seller/products`);
}

export const uploadInventory = (data) => {
    return api.post(`/api/inventory`, data);
}

export const getInventoryList = (inventoryId) => {
    return api.get(`/api/inventory/${inventoryId}`);
}
export const deleteInventoryById = (inventoryId, skuId) => {
    return api.delete(`/api/inventory`, {
        data: {
            inventoryId,
            skuId
        }
    });
}

export const getOrders = ({page, limit, status='all'}) => {
    return api.get(`/api/seller/orders?page=${page}&limit=${limit}&status=${status}`);
}

export const refundOrder = () => {

}

export const reportOrder = () => {

}

export const getOrderDetail = (orderId) => {
    return api.get(`/api/seller/orders/${orderId}`);
};

export const getSellerStats = () => {
    return api.get(`/api/seller/dashboard/stats`);
}
const sellerService = {
    getAllProducts, deleteProduct, uploadInventory, getInventoryList, deleteInventoryById, getOrders, getSellerStats
}

export default sellerService;