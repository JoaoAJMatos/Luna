const EC = require('elliptic').ec

// Standards of efficient cryptography - prime 256 bits 
const ec = new EC('secp256k1');

module.exports = { ec };