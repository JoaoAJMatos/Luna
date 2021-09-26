const { STARTING_BALANCE } = require('../conffig');

class Wallet {
    constructor() {
        this.balance = STARTING_BALANCE;
    }
};

module.exports = Wallet;