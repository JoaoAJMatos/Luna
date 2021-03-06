const Transaction = require('../wallet/transaction');

class TransactionMiner {
    constructor({ blockchain, transactionPool, wallet, pubsub }) {
        this.blockchain      = blockchain;
        this.transactionPool = transactionPool;
        this.wallet          = wallet;
        this.pubsub          = pubsub;
    }

    mineTransactions() {
        const validTransactions = this.transactionPool.validTransactions(); // get valid transactions

        if (validTransactions.length > 0) {
            validTransactions.push(
                Transaction.rewardTransaction({ minerWallet: this.wallet }) // Generate the miner's reward
            ); 
            
            this.blockchain.addBlock({ data: validTransactions }); // Add a block consisting of these transactions to the blockchain
    
            this.pubsub.broadcastChain(); // Broadcast updated blockchain
    
            this.transactionPool.clear(); // Clear transaction pool
        
        } else {
            console.log('\n[+] Transaction Pool empty')
            console.log('[-] No data to mine')
        }
    }
}

module.exports = TransactionMiner;