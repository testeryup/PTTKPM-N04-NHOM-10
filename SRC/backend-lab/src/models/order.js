import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        sku: String,
        quantity: Number,
        price: Number
    }],
    total: Number,
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    }
}, {
    timestamps: true
});

export default mongoose.model('Order', orderSchema);