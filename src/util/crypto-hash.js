const crypto = require('crypto');

// Returns the SHA-256 hash of a map of inputs
const cryptoHash = (...inputs) => {
    const hash = crypto.createHash('sha256');
    
    hash.update(inputs.map(input => JSON.stringify(input)).sort().join(' '));

    return hash.digest('hex');
};

module.exports = cryptoHash;