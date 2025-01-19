import mongoose from "mongoose";

const skuSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        sparse: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    price: {
        type: Number,
        required: true,
        default: 0,
        validate: {
            validator: Number.isInteger
        }
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        validate: {
            validator: Number.isInteger
        }
    },
    status: {
        type: String,
        enum: ['available', 'hidden'],
        default: 'available',
        required: true,
    },
    features: [String]
}, { timestamps: true });

skuSchema.index(
    { product: 1, name: 1 },
    {
        unique: true,
        name: 'product_sku_name'  // Named index for easier management
    }
);

skuSchema.pre('save', async function (next) {
    const existingSku = await this.constructor.findOne({
        product: this.product,
        name: this.name,
        _id: { $ne: this._id }  // Exclude current document when updating
    });

    if (existingSku) {
        throw new Error('SKU không thể trùng nhau với 1 sản phẩm');
    }
    next();
});

export default mongoose.model('SKU', skuSchema);