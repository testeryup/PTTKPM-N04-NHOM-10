import Product from '../models/product.js';
import SKU from '../models/sku.js';

import mongoose from 'mongoose';


export const upsertProduct = async (req, res) => {
    try {
        const { name, images, description, category, subcategory, skus } = req.body;
        let id = req.body.id
        console.log("check update:", id);
        // Validate image size
        const MAX_SIZE = 5 * 1024 * 1024;
        if (images?.some(img => {
            const base64Length = img.length - img.indexOf(',') - 1;
            const sizeInBytes = (base64Length * 3) / 4;
            return sizeInBytes > MAX_SIZE;
        })) {
            return res.status(400).json({
                errCode: 1,
                message: 'Image size should not exceed 5MB'
            });
        }

        // Check if product exists
        const existingProduct = id ? await Product.findById(id) : null;
        // Create/Update product
        const product = await Product.findOneAndUpdate(
            existingProduct ? { _id: id } : { name },
            {
                name,
                images,
                description,
                category,
                subcategory,
                seller: req.user.id,
                createdAt: new Date()
            },
            {
                upsert: true,
                new: true
            }
        );

        // Handle SKUs
        if (existingProduct) {
            // Update: Remove old SKUs first
            await SKU.deleteMany({ product: product._id });
        }

        // Validate new SKUs
        const skuValidationPromises = skus.map(sku => {
            const newSku = new SKU({
                ...sku,
                product: product._id
            });
            return newSku.validate();
        });
        await Promise.all(skuValidationPromises);

        // Create new SKUs
        const skusCreated = await SKU.insertMany(
            skus.map(sku => ({
                ...sku,
                product: product._id
            }))
        );

        return res.status(existingProduct ? 200 : 201).json({
            errCode: 0,
            message: `Successfully ${existingProduct ? 'updated' : 'created'} product with SKUs`,
            data: {
                product,
                skus: skusCreated
            }
        });

    } catch (error) {
        return res.status(500).json({
            errCode: 1,
            message: error.message
        });
    }
};

export const getProducts = async (req, res) => {

    try {
        const products = await Product.aggregate([
            {
                $match: {
                    category: { $exists: true }
                }
            },
            {
                $lookup: {
                    from: 'skus',
                    let: { productId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$product', '$$productId'] },
                                status: 'available'
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                price: 1,
                                stock: 1,
                                status: 1,
                            }
                        }
                    ],
                    as: 'skus'
                }
            },

            {
                $lookup: {
                    from: 'users',
                    let: { sellerId: '$seller' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$_id', '$$sellerId'] },
                                status: 'active'
                            }
                        },
                        {
                            $project: {
                                username: 1,
                                email: 1,
                                _id: 1
                            }
                        }
                    ],
                    as: 'seller'
                }
            },
            {
                $addFields: {
                    thumbnail: {
                        $ifNull: [{ $arrayElemAt: ['$images', 0] }, null]
                    },
                    totalStock: {
                        $ifNull: [{ $sum: '$skus.stock' }, 0]
                    },
                    minPrice: {
                        $ifNull: [{ $min: '$skus.price' }, null]
                    },
                    seller: { $arrayElemAt: ['$seller', 0] } // Flatten seller array
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    category: 1,
                    subcategory: 1,
                    seller: 1,
                    'skus': 1,
                    minPrice: 1,
                    totalStock: 1,
                    thumbnail: 1,
                }
            },
            { $limit: 50 }
        ])
        res.status(200).json({
            errCode: 0,
            data: products
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getProductById = async (req, res) => {
    try {
        const productId = req.params.productId;
        // console.log("check:", productId, sellerId);
        const product = await Product.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(productId),
                }
            },
            {
                $lookup: {
                    from: 'skus',
                    localField: '_id',
                    foreignField: 'product',
                    as: 'skus'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    let: { sellerId: '$seller' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$_id', '$$sellerId'] },
                                status: 'active'
                            }
                        },
                        {
                            $project: {
                                username: 1,
                                email: 1,
                                _id: 1
                            }
                        }
                    ],
                    as: 'seller'
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    category: 1,
                    subcategory: 1,
                    images: 1,
                    'skus._id': 1,
                    'skus.name': 1,
                    'skus.price': 1,
                    'skus.stock': 1,
                    seller: { $arrayElemAt: ['$seller', 0] }
                }
            },
            {
                $limit: 1
            }
        ]);

        return res.status(200).json({
            errCode: 0,
            data: product[0]
        })
    } catch (error) {
        return res.status(500).json(error);
    }
}
