import mongoose, { overwriteMiddlewareResult } from "mongoose";
import Order from '../models/order';
import User from '../models/user';
import SKU from '../models/sku';
import Transaction from '../models/transaction';


export const processPayment = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const {orderId, transactionId} = req.body;
        const userId = req.user.id;

        const order = await Order.findById(orderId);
        if(!order || order.buyer.toString() !== userId){
            throw new Error("Order not found or unauthorized")
        } 
        

        for(const item of order.items){
            const sku = await SKU.findById(item._id);
            if(!sku || item.quantity > sku.stock){
                throw new Error(`Insufficient stock for SKU: ${sku.name}`);
            }
        }
        if(order.paymentMethod === 'balance'){
            await User.findByIdAndUpdate(userId, {
                $inc: {balance: -order.total}
            }).session(session);
        }

        order.status = 'processing';
        order.paymentStatus = 'completed';
        await order.save();

        for(const item of order.items){
            await SKU.findByIdAndUpdate(item._id, {
                $inc: {
                    stock: -item.quantity,
                    'sales.count': +item.quantity,
                    'sales.revenue': +(item.quantity * item.price)
                }
            }).session(session)
        }

        const transaction = await Transaction.findById(transactionId);
        if(!transaction || transaction.order.toString() !== orderId) throw new Error("No transaction found or unauthorized transaction");

        transaction.status = 'completed';
        await transaction.save();

        session.commitTransaction();

        return res.status(200).json({
            errCode: 0,
            message: "Payment processed successfully",
            data: order
        })
    } catch (error) {
        session.abortTransaction();
        return res.status(500).json({
            errCode: 1,
            message: error.message
        });
    }
    finally{
        session.endSession();
    }
}