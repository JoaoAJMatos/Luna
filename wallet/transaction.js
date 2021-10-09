const uuid = require('uuid/v1');
const { verifySignature } = require('../util');

class Transaction {
    constructor({ senderWallet, recipient, amount }) {
        this.id = uuid();
        this.outputMap = this.createOutputMap({ senderWallet, recipient, amount });
        this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
    }

    // Helper function to create the output map
    createOutputMap({ senderWallet, recipient, amount }) {
        const outputMap = {};

        outputMap[recipient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

        return outputMap;
    }

    // Helper function to create input
    createInput({ senderWallet, outputMap }) {
        return {
            timestamp: Date.now(),
            amount   : senderWallet.balance,
            address  : senderWallet.publicKey,
            signature: senderWallet.sign(outputMap)
        };
    }

    // Updates transactions and re-signs them
    update({ senderWallet, recipient, amount }) {
        if (amount > this.outputMap[senderWallet.publicKey]) { // Return error when the amount exceeds sender balance
            throw new Error('Amount exceeds balance');
        }

        if(!this.outputMap[recipient]) {
            this.outputMap[recipient] = amount;
        } else {
            this.outputMap[recipient] = this.outputMap[recipient] + amount;
        }

        this.outputMap[senderWallet.publicKey] = this.outputMap[senderWallet.publicKey] - amount;
    
        // Use sign method inside createInput() to sign updated transaction
        this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
    }

    // Validate transactions
    static validTransaction(transaction) {
        const { input: { address, amount, signature }, outputMap } = transaction;
        
        const outputTotal = Object.values(outputMap).reduce((total, outputAmount) => total + outputAmount);

        if (amount !== outputTotal) {
            console.error(`Invalid transaction from ${address}`);
            return false;
        }

        if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
            console.error(`Invalid signature from ${address}`);
            return false;
        }

        return true;
    }
}

module.exports = Transaction;