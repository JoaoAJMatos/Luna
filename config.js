const INITIAL_DIFFICULTY = 10;

module.exports = {
    GENESIS_DATA: {
        timestamp  : 1632567704,
        height     : 0,
        lastHash   : '970ec274ca867815174ebe4eff19282000f9495a6c7254e94991d1fb4dc3df30',
        hash       : 'todo-hash',
        data       : [],
        nonce      : 0,
        difficulty : INITIAL_DIFFICULTY
    },

    MINE_RATE: 10000,

    STARTING_BALANCE: 10,

    REWARD_INPUT: { address: '*REWARD*' },

    MINING_REWARD: 2, // TODO: See if my advanced chimp brain can implement a decreasing mining reward type of thingy

    PATH: `${process.env.APPDATA}/lunaBlockchain.json`, // Path to blockchain file

    PATH_LINUX: `~/.config/lunaBlockchain.json` // Path to blockchain file on Linux
};