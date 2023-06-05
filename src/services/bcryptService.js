const bcrypt = require("bcrypt");
const saltRounds = 10;

const hash = async (password) => {
  return new Promise(async (resolve, reject) => {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (hash) {
        resolve(hash);
      }
      if (err) {
        reject(null);
      }
    });
  });
};

const compare = async (plainPassword, hash) => {
  const match = await bcrypt.compare(plainPassword, hash);
  return match;
};

module.exports = {
  hash,
  compare,
};
