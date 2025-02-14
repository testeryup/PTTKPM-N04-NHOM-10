import mongoose from 'mongoose';
import Product from '../models/product.js';
import SKU from '../models/sku.js';
import Order from '../models/order.js';
export const getAllProductWithAllImages = async (req, res) => {
    try {
        const { id } = req.user;
        const products = await Product.find({ seller: id }).select('image');
        if (!products) {
            return res.status(200).json({
                errCode: 1,
                message: "No product found"
            })
        }

        res.status(200).json({
            errCode: 0,
            products
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            {
                $match: {
                    seller: new mongoose.Types.ObjectId(req.user.id)
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
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            {
                $unwind: '$categoryInfo'
            },
            {
                $addFields: {
                    totalSales: {
                        count: { $sum: '$skus.sales.count' },
                        revenue: { $sum: '$skus.sales.revenue' }
                    },
                    totalStock: { $sum: '$skus.stock' },
                    thumbnail: { $arrayElemAt: ['$images', 0] }
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    category: '$categoryInfo.name',
                    subcategory: 1,
                    thumbnail: 1,
                    totalSales: 1,
                    totalStock: 1,

                }
            }
        ]);

        return res.status(200).json({
            errCode: 0,
            data: products
        });
    } catch (error) {
        return res.status(500).json({
            errCode: 1,
            message: error.message
        });
    }
};
export const deleteProduct = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const productId = req.params.id;
        const sellerId = req.user.id;

        // Delete product
        const product = await Product.findOneAndDelete({
            _id: new mongoose.Types.ObjectId(productId),
            seller: new mongoose.Types.ObjectId(sellerId)
        }).session(session);

        if (!product) {
            throw new Error('Product not found or unauthorized');
        }

        // Delete associated SKUs
        await SKU.deleteMany({ 
            product: product._id 
        }).session(session);

        await session.commitTransaction();
        
        return res.status(200).json({
            errCode: 0,
            message: "Successfully deleted product"
        });

    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({
            errCode: 1,
            message: error.message
        });
    } finally {
        session.endSession();
    }
};

export const getProductById = async (req, res) => {
    try {
        const productId = req.params.id;
        const sellerId = req.user.id;
        // console.log("check:", productId, sellerId);
        const product = await Product.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(productId),
                    seller: new mongoose.Types.ObjectId(sellerId)
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
                $project: {
                    name: 1,
                    description: 1,
                    category: 1,
                    subcategory: 1,
                    images: 1,
                    'skus.name': 1,
                    'skus.price': 1,
                    'skus.stock': 1
                }
            },
            {
                $limit: 1
            }
        ]);
        if(product.length > 0){
            return res.status(200).json({
                errCode: 0,
                data: product[0]
            })
        }
        return res.status(200).json({
            errCode: 1,
            message: 'Product not found'
        });
        
    } catch (error) {
        return res.status(500).json(error);
    }
}

const VALID_ORDER_STATUSES = ['pending', 'processing', 'completed', 'canceled', 'refunded'];

export const getSellerOrders = async (req, res) => {
    try {
        // 1. Parse parameters
        const sellerId = new mongoose.Types.ObjectId(req.user.id);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status?.toLowerCase() || 'all';

        // 2. Validate status
        if (status !== 'all' && !VALID_ORDER_STATUSES.includes(status)) {
            return res.status(400).json({
                errCode: 1,
                message: `Invalid status. Must be one of: all, ${VALID_ORDER_STATUSES.join(', ')}`
            });
        }

        // 3. Build base match condition
        const matchCondition = {
            'skuDetails.seller': sellerId
        };
        if (status !== 'all') {
            matchCondition.status = status;
        }

        // 4. Get total count
        const totalOrders = await Order.aggregate([
            {
                $lookup: {
                    from: 'skus',
                    localField: 'items.sku',
                    foreignField: '_id',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'products',
                                localField: 'product',
                                foreignField: '_id',
                                pipeline: [
                                    {
                                        $match: { seller: sellerId }
                                    }
                                ],
                                as: 'product'
                            }
                        },
                        {
                            $match: {
                                'product': { $ne: [] }
                            }
                        }
                    ],
                    as: 'skuDetails'
                }
            },
            {
                $match: {
                    'skuDetails': { $ne: [] }
                }
            },
            {
                $count: 'total'
            }
        ]);

        // 5. Main aggregation pipeline
        const orders = await Order.aggregate([
            // First lookup to get SKUs with seller's products
            {
                $lookup: {
                    from: 'skus',
                    localField: 'items.sku',
                    foreignField: '_id',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'products',
                                localField: 'product',
                                foreignField: '_id',
                                as: 'productDetails'
                            }
                        },
                        {
                            $unwind: '$productDetails'
                        },
                        {
                            $match: {
                                'productDetails.seller': sellerId
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                productName: '$productDetails.name',
                                seller: '$productDetails.seller'
                            }
                        }
                    ],
                    as: 'skuDetails'
                }
            },
            // Match orders that have seller's products
            {
                $match: matchCondition
            },
            // Sort and paginate
            {
                $sort: { _id: -1 }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            // Final projection
            {
                $project: {
                    _id: 0,
                    orderId: '$_id',
                    buyerId: '$buyer',
                    total: 1,
                    status: 1,
                    paymentStatus: 1,
                    createdAt: {
                        $dateToString: {
                            date: { $toDate: "$_id" },
                            format: "%Y-%m-%dT%H:%M:%S.%LZ"
                        }
                    },
                    items: {
                        $map: {
                            input: '$items',
                            as: 'item',
                            in: {
                                productName: {
                                    $let: {
                                        vars: {
                                            skuInfo: {
                                                $first: {
                                                    $filter: {
                                                        input: '$skuDetails',
                                                        as: 'sku',
                                                        cond: { $eq: ['$$sku._id', '$$item.sku'] }
                                                    }
                                                }
                                            }
                                        },
                                        in: '$$skuInfo.productName'
                                    }
                                },
                                skuName: {
                                    $let: {
                                        vars: {
                                            skuInfo: {
                                                $first: {
                                                    $filter: {
                                                        input: '$skuDetails',
                                                        as: 'sku',
                                                        cond: { $eq: ['$$sku._id', '$$item.sku'] }
                                                    }
                                                }
                                            }
                                        },
                                        in: '$$skuInfo.name'
                                    }
                                },
                                price: '$$item.price',
                                quantity: '$$item.quantity'
                            }
                        }
                    }
                }
            }
        ]).allowDiskUse(false);

        // 6. Calculate pagination metadata
        const total = totalOrders[0]?.total || 0;
        const totalPages = Math.ceil(total / limit);
        const hasNext = page * limit < total;
        const hasPrev = page > 1;

        // 7. Return response
        return res.status(200).json({
            errCode: 0,
            message: "Get orders successfully",
            data: {
                orders,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: total,
                    itemsPerPage: limit,
                    hasNext,
                    hasPrev
                },
                filter: {
                    status,
                    availableStatuses: ['all', ...VALID_ORDER_STATUSES]
                }
            }
        });

    } catch (error) {
        console.error('Error in getSellerOrders:', error);
        return res.status(500).json({
            errCode: 1,
            message: error.message || 'Internal server error'
        });
    }
};