import Inventory from '../models/inventory.js';
import Order from '../models/order.js';
import Product from '../models/product.js';

export const uploadInventory = async (req, res) => {
    try {
        const { productId, sku, credentials } = req.body;
        const sellerId = req.user.id;

        // Verify that the product belongs to the seller
        const product = await Product.findById(productId);
        if (!product || product.seller.toString() !== sellerId) {
            return res.status(403).json({ message: 'Unauthorized to add inventory to this product' });
        }

        const inventoryItem = await Inventory.create({
            product: productId,
            sku,
            credentials,
            seller: sellerId
        });

        res.status(201).json(inventoryItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSellerInventory = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const inventory = await Inventory.find({ seller: sellerId })
            .populate('product', 'name category sku');

        res.status(200).json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};