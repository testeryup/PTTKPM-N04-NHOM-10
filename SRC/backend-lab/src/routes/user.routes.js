import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Get user profile
router.get('/profile', verifyToken, requireRole(['user', 'seller', 'admin']), userController.getUserProfile);
router.get('/balance', verifyToken, requireRole(['user', 'seller', 'admin']), userController.getUserBalance);

// Update user profile
router.put('/profile', verifyToken, requireRole(['user', 'seller', 'admin']), userController.updateUserProfile);

export default router;