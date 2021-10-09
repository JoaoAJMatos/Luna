const Block = require('./block');
const { cryptoHash } = require('../util');

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock({ data }) {
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length - 1],
            data
        });

        this.chain.push(newBlock);
    }

    // Replace current chain by the incoming chain
    replaceChain(chain) {
        if (chain.length <= this.chain.length) {
            console.error('[-] The incoming chain must be longer');
            return;
        }

        if (!Blockchain.isValidChain(chain)) {
            console.error('[-] The incoming chain must be valid');
            return;
        }

        console.log('[+] Replacing chain with', chain);
        this.chain = chain;
    }

    // Validate the chain contents - returns true/false
    static isValidChain(chain) {
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;
        
        for (let i=1; i<chain.length; i++) {
            const { timestamp, lastHash, hash, nonce, difficulty, data }  = chain[i];
            const actualLastHash = chain[i-1].hash;
            const lastDifficulty = chain[i-1].difficulty;

            if (lastHash !== actualLastHash) return false;

            const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);

            if (hash !== validatedHash) return false;

            if (Math.abs(lastDifficulty - difficulty) > 1) return false; // Prevent difficulty jumps
        }

        return true;
    }
}

module.exports = Blockchain;