const EC = require('elliptic').ec;
const cryptoHash = require('./crypto-hash');

// Standards of efficient cryptography - 256 bits prime number 
const ec = new EC('secp256k1');

const verifySignature = ({ publicKey, data, signature }) => {
    const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');

    return keyFromPublic.verify(cryptoHash(data), signature);
};

module.exports = { ec, verifySignature, cryptoHash };