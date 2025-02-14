import mongoose from 'mongoose';
import Category from './category.js';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  images: {
    type: [String],
    default: []
  },
  description: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategory: {
    type: String,
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

productSchema.index({ seller: 1 });
productSchema.pre('save', async function (next) {

  const category = await mongoose.model('Category').findById(this.category);
  if (!category || !category.subcategories.some(sub => sub.name === this.subcategory)) {
    throw new Error('Invalid subcategory for selected category');
  }
  next();
});

export default mongoose.model('Product', productSchema);