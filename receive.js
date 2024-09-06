require('dotenv').config();
const TronWeb = require('tronweb');
const axios = require('axios');

// TronWeb configuration
const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io',
    privateKey: process.env.PRIVATE_KEY, // Your main private key
});

// In-memory storage for the generated address (replace with a database in production)
let generatedAddress = null;

// Step 1: Generate or retrieve an existing Tron address
const generateOrRetrieveAddress = async () => {
    if (generatedAddress) {
        return generatedAddress; // Return the existing address if already generated
    }

    try {
        const newAccount = await tronWeb.createAccount();
        generatedAddress = newAccount; // Persist the generated address
        console.log('Generated Tron Address:', newAccount.address.base58);
        return newAccount;
    } catch (error) {
        console.error('Error generating new address:', error.message);
        throw error;
    }
};

// Step 2: Monitor and forward payment
const monitorAndForward = async (fromAddress, toAddress, amount, callbackUrl) => {
    const interval = setInterval(async () => {
        try {
            const balance = await tronWeb.trx.getBalance(fromAddress);
            const balanceInTron = tronWeb.fromSun(balance);

            if (balanceInTron >= amount) {
                clearInterval(interval);

                // Step 3: Forward the payment to your main address
                const tx = await sendTransactionWithRetry(toAddress, balance);
                console.log('Forwarded Transaction ID:', tx.txid);

                // Step 4: Trigger callback
                if (tx.result) {
                    await axios.post(callbackUrl, {
                        success: true,
                        transactionId: tx.txid,
                        amount: balanceInTron,
                    });
                    console.log('Callback triggered:', callbackUrl);
                }

                // Clear the persisted address after success
                generatedAddress = null;
            }
        } catch (error) {
            console.error('Error during monitoring or forwarding:', error.message);
            // Optionally: Retry or notify about the issue without losing the state
        }
    }, 10000); // Check every 10 seconds
};

// Retry mechanism for sending transactions
const sendTransactionWithRetry = async (toAddress, amount, maxRetries = 3) => {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const tx = await tronWeb.trx.sendTransaction(toAddress, amount, process.env.PRIVATE_KEY);
            return tx; // Return the transaction if successful
        } catch (error) {
            retries++;
            console.error(`Attempt ${retries} failed:`, error.message);
            if (retries >= maxRetries) {
                throw new Error('Max retries reached. Transaction failed.');
            }
        }
    }
};

// Example usage
(async () => {
    try {
        const userAddress = await generateOrRetrieveAddress(); // Get existing or generate a new Tron address
        const amountToSend = 1; // Amount in TRX
        const callbackUrl = 'https://yourcallbackurl.com/success'; // Callback URL

        // Monitor and forward payment
        await monitorAndForward(userAddress.address.base58, 'TYQYWjgFJqNj1eCaRoifs9LBjeo83Uweap', amountToSend, callbackUrl);
    } catch (error) {
        console.error('Error in the main execution flow:', error.message);
    }
})();
