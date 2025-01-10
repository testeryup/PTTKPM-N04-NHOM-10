import Product from '../models/product.js';

export const createProduct = async (req, res) => {
    try {
        const { name, category, skus } = req.body;
        const product = await Product.create({
            name,
            category,
            skus,
            seller: req.user.id
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('seller', 'username email');
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};