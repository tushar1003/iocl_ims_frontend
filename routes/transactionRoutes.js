// routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.post('/incoming', transactionController.addIncomingTransaction);
router.post('/outgoing', transactionController.addOutgoingTransaction);
router.get('/transactions', transactionController.getAllTransactions);
module.exports = router;
