const fs = require('fs');

const getLastModify = (path) => {
          let stats = fs.statSync(path);
          return stats.mtime;
};

module.exports = getLastModify;