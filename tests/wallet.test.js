const Wallet = require('../wallet');

describe('Wallet', () => {
    let wallet;

    beforeEach(() => { // Create new instance for every test
        wallet = new Wallet();
    });

    it('has a `balance`', () => {
        expect(wallet).toHaveProperty('balance');
    });

    it('has a `publicKey`', () => {
        console.log(wallet.publicKey);

        expect(wallet).toHaveProperty('publicKey');
    });
});