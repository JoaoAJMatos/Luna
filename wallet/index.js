const Transaction = require('./transaction');
const { STARTING_BALANCE } = require('../config');
const { generateKeyPairFromSecret, cryptoHash, toHex } = require('../util');
const uuid = require('uuid/v1');

class Wallet {
    constructor() {
        //this.keyPair = generateKeyPairFromSecret('e7b6cace3e688a4a7bb655865918b44890d9bf90bcd38b0f432739b8bd227bcacc2031836d5c83f532c4d5d97782885791bc4beeaf2f4c8d00435d759e8b1d32');
        this.keyPair = generateKeyPairFromSecret(JSON.stringify(Math.random()));

        this.balance = STARTING_BALANCE;

        this.id = uuid(); // TODO: use the wallet ID to generate a secret in order to create the keyPair

        this.publicKey = toHex(this.keyPair.getPublic());
    }

    sign(data) {
        return this.keyPair.sign(cryptoHash(data));
    }

    createTransaction({ recipient, amount, chain }) {
        if (chain) {
            this.balance = Wallet.calculateBalance({ chain, address: this.publicKey });
        }

        if (amount > this.balance) {
            throw new Error('Amount exceeds balance');
        }

        return new Transaction({ senderWallet: this, recipient, amount });
    }

    static calculateBalance({ chain, address }) {
        let hasConductedTransaction = false;
        let outputsTotal = 0;

        for (let i=chain.length-1; i>0; i--) {
            const block = chain[i];

            for (let transaction of block.data) {              // Look for a recent transaction where the address has been involved 
                if (transaction.input.address === address) {   // in order to return the most recent balance without having to do calculations
                    hasConductedTransaction = true;
                }

                const addressOutput = transaction.outputMap[address];

                if (addressOutput) {
                    outputsTotal = outputsTotal + addressOutput;
                }
            }

            if (hasConductedTransaction) { // If while going through the blockchain, 
                break;                     // a recent transaction is found, break out of the loop
            }
        }

        // If the user has conducted a transaction, return the outputs total without calculating anything
        return hasConductedTransaction ? outputsTotal : STARTING_BALANCE + outputsTotal;
    }
};

module.exports = Wallet;