import express from 'express';
import * as productController from '../controllers/product.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', verifyToken, requireRole(['seller', 'admin']), productController.upsertProduct);
router.get('/', productController.getProducts);
router.get('/:productId', productController.getProductById);
export default router;