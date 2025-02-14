import express from 'express';
import * as skuController from '../controllers/sku.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', skuController.getSkuNames)

export default router;