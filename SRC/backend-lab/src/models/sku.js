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
    sales: {
        count: {
            type: Number,
            default: 0
        },
        revenue: {
            type: Number,
            default: 0
        },
        lastSale: {
            type: Date,
            default: null
        }
    },
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
        throw new Error('1 sản phẩm không thể có SKU trùng nhau');
    }
    next();
});

// Add method to get total sales for a product
skuSchema.statics.getProductSales = async function(productId) {
    return this.aggregate([
        { 
            $match: { 
                product: new mongoose.Types.ObjectId(productId) 
            }
        },
        {
            $group: {
                _id: '$product',
                totalSales: { $sum: '$sales.count' },
                totalRevenue: { $sum: '$sales.revenue' }
            }
        }
    ]);
};

// Add method to update sales when order completes
skuSchema.methods.updateSales = async function(quantity, price) {
    this.sales.count += quantity;
    this.sales.revenue += quantity * price;
    this.sales.lastSale = new Date();
    this.stock -= quantity;
    return this.save();
};
export default mongoose.model('SKU', skuSchema);