const { cryptoHash } = require('../util');

describe('cryptoHash()', () => {

    it('generates a SHA-256 hashed output', () => {
        expect(cryptoHash('luna')).toEqual('74a8e5bfb10432d38c26809d53222d39434a41c99e56ea4dd68614ff81b709af')
    });

    it('produces the same hash with the same input arguments in any order', () => {
        expect(cryptoHash('one', 'two', 'three')).toEqual(cryptoHash('three', 'one', 'two'));
    });

    it('produces a unique hash when the properties have changed on an input', () => {
        const obj = {};
        const originalHash = cryptoHash(obj);
        obj['a'] = 'a';

        expect(cryptoHash(obj)).not.toEqual(originalHash);
    });
});