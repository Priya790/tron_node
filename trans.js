require('dotenv').config();
const TronWeb = require('tronweb');

// TronWeb configuration
const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io',
    privateKey: process.env.PRIVATE_KEY,
});

// Your Tron address
const yourTronAddress = 'TYQYWjgFJqNj1eCaRoifs9LBjeo83Uweap'; // Replace with your actual Tron address

// Generate a Tron address
const generateAddress = () => {
    return tronWeb.createAccount();
};

// Check the balance of TRC20 tokens (USDT)
const checkBalance = async (address) => {
    try {
        console.log('Checking balance for address:', address);
        const contract = await tronWeb.contract().at(process.env.USDT_CONTRACT_ADDRESS);
        const balance = await contract.methods.balanceOf(address).call();
        console.log('Balance (raw):', balance.toString());

        // Convert balance from Sun to USDT
        const balanceInUSDT = balance / 1e6; // USDT typically has 6 decimal places
        console.log('Balance in USDT:', balanceInUSDT);
        return balanceInUSDT;
    } catch (error) {
        console.error('Error checking balance:', error.message, error.stack);
    }
};

// Send TRC20 tokens (USDT) to another address
const sendPayment = async (to, amount) => {
    try {
        console.log('Sending payment to:', to, 'Amount:', amount);
        const contract = await tronWeb.contract().at(process.env.USDT_CONTRACT_ADDRESS);
        const result = await contract.methods.transfer(to, tronWeb.toSun(amount)).send();
        console.log('Send payment result:', result);
        return result.transaction.txID;
    } catch (error) {
        console.error('Error sending payment:', error.message, error.stack);
    }
};

// Monitor transaction status
const getTransactionStatus = async (txId) => {
    try {
        console.log('Fetching transaction status for txId:', txId);
        const result = await tronWeb.trx.getTransaction(txId);
        console.log('Transaction status result:', result);
        return result;
    } catch (error) {
        console.error('Error fetching transaction status:', error.message, error.stack);
    }
};

// Example usage
(async () => {
    try {
        // 1. Check balance of your Tron address
        const balance = await checkBalance("TC1gWxZVsrdRBDFgF8UBx1KUk1soNY7Ewz");
        console.log('Balance of Tron Address:', balance, 'USDT');

        /*
        // 2. Send 10 USDT to your Tron address
        const amountToSend = 10; // Amount in USDT to send
        const transactionId = await sendPayment(yourTronAddress, amountToSend);
        console.log('Transaction Result:', transactionId);

        // 3. Get transaction status
        const status = await getTransactionStatus(transactionId);
        console.log('Transaction Status:', status);
        */
    } catch (error) {
        console.error('Error during operations:', error.message, error.stack);
    }
})();
