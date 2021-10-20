const MINE_RATE = 1000;
const INITIAL_DIFFICULTY = 4;

const GENESIS_DATA = {
    timestamp  : 1632567704,
    lastHash   : '970ec274ca867815174ebe4eff19282000f9495a6c7254e94991d1fb4dc3df30',
    hash       : 'todo-hash',
    difficulty : INITIAL_DIFFICULTY,
    nonce      : 0,
    data       : []
};

const STARTING_BALANCE = 10;

const REWARD_INPUT  = { address: '*REWARD*' };

const MINING_REWARD = 2;

module.exports = { GENESIS_DATA, MINE_RATE, STARTING_BALANCE, REWARD_INPUT, MINING_REWARD };