require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const TronWeb = require('tronweb');

const app = express();
app.use(express.json()); // For parsing JSON bodies

// Initialize TronWeb with environment variables
const tronWeb = new TronWeb({
  fullHost: process.env.TRON_API,
  privateKey: process.env.PRIVATE_KEY
});

const tokenContractAddress = process.env.TOKEN_CONTRACT_ADDRESS;

// Route to send TRC-20 tokens
app.post('/send-token', async (req, res) => {
  const { recipient, amount } = req.body;

  try {
    const tokenContract = await tronWeb.contract().at(tokenContractAddress);
    const tx = await tokenContract.transfer(
      recipient,
      tronWeb.toSun(amount) // Convert amount to smallest unit (Sun)
    ).send({
      feeLimit: 100000000 // Max TRX for transaction fee
    });

    res.json({ success: true, transaction: tx });
  } catch (error) {
    console.error('Send Token Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route to monitor TRC-20 token transactions
app.get('/monitor-token', (req, res) => {
  try {
    const tokenContract = tronWeb.contract().at(tokenContractAddress);
    tokenContract.Transfer().watch((err, event) => {
      if (err) {
        console.error('Monitor Token Error:', err);
        res.status(500).json({ success: false, error: err.message });
      } else {
        res.json({ success: true, transaction: event });
      }
    });
  } catch (error) {
    console.error('Monitor Token Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
