const express = require('express');
const router = express.Router();
const { transferMoney } = require('../controllers/walletController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/transfer', authMiddleware, transferMoney);

module.exports = router;
