const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');

const app        = express();
const blockchain = new Blockchain();
const pubsub     = new PubSub({ blockchain });

const DEFAULT_PORT = 3000;
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

const syncChains = () => { // Sync chains on startup
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, res, body) => {
        if (!error && res.statusCode === 200) {
            const rootChain = JSON.parse(body);

            console.log('[+] Replacing chain on sync with', rootChain);
            blockchain.replaceChain(rootChain);
        }
    });
};

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
    console.log(`Listening at localhost:${PORT}`);

    if (PORT !== DEFAULT_PORT) {
        syncChains();
    }
});