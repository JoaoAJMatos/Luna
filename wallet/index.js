const Transaction = require('./transaction');
const { STARTING_BALANCE } = require('../config');
const { ec, cryptoHash } = require('../util');
const uuid = require('uuid/v1');

class Wallet {
    constructor() {
        this.keyPair = ec.genKeyPair();

        this.balance = STARTING_BALANCE;

        this.id = uuid();

        this.publicKey = this.keyPair.getPublic().encode('hex');
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