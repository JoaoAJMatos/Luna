const Wallet      = require('../wallet');
const Transaction = require('../wallet/transaction');
const Blockchain  = require('../blockchain');
const { verifySignature }  = require('../util');
const { STARTING_BALANCE } = require('../config');

describe('Wallet', () => {
    let wallet;

    beforeEach(() => { // Create new instance for every test
        wallet = new Wallet();
    });

    it('has a `balance`', () => {
        expect(wallet).toHaveProperty('balance');
    });

    it('has a `publicKey`', () => {
        //console.log(wallet.publicKey);

        expect(wallet).toHaveProperty('publicKey');
    });

    describe('signing data', () => {
        const data = 'test-data';

        it('verifies a signature', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: wallet.sign(data)
                })
            ).toBe(true);
        });

        it('does not verify an invalid signature', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: new Wallet().sign(data)
                })
            ).toBe(false);
        });
    });

    describe('createTransaction()', () => {
        describe('and the amount exceeds the balance', () => {
            it('throws an error', () => {
                expect(() => wallet.createTransaction({ amount: 999999, recipient: 'test-recipient' }))
                                                                    .toThrow('Amount exceeds balance');
            });
        });

        describe('and the amount is valid', () => {
            let transaction, amount, recipient;

            beforeEach(() => { // Create new transaction for every test
                amount = 5;
                recipient = 'test-recipient';
                transaction = wallet.createTransaction({ amount, recipient });
            });

            it('creates an instance of `Transaction`', () => {
                expect(transaction instanceof Transaction).toBe(true);
            });

            it('matches the transaction input with the wallet', () => {
                expect(transaction.input.address).toEqual(wallet.publicKey);
            });

            it('outputs the amount to the recipient', () => {
                expect(transaction.outputMap[recipient]).toEqual(amount);
            });
        });

        describe('and a chain is passed', () => {
            it('calls `Wallet.calculateBalance()`', () => {
                const calculateBalanceMock = jest.fn();

                const originalCalculateBalance = Wallet.calculateBalance;

                Wallet.calculateBalance = calculateBalanceMock;

                wallet.createTransaction({ 
                    recipient: 'test',
                    amount: 1,
                    chain: new Blockchain().chain
                });

                expect(calculateBalanceMock).toHaveBeenCalled();

                Wallet.calculateBalance = originalCalculateBalance;
            });
        });
    });

    describe('calculateBalance()', () => {
        let blockchain;

        beforeEach(() => {
            blockchain = new Blockchain();
        });

        describe('and there are no outputs for the wallet', () => { // If the wallet hasn't been involved in any transactions, return starting balance
            it('returns the `STARTING_BALANCE`', () => {
                expect(
                    Wallet.calculateBalance({ chain: blockchain.chain, address: wallet.publicKey })
                ).toEqual(STARTING_BALANCE);
            });
        });

        describe('and there are outputs for the wallet', () => {
            let transactionOne, transactionTwo;
    
            beforeEach(() => {
                transactionOne = new Wallet().createTransaction({
                    recipient: wallet.publicKey,
                    amount: 1
                });
    
                transactionTwo = new Wallet().createTransaction({
                    recipient: wallet.publicKey,
                    amount: 1
                });
    
                blockchain.addBlock({ data: [transactionOne, transactionTwo] });
            });
    
            it('adds the sum of all outputs to the wallet balance', () => {
                expect(
                    Wallet.calculateBalance({ chain: blockchain.chain, address: wallet.publicKey })
                ).toEqual(STARTING_BALANCE + transactionOne.outputMap[wallet.publicKey] + transactionTwo.outputMap[wallet.publicKey])
            });

            describe('and the wallet has made a transaction', () => {
                let recentTransaction;

                beforeEach(() => {
                    recentTransaction = wallet.createTransaction({ recipient : 'test', amount: 1 });

                    blockchain.addBlock({ data: [recentTransaction] });
                });

                it('returns the output amount of the recent transction', () => {
                    expect(
                        Wallet.calculateBalance({ 
                            chain: blockchain.chain,
                            address: wallet.publicKey
                        })
                    ).toEqual(recentTransaction.outputMap[wallet.publicKey]);
                });

                describe('and there are outputs next to and after the recent transaction', () => {
                    let sameBlockTransaction, nextBlockTransaction;

                    beforeEach(() => {
                        recentTransaction = wallet.createTransaction({
                            recipient: 'later-test-address',
                            amount: 1
                        });

                        sameBlockTransaction = Transaction.rewardTransaction({ minerWallet: wallet });

                        blockchain.addBlock({ data: [recentTransaction, sameBlockTransaction] });

                        nextBlockTransaction = new Wallet().createTransaction({
                            recipient: wallet.publicKey, amount: 2
                        });

                        blockchain.addBlock({ data: [nextBlockTransaction] });
                    });

                    it('includes the output amounts in the returned balance', () => {
                        expect(
                            Wallet.calculateBalance({ 
                                chain: blockchain.chain,
                                address: wallet.publicKey
                            })
                        ).toEqual(
                            recentTransaction.outputMap[wallet.publicKey] + sameBlockTransaction.outputMap[wallet.publicKey] + nextBlockTransaction.outputMap[wallet.publicKey]
                        );
                    });
                });
            });
        });
    });
});