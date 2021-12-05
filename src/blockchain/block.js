const hexToBinary = require('hex-to-binary');
const { GENESIS_DATA, MINE_RATE } = require('../../config');
const { cryptoHash } = require('../util');

class Block { 
    // TODO: Refactor the block structure. Fields in the order [data, nonce, difficulty]. (OCD is calling)
    constructor({ timestamp, height, lastHash, hash, data, nonce, difficulty }) {
        this.timestamp  = timestamp;
        this.height     = height;
        this.lastHash   = lastHash;
        this.hash       = hash;
        this.difficulty = difficulty;
        this.nonce      = nonce;
        this.data       = data;
    }

    static genesis() {
        return new this(GENESIS_DATA);
    }

    static mineBlock({ lastBlock, data }, lastHeight) {
        let hash, timestamp, height;
        const lastHash     = lastBlock.hash;
        let { difficulty } = lastBlock;
        let nonce = 0;

        height = lastHeight + 1;

        do { // Proof of work

            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty({ originalBlock: lastBlock, timestamp });
            hash = cryptoHash(timestamp, height, lastHash, data, nonce, difficulty);

        } while (hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));

        return new this({ timestamp, height, lastHash, data, difficulty, nonce, hash });
    }

    static adjustDifficulty({ originalBlock, timestamp }) {
        const { difficulty } = originalBlock;

        if (difficulty < 1) return 1;

        if ((timestamp - originalBlock.timestamp) > MINE_RATE) return difficulty - 1;

        return difficulty + 1;
    }
}

module.exports = Block;