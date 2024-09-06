require('dotenv').config(); // if using a .env file

const TronWeb = require('tronweb');

const tronWeb = new TronWeb({
    fullHost: process.env.TRON_API,
    privateKey: process.env.PRIVATE_KEY,
});

const checkConnection = async () => {
    try {
        const connected = await tronWeb.isConnected();
        console.log('Full Node:', connected.fullNode);
        console.log('Solidity Node:', connected.solidityNode);
        console.log('Event Server:', connected.eventServer);
    } catch (error) {
        console.error('Connection error:', error);
    }
};

checkConnection();
