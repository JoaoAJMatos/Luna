const cryptoHash = require('../util/crypto-hash');

describe('cryptoHash()', () => {

    it('generates a SHA-256 hashed output', () => {
        expect(cryptoHash('luna')).toEqual('970ec274ca867815174ebe4eff19282000f9495a6c7254e94991d1fb4dc3df30')
    });

    it('produces the same hash with the same input arguments in any order', () => {
        expect(cryptoHash('one', 'two', 'three')).toEqual(cryptoHash('three', 'one', 'two'));
    });
});