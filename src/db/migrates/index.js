import users from "./users";
import svg2m from "./svg2m";

const initAll = async () => {
  await users.initUsers();
  // svg2m.initSvg2mData();
};

module.exports = {
  initAll,
  users,
};
