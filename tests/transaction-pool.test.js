const TransactionPool = require('../wallet/transaction-pool');
const Transaction     = require('../wallet/transaction');
const Wallet          = require('../wallet/index');

describe('TransactionPool', () => {
    let transactionPool, transaction;

    beforeEach(() => {
        transactionPool = new TransactionPool();
        transaction     = new Transaction({ senderWallet: new Wallet(), recipient: 'test', amount: 2 });
    });

    describe('setTransaction()', () => {
        it('adds a transaction', () => {
            transactionPool.setTransaction(transaction);
        
            expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
        });
    });
});