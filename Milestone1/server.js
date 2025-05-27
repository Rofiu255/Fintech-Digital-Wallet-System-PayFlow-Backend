const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./db');
const User = require('./User');
const Wallet = require('./Wallet');
const Transaction = require('./Transaction');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// Middleware to verify token and set req.userId
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ msg: 'Unauthorized' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ msg: 'Token is invalid or expired' });
  }
}

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    await Wallet.create({ userId: user._id }); // Auto-create wallet

    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Transfer Money
app.post('/api/wallet/transfer', authMiddleware, async (req, res) => {
  try {
    const { recipientEmail, amount } = req.body;
    if (!recipientEmail || !amount) return res.status(400).json({ msg: 'Missing fields' });

    const senderWallet = await Wallet.findOne({ userId: req.userId });
    if (!senderWallet) return res.status(404).json({ msg: 'Sender wallet not found' });

    const recipientUser = await User.findOne({ email: recipientEmail });
    if (!recipientUser) return res.status(404).json({ msg: 'Recipient not found' });

    const recipientWallet = await Wallet.findOne({ userId: recipientUser._id });
    if (!recipientWallet) return res.status(404).json({ msg: 'Recipient wallet not found' });

    if (senderWallet.balance < amount) {
      return res.status(400).json({ msg: 'Insufficient balance' });
    }

    senderWallet.balance -= amount;
    recipientWallet.balance += amount;

    await senderWallet.save();
    await recipientWallet.save();

    await Transaction.create({
      fromUser: req.userId,
      toUser: recipientUser._id,
      amount,
    });

    res.status(200).json({ msg: 'Transfer successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Wallet Balance
app.get('/api/wallet/balance', authMiddleware, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.userId });
    if (!wallet) return res.status(404).json({ msg: 'Wallet not found' });

    res.status(200).json({ balance: wallet.balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Transaction History
app.get('/api/wallet/transactions', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ fromUser: req.userId }, { toUser: req.userId }]
    })
      .sort({ timestamp: -1 })
      .populate('fromUser', 'email name')
      .populate('toUser', 'email name');

    res.status(200).json({ transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
