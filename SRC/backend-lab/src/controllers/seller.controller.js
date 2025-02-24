import mongoose from 'mongoose';
import Product from '../models/product.js';
import SKU from '../models/sku.js';
import Order from '../models/order.js';
import User from '../models/user.js';
import Transaction from '../models/transaction.js';

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
        if (product.length > 0) {
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

export const getOrderDetail = async (req, res) => {
    try {
        const orderId = new mongoose.Types.ObjectId(req.params.orderId);
        const sellerId = new mongoose.Types.ObjectId(req.user.id);

        const order = await Order.aggregate([
            // Match the specific order
            {
                $match: {
                    _id: orderId
                }
            },
            // Lookup SKUs with product details
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
                                price: 1
                            }
                        }
                    ],
                    as: 'skuDetails'
                }
            },
            // Lookup inventories (sold accounts)
            {
                $lookup: {
                    from: 'inventories',
                    let: {
                        skuIds: '$skuDetails._id',
                        orderId: '$_id'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: ['$sku', '$$skuIds'] },
                                        { $eq: ['$order', '$$orderId'] },
                                        { $eq: ['$seller', sellerId] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                sku: 1,
                                credentials: 1,
                                status: 1,
                                createdAt: 1
                            }
                        }
                    ],
                    as: 'inventoryDetails'
                }
            },
            // Lookup buyer details
            {
                $lookup: {
                    from: 'users',
                    localField: 'buyer',
                    foreignField: '_id',
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                username: 1,
                                email: 1
                            }
                        }
                    ],
                    as: 'buyerDetails'
                }
            },
            {
                $unwind: '$buyerDetails'
            },
            // Final projection
            {
                $project: {
                    _id: 0,
                    orderId: '$_id',
                    buyer: '$buyerDetails',
                    total: 1,
                    status: 1,
                    paymentStatus: 1,
                    paymentMethod: 1,
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
                                skuDetails: {
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
                                        in: '$$skuInfo'
                                    }
                                },
                                quantity: '$$item.quantity',
                                price: '$$item.price',
                                soldAccounts: {
                                    $filter: {
                                        input: '$inventoryDetails',
                                        as: 'inv',
                                        cond: { $eq: ['$$inv.sku', '$$item.sku'] }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        ]).allowDiskUse(false);

        // Check if order exists and seller has items in it
        if (!order || order.length === 0 || !order[0].items.some(item => item.skuDetails)) {
            return res.status(404).json({
                errCode: 1,
                message: 'Order not found or unauthorized'
            });
        }

        // Filter out items that don't belong to the seller
        const sellerOrder = order[0];
        sellerOrder.items = sellerOrder.items.filter(item => item.skuDetails);

        return res.status(200).json({
            errCode: 0,
            message: 'Get order detail successfully',
            data: sellerOrder
        });

    } catch (error) {
        console.error('Error in getOrderDetail:', error);
        return res.status(500).json({
            errCode: 1,
            message: error.message || 'Internal server error'
        });
    }
};

export const createRefundTicket = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const orderId = new mongoose.Types.ObjectId(req.params.orderId);
        const sellerId = new mongoose.Types.ObjectId(req.user.id);
        const { reason } = req.body;

        // 1. Get order and validate
        const order = await Order.findOne({
            _id: orderId,
            status: 'completed',
            paymentStatus: 'completed'
        }).session(session);

        if (!order) {
            throw new Error('Order not found or cannot be refunded');
        }

        // 2. Verify seller owns items in the order
        const sellerItems = await SKU.aggregate([
            {
                $match: {
                    _id: { $in: order.items.map(item => item.sku) }
                }
            },
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
            }
        ]).session(session);

        if (!sellerItems.length) {
            throw new Error('No items found for this seller in the order');
        }

        // 3. Calculate refund amount for seller's items
        const refundAmount = order.items.reduce((total, item) => {
            const isSellersItem = sellerItems.some(sku =>
                sku._id.equals(item.sku) && sku.product.length > 0
            );
            return total + (isSellersItem ? item.price * item.quantity : 0);
        }, 0);

        // 4. Create refund transaction
        const [transaction] = await Transaction.create([{
            user: order.buyer,
            order: orderId,
            amount: refundAmount,
            type: 'refund',
            status: 'completed',
            metadata: {
                reason,
                seller: sellerId,
                items: sellerItems.map(sku => sku._id)
            }
        }], { session });

        // 5. Update user balance
        await User.findByIdAndUpdate(order.buyer, {
            $inc: { balance: refundAmount }
        }).session(session);

        // 6. Update order status
        await Order.findByIdAndUpdate(orderId, {
            status: 'refunded',
            $push: {
                refunds: {
                    transactionId: transaction._id,
                    seller: sellerId,
                    amount: refundAmount,
                    reason,
                    items: sellerItems.map(sku => sku._id)
                }
            }
        }).session(session);

        // 7. Update inventory status
        await Inventory.updateMany(
            {
                order: orderId,
                sku: { $in: sellerItems.map(sku => sku._id) }
            },
            {
                status: 'refunded'
            }
        ).session(session);

        await session.commitTransaction();

        return res.status(200).json({
            errCode: 0,
            message: 'Refund processed successfully',
            data: {
                refundId: transaction._id,
                amount: refundAmount
            }
        });

    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({
            errCode: 1,
            message: error.message || 'Failed to process refund'
        });
    } finally {
        session.endSession();
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const sellerId = new mongoose.Types.ObjectId(req.user.id);

        const now = new Date();
        const offset = now.getTimezoneOffset(); // Get local timezone offset in minutes

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        today.setMinutes(today.getMinutes() - offset); // Adjust for timezone

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - 7);

        const monthStart = new Date(today);
        monthStart.setMonth(monthStart.getMonth() - 1);
        // Main aggregation pipeline
        const stats = await Order.aggregate([
            // Join with SKUs and Products
            {
                $lookup: {
                    from: 'skus',
                    let: { orderSkus: '$items.sku' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ['$_id', '$$orderSkus'] }
                            }
                        },
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
                    as: 'sellerSkus'
                }
            },
            // Only include orders with seller's items
            {
                $match: {
                    'sellerSkus': { $ne: [] },
                    status: 'completed'
                }
            },
            // Create different time period stats
            {
                $facet: {
                    today: [
                        {
                            $match: {
                                updatedAt: {
                                    $gte: today,
                                    $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                revenue: { $sum: '$total' },
                                orders: { $sum: 1 },
                                customers: { $addToSet: '$buyer' }
                            }
                        }
                    ],
                    yesterday: [
                        {
                            $match: {
                                updatedAt: {
                                    $gte: yesterday,
                                    $lt: today
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                revenue: { $sum: '$total' },
                                orders: { $sum: 1 }
                            }
                        }
                    ],
                    week: [
                        {
                            $match: {
                                updatedAt: { $gte: weekStart }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                revenue: { $sum: '$total' },
                                orders: { $sum: 1 }
                            }
                        }
                    ],
                    month: [
                        {
                            $match: {
                                updatedAt: { $gte: monthStart }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                revenue: { $sum: '$total' },
                                orders: { $sum: 1 }
                            }
                        }
                    ],
                    // Recent orders
                    recentOrders: [
                        {
                            $sort: { updatedAt: -1 }
                        },
                        {
                            $limit: 5
                        },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'buyer',
                                foreignField: '_id',
                                as: 'buyer'
                            }
                        },
                        {
                            $unwind: '$buyer'
                        },
                        {
                            $project: {
                                orderId: '$_id',
                                buyerName: '$buyer.username',
                                total: 1,
                                status: 1,
                                updatedAt: 1
                            }
                        }
                    ],
                    // Daily sales chart data
                    salesChart: [
                        {
                            $match: {
                                updatedAt: { $gte: monthStart }
                            }
                        },
                        {
                            $group: {
                                _id: {
                                    $dateToString: {
                                        format: '%Y-%m-%d',
                                        date: '$updatedAt'
                                    }
                                },
                                sales: { $sum: '$total' },
                                orders: { $sum: 1 }
                            }
                        },
                        { $sort: { '_id': 1 } }
                    ]
                }
            }
        ]);

        // Get top products
        const topProducts = await SKU.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    pipeline: [
                        { $match: { seller: sellerId } }
                    ],
                    as: 'product'
                }
            },
            {
                $match: {
                    'product': { $ne: [] }
                }
            },
            {
                $sort: { 'sales.revenue': -1 }
            },
            {
                $limit: 3
            },
            {
                $project: {
                    id: '$_id',
                    name: { $arrayElemAt: ['$product.name', 0] },
                    sku: '$name',
                    soldCount: '$sales.count',
                    revenue: '$sales.revenue'
                }
            }
        ]);

        // Format response data
        const formatMetric = (current, previous) => ({
            value: current || 0,
            change: previous ? ((current - previous) / previous * 100).toFixed(1) : 0
        });

        const todayStats = stats[0].today[0] || { revenue: 0, orders: 0, customers: [] };
        const yesterdayStats = stats[0].yesterday[0] || { revenue: 0, orders: 0 };
        const weekStats = stats[0].week[0] || { revenue: 0, orders: 0 };
        const monthStats = stats[0].month[0] || { revenue: 0, orders: 0 };

        const salesChartData = await generateTimelineSeries(stats[0].salesChart, monthStart, today);

        const response = {
            revenue: {
                today: todayStats.revenue,
                yesterday: yesterdayStats.revenue,
                week: weekStats.revenue,
                month: monthStats.revenue,
                change: formatMetric(todayStats.revenue, yesterdayStats.revenue).change
            },
            orders: {
                today: todayStats.orders,
                yesterday: yesterdayStats.orders,
                week: weekStats.orders,
                month: monthStats.orders,
                change: formatMetric(todayStats.orders, yesterdayStats.orders).change
            },
            products: {
                sold: weekStats.orders,
                lastPeriod: yesterdayStats.orders,
                change: formatMetric(weekStats.orders, yesterdayStats.orders).change,
                inventory: await SKU.countDocuments({
                    'product.seller': sellerId,
                    status: 'available'
                })
            },
            customers: {
                new: todayStats.customers?.length || 0,
                lastPeriod: yesterdayStats.orders,
                change: formatMetric(todayStats.customers?.length || 0, yesterdayStats.orders).change,
                returning: await Order.countDocuments({
                    buyer: { $in: todayStats.customers || [] },
                    updatedAt: { $lt: today }
                })
            },
            recentOrders: stats[0].recentOrders,
            topProducts,
            salesChart: {
                today: salesChartData.today,
                week: salesChartData.week,
                month: salesChartData.month
            }
        };

        return res.status(200).json({
            errCode: 0,
            message: 'Dashboard statistics retrieved successfully',
            data: response
        });

    } catch (error) {
        console.error('Error in getDashboardStats:', error);
        return res.status(500).json({
            errCode: 1,
            message: error.message || 'Internal server error'
        });
    }
};

// Helper function to generate timeline series with empty values for missing dates
const generateTimelineSeries = async (data, startDate, endDate) => {
    const series = {
        today: [],
        week: [],
        month: []
    };

    // Helper to format date to YYYY-MM-DD
    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    // Generate hourly intervals for today
    const todayStr = formatDate(new Date());
    const todayStart = new Date(todayStr);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    // Create empty hourly buckets
    const hourlyData = {};
    for (let h = 0; h < 24; h++) {
        const time = `${h.toString().padStart(2, '0')}:00`;
        hourlyData[time] = 0;
    }

    // If we have data for today, aggregate it by hour
    if (data.some(d => d._id === todayStr)) {
        const hourlyStats = await Order.aggregate([
            {
                $match: {
                    updatedAt: {
                        $gte: todayStart,
                        $lt: todayEnd
                    },
                    'sellerSkus': { $ne: [] },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: {
                        hour: { $hour: '$updatedAt' }
                    },
                    sales: { $sum: '$total' }
                }
            }
        ]);

        // Fill in the actual hourly data
        hourlyStats.forEach(stat => {
            const hour = stat._id.hour.toString().padStart(2, '0');
            hourlyData[`${hour}:00`] = stat.sales;
        });
    }

    // Convert the hourly data object to array format
    series.today = Object.entries(hourlyData).map(([time, sales]) => ({
        time,
        sales
    }));

    // Generate daily intervals for week
    const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = formatDate(date);
        const entry = data.find(d => d._id === dateStr);

        series.week.push({
            time: weekDays[date.getDay()],
            sales: entry?.sales || 0
        });
    }

    // Generate weekly intervals for month
    const weeks = Math.ceil((endDate - startDate) / (7 * 24 * 60 * 60 * 1000));
    for (let i = 0; i < weeks; i++) {
        const weekStart = new Date(startDate);
        weekStart.setDate(weekStart.getDate() + (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const weekSales = data
            .filter(d => {
                const date = new Date(d._id);
                return date >= weekStart && date <= weekEnd;
            })
            .reduce((sum, d) => sum + d.sales, 0);

        series.month.push({
            time: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
            sales: weekSales
        });
    }

    return series;
};

export const createWithdrawalRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if(!user || user.status !== 'active'){
            throw new Error("User not found or suspended")
        }
        const amount = req.body.amount;
        if(!amount){
            return res.status(401).json({
                errCode: 1,
                message: 'Missing input parameter'
            })
        }


        if(amount > user.amount){
            throw new Error("Amount must be below the balance")
        }

        const transaction = await Transaction.create({
            user: new mongoose.Types.ObjectId(userId),
            amount: amount,
            type: 'withdrawal',
            status: 'pending'
        });
        if(transaction){
            return res.status(200).json({
                errCode: 0,
                message: 'Created withdrawal successfully',
                transaction
            })
        }
        else{
            console.log("transaction error:", transaction);
            throw new Error("Something went wrong...");
        }
    } catch (error) {
        return res.status(500).json({
            errCode: 1,
            message: error.message
        })
    }
}

export const getWidthdrawlRequests = async (req, res) => {
    try {
        const sellerId = new mongoose.Types.ObjectId(req.user.id);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status?.toLowerCase() || 'all';
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder || 'desc';

        // Build match condition
        const matchCondition = {
            user: sellerId,
            type: 'withdrawal'
        };

        if (status !== 'all') {
            matchCondition.status = status;
        }

        // Get total count for pagination
        const totalRequests = await Transaction.countDocuments(matchCondition);

        // Get withdrawal requests with pagination
        const requests = await Transaction.aggregate([
            {
                $match: matchCondition
            },
            {
                $addFields: {
                    createdAtDate: { 
                        $dateToString: { 
                            format: "%Y-%m-%d %H:%M:%S",
                            date: "$createdAt"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    amount: 1,
                    status: 1,
                    createdAt: 1,
                    createdAtDate: 1,
                    'metadata.rejectionReason': 1
                }
            },
            {
                $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
            },
            {
                $skip: (page - 1) * limit
            },
            {
                $limit: limit
            }
        ]);

        // Get status counts
        const statusCounts = await Transaction.aggregate([
            {
                $match: {
                    user: sellerId,
                    type: 'withdrawal'
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalRequests / limit);
        const hasNext = page * limit < totalRequests;
        const hasPrev = page > 1;

        // Format status statistics
        const statusStats = {
            all: {
                count: statusCounts.reduce((sum, s) => sum + s.count, 0),
                amount: statusCounts.reduce((sum, s) => sum + s.totalAmount, 0)
            }
        };
        statusCounts.forEach(s => {
            statusStats[s._id] = {
                count: s.count,
                amount: s.totalAmount
            };
        });

        return res.status(200).json({
            errCode: 0,
            message: "Get withdrawal requests successfully",
            data: {
                requests,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: totalRequests,
                    itemsPerPage: limit,
                    hasNext,
                    hasPrev
                },
                filters: {
                    status: {
                        current: status,
                        available: statusStats
                    },
                    sort: {
                        by: sortBy,
                        order: sortOrder
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error in getWidthdrawlRequest:', error);
        return res.status(500).json({
            errCode: 1,
            message: error.message || 'Internal server error'
        });
    }
};