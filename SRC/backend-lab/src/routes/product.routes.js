import express from 'express';
import * as productController from '../controllers/product.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', verifyToken, requireRole(['seller', 'admin']), productController.createProduct);
router.get('/', productController.getProducts);
router.delete('/delete', verifyToken, requireRole(['seller', 'admin']), productController.deleteProduct)
export default router;