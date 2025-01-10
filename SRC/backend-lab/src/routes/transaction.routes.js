import express from 'express';
import * as transactionController from '../controllers/transaction.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Get user's transactions
router.get('/', verifyToken, requireRole(['user', 'seller', 'admin']), transactionController.getUserTransactions);

// Admin: Get all transactions
router.get('/all', verifyToken, requireRole(['admin']), transactionController.getAllTransactions);

export default router;