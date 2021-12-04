/***********************************************************************************
* MIT License | Luna                                                               *
*                                                                                  *
* Copyright (c) 2021 João Matos                                                    *
*                                                                                  *
* Permission is hereby granted, free of charge, to any person obtaining a copy     *
* of this software and associated documentation files (the "Software"), to deal    *
* in the Software without restriction, including without limitation the rights     *
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell        *
* copies of the Software, and to permit persons to whom the Software is            *
* furnished to do so, subject to the following conditions:                         *
*                                                                                  *
* The above copyright notice and this permission notice shall be included in all   *
* copies or substantial portions of the Software.                                  *
*                                                                                  *
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR       *
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,         *
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE      *
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER           *
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,    *
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE    *
* SOFTWARE.                                                                        *
***********************************************************************************/ 

const bodyParser       = require('body-parser');
const express          = require('express');
const request          = require('request');
const Blockchain       = require('./blockchain');
const PubSub           = require('./app/pubsub');
const TransactionPool  = require('./wallet/transaction-pool');
const Wallet           = require('./wallet');
const TransactionMiner = require('./app/transaction-miner');

const { PATH, GENESIS_DATA }         = require('./config')
const DB               = require('./util/db');

const app              = express();
const blockchain       = new Blockchain(); // TODO: try to initialize a new blockchain instance after fetching stored blocks
const transactionPool  = new TransactionPool();
const wallet           = new Wallet();
const pubsub           = new PubSub({ blockchain, transactionPool });
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub });

const DEFAULT_PORT      = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`

const fs = require('fs'); // Import filesystem module
const getLastModify = require('./util/get-last-modify');

const clc = require('cli-color');

app.use(bodyParser.json());

// Returns the blockchain data as JSON
app.get('/api/blocks', (req, res) => {      // [/api/blocks]
    res.json(blockchain.chain);             // Shows te current state of the blockchain
});

// Mine blocks in the transaction pool
app.post('/api/mine', (req, res) => {       // [/api/mine] => mines a single block (used for testing)
    const { data } = req.body;              // 
                                            // Takes 1 parameter: block `data` 
    blockchain.addBlock({ data });          // Adds a new block to the chain
                                            // 
    pubsub.broadcastChain();                // Broadcasts the updated chain
                                            //
    res.redirect('/api/blocks');            // Redirects to [/api/blocks] => shows the updated blockchain
});

// Conduct a transaction
app.post('/api/transact', (req, res) => {                                                               // [/api/transact] => Conduct a transaction
    const { amount, recipient } = req.body;                                                             // 
                                                                                                        // The request takes 2 parameters: the `amount` and the `recipient`
    let transaction = transactionPool.existingTransaction({ inputAddress: wallet.publicKey });          //
                                                                                                        // Try to create a new transaction:
    try {                                                                                               // 
        if (transaction) {                                                                              // If a transaction with the same input address already exists:
            transaction.update({ senderWallet: wallet, recipient, amount });                            //      - Update the amount of the transaction
        } else {                                                                                        // If the input address is unique in the pool:
            transaction = wallet.createTransaction({ recipient, amount, chain: blockchain.chain });     //      - Create a new transaction
        }
    }  catch(error) {
        return res.status(400).json({ type: 'error', message: error.message });
    } 

    transactionPool.setTransaction(transaction);        // Add transaction to the transaction pool
                                                        // 
    pubsub.broadcastTransaction(transaction);           // Broadcast the transaction
                         
    res.json({ type: 'success', transaction });        
});

// Get transaction pool map
app.get('/api/transaction-pool-map', (req, res) => {        // [/api/transaction-pool-map] => shows the current state of the transaction pool
    res.json(transactionPool.transactionMap);
});


// Mine transactions
app.get('/api/mine-transactions', (req, res) => {       // [/api/mine-transactions] => mines every transaction contained inside the transaction pool
    transactionMiner.mineTransactions();

    DB.write(PATH, blockchain.chain);
    res.redirect('/api/blocks');
});

// =====================

// When started, the node will look for the latest stored blockchain version inside the filesystem
//  - If it finds one, validate the blocks inside it and replace the current state of the blockchain
//  - If it doesn't find a blockchain file, the node will check if it is the root node. If it is: Initialize a new blockchain

// =====================
const fetchBlockchainJSON = (root) => { // Fetch blockchain JSON from file
    let blockchainJSON = [] // Define an empty array to put the blocks in as the `isValidChain` takes an array as argument

    try {
        DB.read(PATH, (err, data) => {
            
            if (err) {
                console.log(err);
            }
            else {

                if (data == 0) {
                    // If the file is empty, check if I am root
                    console.log(`[+] Failed to fetch latest blockchain instance from '${PATH}'. The file is empty.`);    // If I am root, initialize a new blockchain

                    console.log(`[+] Initializing a new blockchain instance...`);
                    DB.write(PATH, [GENESIS_DATA]);
                    
                }
                else {
                    console.log(`\n[+] Found latest blockchain version in '${PATH}'.\n`);
                    console.log('     [+] Attempting to replace chain:');

                    blockchainJSON.push(data);
                    blockchain.replaceChain(blockchainJSON);

                    console.log(clc.blue(`     [+] Successfully updated the blockchain instance.`));
                    console.log(`\n[+] Instance retrieved from '${clc.blue(PATH)}'.\n[+] Last write: ${clc.yellow(getLastModify(PATH))}`);
                }
            }
        });

    } catch {
        console.error('\n[ERR] An error has occurred when fetching the last stored blockchain version');
    }
}; 

const syncWithRootState = () => { // Sync chains & transaction pool on startup
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, res, body) => {
        if (!error && res.statusCode === 200) {
            const rootChain = JSON.parse(body);

            console.log('\n[+] Replacing chain on sync with [root-chain]');
            blockchain.replaceChain(rootChain);
        } else {
            console.log(`\n[${clc.bgRed("ERR")}] Error fetching the latest blockchain version from the root node (${clc.yellow("the node may be down")})`); 
            console.log('[+] Attempting to fetch latest stored blockchain version.')
            
            let amIRoot = PORT == DEFAULT_PORT ? true : false; // Check if I am the root node 
            
            fetchBlockchainJSON(amIRoot);
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

process.stdout.write('\033c'); // Clear screen
console.log("======================================");
console.log("|" + clc.blue("         LUNA v0.9.0-alpha          ") + "|");
console.log("======================================");

app.listen(PORT, () => {
    console.log(clc.blue("\n\n=> Node Info"))
    console.log("======================================");

    console.log(`[+] Listening at localhost:${clc.blue(PORT)} (127.0.0.1:${clc.blue(PORT)})`);

    console.log(clc.blue("\n=> Wallet Info"));

    console.log("======================================");

    console.log(`[+] Your Wallet-ID: ${clc.blue(wallet.id)}`);
    console.log(`[+] Your Wallet Address: ${clc.blue(wallet.publicKey)}`);

    console.log(clc.blue("\n=> Node Log"));

    console.log("======================================");

    if (PORT !== DEFAULT_PORT) { // If I am a peer node, sync the state with the root node
        syncWithRootState();
    } else {
        // If I am the root node, fetch the latest blockchain version
        fetchBlockchainJSON();
    }
});
