import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Get admin statistics
router.get('/stats', verifyToken, requireRole(['admin']), adminController.getAdminStats);
// Create a new seller
router.post('/create-seller', verifyToken, requireRole(['admin']), adminController.createSeller);

// Delete a seller
router.delete('/delete-seller/:sellerId', verifyToken, requireRole(['admin']), adminController.deleteSeller);
router.get('/users', verifyToken, requireRole(['admin']), adminController.getUsers);

router.put('/users/role',
    verifyToken,
    requireRole(['admin']),
    adminController.changeUserRole
);

router.put('/users/status',
    verifyToken,
    requireRole(['admin']),
    adminController.changeUserStatus
);
router.put('/users/:userId',
    verifyToken,
    requireRole(['admin']),
    adminController.updateUser
);

router.get('/products', verifyToken, requireRole(['admin']), adminController.getProducts);
router.put('/products/:productId/status', verifyToken, requireRole(['admin']), adminController.changeProductStatus);
router.get('/products/stats', verifyToken, requireRole(['admin']), adminController.getProductStats);

router.get('/transactions/stats', verifyToken, requireRole(['admin']), adminController.getTransactionStats);
router.put('/transactions/:transactionId/approve', verifyToken, requireRole(['admin']), adminController.approveWithdraw);
router.put('/transactions/:transactionId/reject', verifyToken, requireRole(['admin']), adminController.rejectWithdraw);
router.post('/refunds', verifyToken, requireRole(['admin']), adminController.processRefund);

export default router;