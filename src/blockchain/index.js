const Block = require('./block');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');
const { cryptoHash } = require('../util');
const { REWARD_INPUT, MINING_REWARD } = require('../../config');
const backupChain = require(`${process.env.APPDATA}/lunaBlockchain.json`)

class Blockchain {
    constructor() {
        this.chain = backupChain;
    }

    addBlock({ data }) {
        console.log(this.chain.length);
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length - 1],
            data: data
             
        }, this.chain.length - 1);

        this.chain.push(newBlock);
    }

    // Replace current chain by the incoming chain
    replaceChain(chain, validateTransactions, onSuccess) {
        if (chain.length <= this.chain.length) { // Check is chain is longer
            console.error('     [+] The incoming chain must be longer');
            return;
        }

        if (!Blockchain.isValidChain(chain)) { // Validate Blocks
            console.error('     [+] The incoming chain must be valid');
            return;
        }

        if (validateTransactions && !this.validTransactionData({ chain })) { // Validate Data inside blocks
            console.error('     [+] The incoming chain has invalid transaction data');
            return;
        }

        if (onSuccess) onSuccess();
        console.log('[+] Replacing chain with', chain);
        this.chain = chain;
    }

    validTransactionData({ chain }) { // Validate Transactions inside a chain
        for (let i=1; i<chain.length; i++) {
            const block = chain[i];
            const transactionSet = new Set(); // Create a set of unique items to ensure there are no duplicate transactions
            let rewardTransactionCount = 0;

            for (let transaction of block.data) {
                if (transaction.input.address === REWARD_INPUT.address) {
                    rewardTransactionCount += 1;

                    if (rewardTransactionCount > 1) { // Return false if there is more than one reward transaction per block
                        console.error('[-] Miner rewards exceed limit (1)');
                        return false;
                    }
                    
                    if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) { // Return false if the mining reward isn't correct
                        console.error('[-] Miner reward amount is invalid');
                        return false;
                    }
                } else { // If the transaction is not a reward transaction:
                    if (!Transaction.validTransaction(transaction)) { // Return false if transaction is invalid
                        console.error('[-] Invalid transaction');
                        return false;
                    }

                    const trueBalance = Wallet.calculateBalance({
                        chain: this.chain,
                        address: transaction.input.address
                    });

                    if (transaction.input.amount !== trueBalance) { // If the attacker is trying to fake their balance, return false
                        console.error('[-] Invalid input amount');
                        return false;
                    }

                    if (transactionSet.has(transaction)) { // Look for duplicate transactions inside a block
                        console.error('[-] An identical transaction appears more than once in the block')
                        return false;
                    } else {
                        transactionSet.add(transaction);
                    }
                }
            }
        }

        return true;
    }

    // Validate the chain contents - returns true/false
    static isValidChain(chain) {
        
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;
        
        for (let i=1; i<chain.length; i++) {
            const { timestamp, height, lastHash, hash, nonce, difficulty, data }  = chain[i];
            const actualLastHash = chain[i-1].hash;
            const lastDifficulty = chain[i-1].difficulty;
            const lastHeight     = chain[i-1].height;

            if (lastHash !== actualLastHash) {
                console.error(`[-] Incoming lastHash does not match expected lastHash. Got :'${lastHash}', Expected: '${actualLastHash}'`);
                return false;
            } 

            if (height !== lastHeight + 1) {
                console.error(`[-] Incoming height is incorrect. Got: '${height}', Expected: '${lastHeight + 1}'`);
                return false;
            }

            const validatedHash = cryptoHash(timestamp, height, lastHash, data, nonce, difficulty);

            if (hash !== validatedHash) {
                console.error(`[-] Incoming hash does not match expected hash. Got: '${hash}', Expected: '${validatedHash}'`)
                return false;
            } 

            if (Math.abs(lastDifficulty - difficulty) > 1) {
                console.error(`[-] A difficulty jump higher than '1' has occurred`)
                return false; // Prevent difficulty jumps
            } 
        }

        return true;
    }
}

module.exports = Blockchain;