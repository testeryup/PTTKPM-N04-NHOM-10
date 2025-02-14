import express from 'express';
import * as inventoryController from '../controllers/inventory.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Upload new inventory item
router.post('/', verifyToken, requireRole(['seller', 'admin']), inventoryController.uploadInventory);

// Get seller's inventory
router.get('/', verifyToken, requireRole(['seller', 'admin']), inventoryController.getSellerInventory);

router.get('/:skuId', verifyToken, requireRole(['seller', 'admin']), inventoryController.getInventoryBySkuId);

router.delete('/', verifyToken, requireRole(['seller', 'admin']), inventoryController.deleteInventoryById)
export default router;