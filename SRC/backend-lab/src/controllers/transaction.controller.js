import Transaction from '../models/transaction.js';
import Order from '../models/order.js';
import User from '../models/user.js';
import mongoose from 'mongoose';
import PayOS from '@payos/node';
const payOS = new PayOS(
    process.env.PAYOS_CLIENT_ID,
    process.env.PAYOS_API_KEY,
    process.env.PAYOS_CHECKSUM_KEY
);
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


export const topUpBalance = async (req, res) => {
    console.log(req.body);
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        if (!req.body?.code || req.body.code !== '00') {
            throw new Error("Invalid transaction status");
        }
        const data = req.body.data;
        if (!data?.orderCode || !data?.description || !data?.amount) {
            throw new Error("Missing required payment data");
        }
        const description = data.description;
        const amount = data.amount;
        const username = description.split(' ')[0];
        const transaction = await Transaction.findOneAndUpdate(
            {
                orderCode: data.orderCode,
                type: 'deposit',
                status: 'pending' // Only update pending transactions
            },
            {
                status: 'completed'
            },
            {
                new: true,
                session
            }
        );

        if (!transaction) {
            throw new Error("Transaction not found or already processed");
        }
        const updatedUser = await User.findOneAndUpdate(
            { username: username },
            {
                $inc: { balance: amount }
            },
            {
                new: true,
                session,
                runValidators: true
            }
        );
        if (!updatedUser) {
            throw new Error("User not found");
        }
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();

    }
    finally {
        await session.endSession();
        return res.status(200).json({
            success: true
        });
    }

}

export const createPaymentLink = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);


        if (!req.body.amount) {
            return res.status(401).json({
                errCode: 1,
                message: "Missing input parameter"
            })
        }
        const amount = parseInt(req.body.amount);
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const YOUR_DOMAIN = `http://localhost:3000`;

        const userIdPart = userId.getTimestamp().getTime() % 10000;
        const randomPart = Math.floor(Math.random() * 1000); // từ 0 đến 999
        const orderCode = Number(String(parseInt(userIdPart + String(Date.now()).slice(-6) + String(randomPart))));

        const body = {
            orderCode: orderCode,
            amount: amount,
            description: `${user.username} ${orderCode}`,
            returnUrl: `${YOUR_DOMAIN}`,
            cancelUrl: `${YOUR_DOMAIN}`,
        };
        console.log("check body:", body);

        const paymentLinkResponse = await payOS.createPaymentLink(body);
        const transaction = await Transaction.create({
            user: new mongoose.Types.ObjectId(userId),
            amount: amount,
            type: 'deposit',
            orderCode: orderCode
        })
        console.log(transaction);
        console.log(paymentLinkResponse);
        res.send(paymentLinkResponse)
    } catch (error) {
        console.error(error);
        res.send("Something went error");
    }
}