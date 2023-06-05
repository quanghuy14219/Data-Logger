import users from "./users";

const initAll = async () => {
  await users.initUsers();
};

module.exports = {
  initAll,
  users,
};
