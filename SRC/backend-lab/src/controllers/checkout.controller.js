import mongoose from "mongoose"
import SKU from "../models/sku";
import User from "../models/user";
import Order from "../models/order";
import Transaction from "../models/transaction";

export const initiateCheckout = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { items, paymentMethod } = req.body;
        const userId = req.user.id;
        for (const item of items) {
            const sku = await SKU.findById(item.skuId);
            if (!sku || sku.stock < item.quantity) {
                throw new Error(`Insufficient stock for SKU: ${sku.name}`)
            }
        }

        const orderItems = await Promise.all(items.map(async (item) => {
            const sku = await SKU.findById(item.skuId);
            return {
                sku: item.skuId,
                quantity: item.quantity,
                price: sku.price
            };
        }));

        const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        if (paymentMethod === 'balance') {
            const user = await User.findById(userId);
            if (user.balance < total) {
                throw new Error("Insufficient balance");
            }
        }

        const order = await Order.create({
            buyer: userId,
            items: orderItems,
            total: total,
            paymentMethod: paymentMethod,
            status: 'pending'
        });


        const transaction = await Transaction.create({
            user: userId,
            order: order._id,
            amount: total,
            type: 'purchase',
            status: 'pending'
        });

        await session.commitTransaction();
        return res.status(200).json({
            errCode: 0,
            data: {
                order,
                transaction
            }
        });
    } catch (error) {
        session.abortTransaction();
        return res.status(500).json({
            errCode: 1,
            message: error.message
        });
    }
    finally {
        session.endSession();
    }
}


