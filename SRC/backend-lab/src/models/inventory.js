import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    sku: String,
    credentials: {
        username: String,
        password: String,
        email: String,
        additionalInfo: Object
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