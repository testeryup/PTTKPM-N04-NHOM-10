import Product from '../models/product.js';

export const createProduct = async (req, res) => {
    try {
        const { name, images, description, category, subcategory, skus } = req.body;
        
        // Validate image size
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        if (images.some(img => {
            const base64Length = img.length - img.indexOf(',') - 1;
            const sizeInBytes = (base64Length * 3) / 4;
            return sizeInBytes > MAX_SIZE;
        })) {
            return res.status(400).json({ 
                message: 'Image size should not exceed 5MB' 
            });
        }

        const product = await Product.create({
            name,
            images,
            description,
            category,
            subcategory,
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

export const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        const { id } = req.user;
        const product = await Product.findOneAndDelete({ id: productId, seller: id });
        if(!product){
            return res.status(200).json({
                errCode: 1,
                message: "No product found"
            })
        }
        
        res.status(200).json({
            errCode: 0,
            message: "Successfully deleted product"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}