const TransactionPool = require('../wallet/transaction-pool');
const Transaction     = require('../wallet/transaction');
const Wallet          = require('../wallet/index');

describe('TransactionPool', () => {
    let transactionPool, transaction, senderWallet;

    beforeEach(() => {
        transactionPool = new TransactionPool();
        senderWallet    = new Wallet()
        transaction     = new Transaction({ senderWallet, recipient: 'test', amount: 2 });
    });

    describe('setTransaction()', () => {
        it('adds a transaction', () => {
            transactionPool.setTransaction(transaction);
        
            expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
        });
    });

    describe('existingTransaction()', () => {
        it('returns an existing transaction given an input address', () => {
            transactionPool.setTransaction(transaction);

            expect(
                transactionPool.existingTransaction({ inputAddress: senderWallet.publicKey })
            ).toBe(transaction);
        });
    });

    describe('validTransactions()', () => {
        let validTransactions, errorMock;

        beforeEach(() => {
            validTransactions    = [];
            errorMock            = jest.fn();
            global.console.error = errorMock;

            for (let i=0; i<10; i++) {
                transaction = new Transaction({
                    senderWallet,
                    recipient: 'test',
                    amount: 1
                });

                if (i % 3 === 0) { // Invalidate some transactions for testing
                    transaction.input.amount = 100;
                } else if (i % 3 === 1) { // Transaction with bad signature
                    transaction.input.signature = new Wallet().sign('foo');
                } else { // Valid transaction
                    validTransactions.push(transaction);
                }
    
                transactionPool.setTransaction(transaction);
            }
        });

        it('returns valid transactions', () => {
            expect(transactionPool.validTransactions()).toEqual(validTransactions);
        });

        it('logs errors for the invalid transactions', () => {
            transactionPool.validTransactions();
            expect(errorMock).toHaveBeenCalled();
        });
    });
});