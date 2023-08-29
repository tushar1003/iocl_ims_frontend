// Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  date: { type: Date, required: true },
  ventureName: { type: String, required: true },
  invoice: { type: String, required: false },
  quantity: { type: Number, required: true },
  transactionType: { type: String, enum: ['incoming', 'outgoing'], required: true },
  
//   effectiveStock:{ type: String, required: false },
},
{
    timestamps: true,
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
