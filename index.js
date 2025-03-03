import Web3 from 'web3';
import { WebSocketProvider, HttpProvider } from 'web3';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const ETHEREUM_MAINNET = "ETHEREUM_MAINNET",
ETHEREUM_SEPOLIA = "ETHEREUM_SEPOLIA",

network = ETHEREUM_SEPOLIA,


// Replace with your WebSocket provider URL
wssURL = network === ETHEREUM_MAINNET
    ? process.env.MAIN_WSS_URL
    : process.env.TEST_WSS_URL,
httpURL = network === ETHEREUM_MAINNET
    ? process.env.MAIN_HTTP_URL
    : process.env.TEST_HTTP_URL,


// options for socket provider
options = {
    timeout: 30000,
    clientConfig: {
        maxReceivedFrameSize: 100000000,
        maxReceivedMessageSize: 100000000,
    },
    reconnect: {
        auto: true,
        delay: 5000,
        maxAttempts: 15,
        onTimeout: false,
    },
},

// Create WebSocketProvider instance
wsProvider = new WebSocketProvider(wssURL, options),
httpProvider = new HttpProvider(httpURL),

// Initialize web3 with the WebSocket provider
wssweb3 = new Web3(wsProvider),
httpweb3 = new Web3(httpProvider),

getPendingTransactions = async () => {
    const subscription = await wssweb3.eth.subscribe("pendingTransactions", (err, res) => {
        if (err) console.error(err);
    });
    const txs = []
    subscription.on("data", (txHash) => {
        setTimeout(async () => {
            try {
                console.log('TX => ', txHash)
                let tx = await getTransactionDetail(txHash)
                txs.push(tx);
                // console.log(tx)
                console.log(txs.length)
            } catch (err) {
                console.error(err);
            }
        });
    });
},

getTransactionDetail = async (txHash) => {
    return wssweb3.eth.getTransaction(txHash);
},

generateAddress = () => {
    var id = crypto.randomBytes(32).toString('hex');
    var privateKey = "0x" + id;
    console.log("SAVE BUT DO NOT SHARE THIS:", privateKey);

    var account = wssweb3.eth.accounts.privateKeyToAccount(privateKey);
    console.log("Address: " + account.address);
    return [privateKey, account.address]
},

sendTransaction = async () => {
    console.log(process.env.PRIVATE_KEY);
    const account = httpweb3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
    console.log(account)
    httpweb3.eth.accounts.wallet.add(account);
    
    const tx = {
        to: '0x0af5320540FB70A929e81B3007336e245747370b',
        value: httpweb3.utils.toWei('0.001', 'ether'),
        gas: 2000000,
        gasPrice: await httpweb3.eth.getGasPrice(),
    };

    const receipt = await httpweb3.eth.sendTransaction(tx);
    console.log(receipt);
},

logConnected = () => {
    console.log('WebSocket connected');
};

logConnected();

sendTransaction();

// getPendingTransactions();

// generateAddress();