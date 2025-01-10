import Transaction from '../models/transaction.js';
import Order from '../models/order.js';
import User from '../models/user.js';

export const getUserTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await Transaction.find({ user: userId })
            .populate('order', 'total status')
            .sort({ createdAt: -1 });

        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('user', 'username email')
            .populate('order', 'total status')
            .sort({ createdAt: -1 });

        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};