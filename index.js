// Luna - API
const bodyParser       = require('body-parser');
const express          = require('express');
const request          = require('request');
const Blockchain       = require('./blockchain');
const PubSub           = require('./app/pubsub');
const TransactionPool  = require('./wallet/transaction-pool');
const Wallet           = require('./wallet');
const TransactionMiner = require('./app/transaction-miner');

const app              = express();
const blockchain       = new Blockchain();
const transactionPool  = new TransactionPool();
const wallet           = new Wallet();
const pubsub           = new PubSub({ blockchain, transactionPool });
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub });

const DEFAULT_PORT      = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`

app.use(bodyParser.json());

// Returns the blockchain data as JSON
app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

// Mine blocks in the transaction pool
app.post('/api/mine', (req, res) => {
    const { data } = req.body;

    blockchain.addBlock({ data });

    pubsub.broadcastChain();

    res.redirect('/api/blocks');
});

// Conduct a transaction
app.post('/api/transact', (req, res) => {
    const { amount, recipient } = req.body;

    let transaction = transactionPool.existingTransaction({ inputAddress: wallet.publicKey });
 
    try {
        if (transaction) {
            transaction.update({ senderWallet: wallet, recipient, amount });
        } else {
            transaction = wallet.createTransaction({ recipient, amount, chain: blockchain.chain });
        }
    }  catch(error) {
        return res.status(400).json({ type: 'error', message: error.message });
    } 

    transactionPool.setTransaction(transaction);

    pubsub.broadcastTransaction(transaction);

    res.json({ type: 'success', transaction });
});

// Get transaction pull map
app.get('/api/transaction-pool-map', (req, res) => {
    res.json(transactionPool.transactionMap);
});

// Mine transactions
app.get('/api/mine-transactions', (req, res) => {
    transactionMiner.mineTransactions();

    res.redirect('/api/blocks');
});

const syncWithRootState = () => { // Sync chains & transaction pool on startup
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, res, body) => {
        if (!error && res.statusCode === 200) {
            const rootChain = JSON.parse(body);

            console.log('[+] Replacing chain on sync with', rootChain);
            blockchain.replaceChain(rootChain);
        }
    });

    request({ url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` }, (error, response, body) => { // Sync transaction pool on startup
        if(!error && response.statusCode === 200) {
            const rootTransactionPoolMap = JSON.parse(body);

            console.log('[+] Replacing transaction pool map on sync with: ', rootTransactionPoolMap);
            transactionPool.setMap(rootTransactionPoolMap);
        }
    });
};

// Get wallet info - Address and Balance
app.get('/api/wallet-info', (req, res) => {
    const address = wallet.publicKey;

    res.json({ 
        address: address,
        balance: Wallet.calculateBalance({ chain: blockchain.chain, address: address })
    });
});

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === 'true') { // Choose random port if default is already taken
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
    console.log(`Listening at localhost:${PORT}`);
    console.log(`Your Wallet-ID: ${wallet.id}`);
    console.log(`Your Wallet Address: ${wallet.publicKey}`);

    if (PORT !== DEFAULT_PORT) {
        syncWithRootState();
    }
});