class TransactionMiner {
    constructor({ blockchain, transactionPool, wallet, pubsub }) {
        this.blockchain      = blockchain;
        this.transactionPool = transactionPool;
        this.wallet          = wallet;
        this.pubsub          = pubsub;
    }

    mineTransactions() {
        // Get the transaction pool's valid transactions

        // Generate the miner's reward

        // Add a block consisting of these transactions to the blockchain

        // Broadcast updated blockchain

        // Clear transaction pool
    }
}

module.exports = TransactionMiner;