import Inventory from '../models/inventory.js';
import Order from '../models/order.js';
import Product from '../models/product.js';

export const createOrder = async (req, res) => {
    try {
        const { items } = req.body; // Array of { product, sku, quantity }
        const userId = req.user.id;

        // Validate items and calculate total
        let total = 0;
        const inventoryAssignments = [];

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.product}` });
            }

            const sku = product.skus.find(t => t.name === item.sku);
            if (!sku) {
                return res.status(400).json({ message: `sku not found: ${item.sku}` });
            }

            if (sku.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for product: ${product.name}, sku: ${sku.name}` });
            }

            total += sku.price * item.quantity;
        }

        // Create Order
        const order = await Order.create({
            buyer: userId,
            items,
            total,
            status: 'completed' // Assuming immediate completion for digital products
        });

        // Assign available digital accounts
        for (const item of items) {
            const availableAccounts = await Inventory.find({ product: item.product, sku: item.sku, status: 'available' }).limit(item.quantity);
            if (availableAccounts.length < item.quantity) {
                return res.status(400).json({ message: `Not enough available accounts for product: ${product.name}, sku: ${item.sku}` });
            }

            for (const account of availableAccounts) {
                account.status = 'sold';
                account.order = order._id;
                await account.save();
                inventoryAssignments.push(account);
            }

            // Deduct stock from products
            await Product.findByIdAndUpdate(item.product, {
                $inc: { 'skus.$[elem].stock': -item.quantity, totalSold: item.quantity }
            }, {
                arrayFilters: [{ 'elem.name': item.sku }],
                new: true
            });
        }

        res.status(201).json({ order, assignedAccounts: inventoryAssignments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.find({ buyer: userId })
            .populate('items.product', 'name category')
            .sort({ createdAt: -1 });

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('buyer', 'username email')
            .populate('items.product', 'name category')
            .sort({ createdAt: -1 });

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status;
        await order.save();

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};