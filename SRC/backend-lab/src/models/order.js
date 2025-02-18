import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        sku: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SKU',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        }
    }],
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'canceled', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        // required: true,
        enum: ['balance', 'bank_transfer'],
        default: 'balance'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    }
}, {
    timestamps: true
});
orderSchema.index({ buyer: 1, _id: -1 });
orderSchema.index({ 'items.sku': 1 });

export default mongoose.model('Order', orderSchema);