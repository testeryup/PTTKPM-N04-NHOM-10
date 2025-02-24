import mongoose from "mongoose";
import SKU from "../models/sku.js";
import User from "../models/user.js";
import Order from "../models/order.js";
import Transaction from "../models/transaction.js";
import Inventory from "../models/inventory.js";
//
// Be careful with this controller because we already changed the structure of sku and product!
//
export const createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { items } = req.body; // [{skuId, quantity}] from frontend cart
        if (!items) {
            throw new Error("Missing input parameters")
        }
        const userId = req.user.id;

        // 1. Validate stock and calculate total
        let total = 0;
        const orderItems = [];
        const credentialsList = [];
        for (const item of items) {
            const sku = await SKU.findOne({
                _id: item.skuId,
                stock: { $gte: item.quantity }
            }).session(session);

            if (!sku) {
                throw new Error(`Insufficient stock for SKU: ${item.skuId}`);
            }

            total += sku.price * item.quantity;
            orderItems.push({
                sku: sku._id,
                // skuName: sku.name,
                quantity: item.quantity,
                price: sku.price
            });
        }

        // 2. Check user balance
        const user = await User.findById(userId).session(session);
        if (user.balance < total) {
            throw new Error('Insufficient balance');
        }

        // 3. Create order
        const order = await Order.collection.insertOne({
            buyer: new mongoose.Types.ObjectId(userId),
            items: orderItems,
            total,
            status: 'processing',
            paymentStatus: 'completed',
            createdAt: new Date()
        }, { session });

        if (!order.insertedId) {
            throw new Error('Order creation failed - no ID returned');
        }
        // 4. Process payment and update stock
        await User.findByIdAndUpdate(userId, {
            $inc: { balance: -total }
        }).session(session);

        // 5. Update SKU stock and assign credentials
        for (const item of orderItems) {
            // Update SKU
            await SKU.findByIdAndUpdate(item.sku, {
                $inc: {
                    stock: -item.quantity,
                    'sales.count': item.quantity,
                    'sales.revenue': item.quantity * item.price
                }
            }).session(session);

            // Get and assign credentials
            const inventory = await Inventory.find({
                sku: item.sku,
                status: 'available'
            }).limit(item.quantity).session(session);

            await User.findByIdAndUpdate(inventory.seller, {
                $inc: {balance: +(item.quantity * item.price)}
            })
            credentialsList.push({
                skuId: item.sku,
                accounts: inventory.map(c => c.credentials)
            })

            await Inventory.updateMany(
                { _id: { $in: inventory.map(c => c._id) } },
                {
                    status: 'sold',
                    order: order.insertedId
                }
            ).session(session);


        }

        await Order.findOneAndUpdate({
            _id: order.insertedId
        }, {
            status: 'completed'
        }).session(session)
        const [transaction] = await Transaction.create([{
            user: userId,
            order: order.insertedId,
            amount: total,
            type: 'purchase',
            status: 'completed'
        }], { session });

        await session.commitTransaction();

        return res.status(200).json({
            errCode: 0,
            message: 'Order created successfully',
            data: {
                orderId: order.insertedId,
                total,
                credentials: credentialsList ?? 'not found',
                transactionId: transaction._id
            }

        });

    } catch (error) {
        console.log("check error", error)
        await session.abortTransaction();
        return res.status(500).json({
            errCode: 1,
            message: error.message
        });
    } finally {
        session.endSession();
    }
};

export const getOrderById = async (req, res) => {
    try {
        const orderId = new mongoose.Types.ObjectId(req.params.orderId);
        const userId = new mongoose.Types.ObjectId(req.user.id);
        if (!orderId || !userId) {
            throw new Error('Missing input parameter');
        }
        const order = await Order.aggregate([
            {
                $match: { _id: orderId, buyer: userId }
            },
            {
                $lookup: {
                    from: 'transactions',
                    localField: '_id',
                    foreignField: 'order',
                    pipeline: [
                        { $project: { _id: 1 } },
                        { $limit: 1 }
                    ],
                    as: 'transaction'
                }
            },
            {
                $lookup: {
                    from: 'skus',
                    localField: 'items.sku',
                    foreignField: '_id',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'products',
                                localField: 'product',  // field in SKU that references product
                                foreignField: '_id',
                                as: 'productDetails'
                            }
                        },
                        { $unwind: '$productDetails' },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                productId: '$productDetails._id',
                                productName: '$productDetails.name',
                                price: 1
                            }
                        }
                    ],
                    as: 'skuDetails'
                }
            },
            {
                $lookup: {
                    from: 'inventories',
                    let: { skuIds: '$skuDetails._id', orderId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: ['$sku', '$$skuIds'] },
                                        { $eq: ['$order', '$$orderId'] }
                                    ]
                                }

                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                sku: 1,
                                credentials: 1
                            }
                        }
                    ],
                    as: 'inventoryDetails'
                }
            },
            {
                $project: {
                    orderId: '$_id',
                    transactionId: { $arrayElemAt: ['$transaction._id', 0] },
                    total: 1,
                    paymentMethod: 1,
                    status: 1,
                    paymentStatus: 1,
                    skuDetails: 1,
                    inventoryDetails: 1,
                    createdAt: {
                        $dateToString: {
                            date: { $toDate: "$_id" }
                        }
                    }
                }
            },
            { $limit: 1 }
        ]).allowDiskUse(false);

        if (!order || order.length === 0) {
            throw new Error(`No order with id: ${orderId} found`);
        }

        return res.status(200).json({
            errCode: 0,
            message: 'Get order successfully',
            data: order[0]
        });
    } catch (error) {
        return res.status(500).json({
            errCode: 1,
            message: error.message
        });
    }
};

export const getAllOrders = async (req, res) => {

}
export const updateOrderStatus = async (req, res) => {

}

export const initialOrder = async (req, res) => {
    try {
        const { items } = req.body;
        const userId = req.user.id;

        if (!items.length) {
            return res.status(400).json({
                errCode: 1,
                message: "Empty cart"
            });
        }

        // validate input
        const skuIds = items.map(item => new mongoose.Types.ObjectId(item.skuId));
        const skus = await SKU.aggregate([
            {
                $match: { _id: { $in: skuIds } }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    price: 1,
                    stock: 1
                }
            }
        ]);
        const skuMap = new Map(skus.map(sku => [sku._id.toString(), sku]));
        let total = 0;

        // Validate stock and calculate total
        const insufficientItems = items.filter(item => {
            const sku = skuMap.get(item.skuId);
            if (!sku || sku.stock < item.quantity) {
                return true;
            }
            total += sku.price * item.quantity;
            return false;
        });

        if (insufficientItems.length) {
            return res.status(400).json({
                errCode: 1,
                message: `Insufficient stock for items: ${insufficientItems.map(item => item.skuId).join(', ')}`
            });
        }
        const user = await User.findById(userId).select('balance');
        if (user.balance < total) {
            return res.status(400).json({
                errCode: 1,
                message: 'Insufficient balance',
                data: {
                    required: total,
                    current: user.balance
                }
            });
        }

        return res.status(200).json({
            errCode: 0,
            message: 'Order validation successful',
            data: {
                total,
                items: items.map(item => ({
                    ...item,
                    price: skuMap.get(item.skuId).price,
                    name: skuMap.get(item.skuId).name
                }))
            }
        });
    } catch (error) {
        res.status(500).json({
            errCode: 1,
            message: error.message
        })
    }
}
const VALID_ORDER_STATUSES = ['pending', 'processing', 'completed', 'canceled', 'refunded'];

export const getAllUserOrders = async (req, res) => {
    try {
        // 1. Parse pagination and filter parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status?.toLowerCase() || 'all';
        const userId = new mongoose.Types.ObjectId(req.user.id);

        // 2. Validate status
        if (status !== 'all' && !VALID_ORDER_STATUSES.includes(status)) {
            return res.status(400).json({
                errCode: 1,
                message: `Invalid status. Must be one of: all, ${VALID_ORDER_STATUSES.join(', ')}`
            });
        }

        // 3. Build match condition
        const matchCondition = { buyer: userId };
        if (status !== 'all') {
            matchCondition.status = status;
        }

        // 4. Get total count for pagination
        const totalOrders = await Order.countDocuments(matchCondition);

        // 5. Main aggregation pipeline
        const orders = await Order.aggregate([
            // Match user's orders with status filter
            {
                $match: matchCondition
            },
            // Sort by newest first
            {
                $sort: {
                    _id: -1
                }
            },
            // Apply pagination
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            // Lookup SKUs with product details
            {
                $lookup: {
                    from: 'skus',
                    let: { skuList: '$items.sku' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ['$_id', '$$skuList'] }
                            }
                        },
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
                            $project: {
                                _id: 1,
                                name: 1,
                                productName: '$productDetails.name'
                            }
                        }
                    ],
                    as: 'skuDetails'
                }
            },
            // Final projection
            {
                $project: {
                    _id: 0,
                    orderId: '$_id',
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
        const totalPages = Math.ceil(totalOrders / limit);
        const hasNext = page * limit < totalOrders;
        const hasPrev = page > 1;

        // 7. Return formatted response
        return res.status(200).json({
            errCode: 0,
            message: "Get orders successfully",
            data: {
                orders,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: totalOrders,
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
        console.error('Error in getAllUserOrders:', error);
        return res.status(500).json({
            errCode: 1,
            message: error.message || 'Internal server error'
        });
    }
};