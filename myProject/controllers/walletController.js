const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

exports.transferMoney = async (req, res) => {
  try {
    const { recipientEmail, amount } = req.body;

    if (!recipientEmail || !amount) {
      return res.status(400).json({ msg: 'Recipient email and amount are required' });
    }

    const senderWallet = await Wallet.findOne({ userId: req.userId });
    if (!senderWallet) return res.status(404).json({ msg: 'Sender wallet not found' });

    const recipientUser = await User.findOne({ email: recipientEmail });
    if (!recipientUser) return res.status(404).json({ msg: 'Recipient not found' });

    const recipientWallet = await Wallet.findOne({ userId: recipientUser._id });
    if (!recipientWallet) return res.status(404).json({ msg: 'Recipient wallet not found' });

    if (senderWallet.balance < amount) {
      return res.status(400).json({ msg: 'Insufficient balance' });
    }

    // Transfer
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
};
