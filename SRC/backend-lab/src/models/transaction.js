import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    orderCode: {
        type: Number,
        unique: true,
        default: null
    },
    amount: Number,
    type: {
        type: String,
        enum: ['purchase', 'refund', 'withdrawal', 'deposit'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    metadata: {
        type: {
            reason: String,
            originalOrderTotal: Number
        },
        default: null
    }
}, {
    timestamps: true
});

export default mongoose.model('Transaction', transactionSchema);