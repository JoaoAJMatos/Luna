const { STARTING_BALANCE } = require('../config');
const { ec } = require('../util');

class Wallet {
    constructor() {
        this.balance = STARTING_BALANCE;

        const KeyPair = ec.genKeyPair();

        this.publicKey = KeyPair.getPublic().encode('hex');
    }
};

module.exports = Wallet;