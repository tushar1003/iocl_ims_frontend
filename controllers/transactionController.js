// controllers/transactionController.js
const Transaction = require('../models/transaction');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,  // Update with your SMTP server's hostname
  port: 587,  // The port number for the SMTP server
  secure: false,  // Set to true if your SMTP server requires a secure connection
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
exports.getAllTransactions = async (req, res) => {
    try {
      const transactions = await Transaction.find().populate('productId');
      res.json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching transactions' });
    }
  };
  
exports.addIncomingTransaction = async (req, res) => {
  try {
    // Extract data from the request body
    const { productId, date, ventureName, quantity,invoice } = req.body;

    // Create a new transaction
    const transaction = new Transaction({
      productId,
      date,
      ventureName,
      quantity,
      transactionType: 'incoming',
      invoice,
    //   effectiveStock,
    });
    // Update the product's quantity
    const product = await Product.findById(productId);
    console.log(product); 
    product.quantity += Number(quantity);
    // effectiveStock=product.quantity;

    if (product.quantity < product.maxQuantity / 2) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: ["tusharbhatia1003@gmail.com","tripathis@indianoil.in","saxenah2@indianoil.in"],  // Replace with the recipient's email
          subject: 'Low Quantity Alert',
          text: `The product "${product.name}" has a low quantity. Current quantity: ${product.quantity} and max quantity is: ${product.maxQuantity}`,
        };
       
        try {
          await transporter.sendMail(mailOptions);
          console.log('Low quantity email sent');
        } catch (error) {
          console.error('Error sending low quantity email:', error);
        }
      }
    await product.save();
    // console.log(product);

    // Save the transaction and respond
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Similar controller for outgoing transactions
exports.addOutgoingTransaction = async (req, res) => {
  try {
    // Extract data from the request body
    const { productId, date, ventureName, quantity } = req.body;

    // Create a new transaction
    const transaction = new Transaction({
      productId,
      date,
      ventureName,
      quantity,
      transactionType: 'outgoing',
    //   effectiveStock,
    });

    // Update the product's quantity
    const product = await Product.findById(productId);
    product.quantity -= quantity;
    // effectiveStock=product.quantity;
    if (product.quantity < product.maxQuantity / 2) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: ['tusharbhatia0510@gmail.com','tripathis@indianoil.in','saxenah2@indianoil.in'],  // Replace with the recipient's email
          subject: 'Low Quantity Alert',
          text: `The product "${product.name}" has a low quantity. Current quantity: ${product.quantity} and max quantity is: ${product.maxQuantity}`,
        };
       
        try {
          await transporter.sendMail(mailOptions);
          console.log('Low quantity email sent');
        } catch (error) {
          console.error('Error sending low quantity email:', error);
        }
      }

    await product.save();

    // Save the transaction and respond
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
