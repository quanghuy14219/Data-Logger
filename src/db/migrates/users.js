import { userService } from "../../services";

const users = [
  {
    username: "admin",
    password: "svg2m12345678",
    role: "ADMIN",
    permissions: {
      pushData: true,
      deleteData: true,
      getData: true,
      updateData: true,
      createAccount: true,
      deleteAccount: true,
      updateAccount: true,
    },
  },
  {
    username: "user1",
    password: "svg2m12345678",
    role: "USER",
    permissions: {
      getData: true,
    },
  },
];

const initUsers = async () => {
  await Promise.all(
    users.map(async (user) => {
      const isExisted = await userService.findByUsername(user.username);
      if (isExisted === -1) {
        await userService.createUser(user);
      }
    })
  );
};

module.exports = {
  initUsers,
};
