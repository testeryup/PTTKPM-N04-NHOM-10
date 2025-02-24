import express from 'express';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import * as sellerController from '../controllers/seller.controller.js';
import * as productController from '../controllers/product.controller.js';

const router = express.Router();
router.get('/products', verifyToken, requireRole(['seller', 'admin']), sellerController.getAllProducts);
router.delete('/products/:id', verifyToken, requireRole(['seller', 'admin']), sellerController.deleteProduct); 
router.get('/products/:id', verifyToken, requireRole(['seller', 'admin']), sellerController.getProductById); 
router.get('/orders', verifyToken, requireRole(['seller', 'admin']), sellerController.getSellerOrders); 
router.get('/orders/:orderId', verifyToken, requireRole('seller', 'admin'), sellerController.getOrderDetail);
router.get('/orders/refund/orderId', verifyToken, requireRole(['seller', 'admin']), sellerController.createRefundTicket)
router.get('/dashboard/stats', verifyToken, requireRole(['seller']), sellerController.getDashboardStats);

router.post('/transactions/withdraw', verifyToken, requireRole(['seller']), sellerController.createWithdrawalRequest);
router.get('/transactions', verifyToken, requireRole(['seller']), sellerController.getWidthdrawlRequests);
export default router;