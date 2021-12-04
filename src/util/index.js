const crypto = require('crypto');
const elliptic = require('elliptic');
const EdDSA = elliptic.eddsa;
const ec = new EdDSA('ed25519');
const cryptoHash = require('./crypto-hash');

const SALT = '0ffaa74d206930aaece253f090c88dbe6685b9e66ec49ad988d84fd7dff230d1';

const generateSecret = (password) => {
    // Create a 512 bit secret from a password
    let.secret = crypto.pbkdf2Sync(password, SALT, 10000, 512, 'sha512').toString('hex');
    return secret;
}

const generateKeyPairFromSecret = (secret) => {
    // Create a keypair from secret
    let keyPair = ec.keyFromSecret(secret); // Hex string, array or buffer
    return keyPair;
}

// Verify the authenticity of a signature
const verifySignature = ({ publicKey, data, signature }) => {
    const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');

    return keyFromPublic.verify(cryptoHash(data), signature);
};

// Convert incoming data to Hex
const toHex = (data) => {
    return elliptic.utils.toHex(data);
}

module.exports = { generateSecret, generateKeyPairFromSecret, verifySignature, toHex, cryptoHash };