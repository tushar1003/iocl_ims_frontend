const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      //  required: true
    },
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      default: 'SKU',
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      trim: true,
    },
    subcategory:{
      type: String,
      required: [true, 'Please add a subcategory'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Please add a quantity'],
      trim: true,
    },

    maxQuantity: {
      type: String,
      required: [true, 'Please add maxProducts'],
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    image: {
      type: Object,
      default: {},
    },
    isDeleted: {
      type:Boolean,
      default: false
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
