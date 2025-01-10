import bcrypt from 'bcryptjs'; // Add this import
import User from '../models/user.js';
import Product from '../models/product.js';
import Order from '../models/order.js';

export const createSeller = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const seller = await User.create({
      email,
      password: hashedPassword,
      username,
      role: 'seller'
    });

    res.status(201).json(seller);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await User.findById(sellerId);
    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({ message: 'Seller not found' });
    }

    await User.findByIdAndDelete(sellerId);
    res.status(200).json({ message: 'Seller deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    // Example: Total users, sellers, products, orders, etc.
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    res.status(200).json({
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};