import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
    sku: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SKU'
    },
    credentials: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'sold', 'invalid'],
        default: 'available'
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Inventory', inventorySchema);