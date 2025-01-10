import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    // enum: ['twitter', 'facebook', 'telegram', 'steam'],
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skus: [{
    name: String,
    price: Number,
    features: [String],
    stock: {
      type: Number,
      default: 0
    }
  }],
  totalSold: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Product', productSchema);