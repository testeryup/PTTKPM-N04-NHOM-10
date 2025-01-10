import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Create a new seller
router.post('/create-seller', verifyToken, requireRole(['admin']), adminController.createSeller);

// Delete a seller
router.delete('/delete-seller/:sellerId', verifyToken, requireRole(['admin']), adminController.deleteSeller);

// Get admin statistics
router.get('/stats', verifyToken, requireRole(['admin']), adminController.getAdminStats);

export default router;