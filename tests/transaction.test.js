const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');

describe('Transaction', () => {
    let transaction, senderWallet, recipient, amount;

    beforeEach(() => { // Create a new transaction object before each test
        senderWallet = new Wallet();
        recipient    = 'recipient-address';
        amount       = 2;

        transaction  = new Transaction({ senderWallet, recipient, amount });
    });

    it('has an `id`', () => {
        expect(transaction).toHaveProperty('id');
    });

    describe('outputMap', () => {
        it('has an `outputMap`', () => {
            expect(transaction).toHaveProperty('outputMap');
        });

        it('outputs the amount to the recipient', () => {
            expect(transaction.outputMap[recipient]).toEqual(amount);
        });

        it('outputs the remaining balance for the sender wallet', () => {
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance - amount);
        });
    });
});