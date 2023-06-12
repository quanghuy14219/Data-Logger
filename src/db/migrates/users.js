import { userService } from "../../services";

const users = [
  {
    username: "admin",
    password: "svg2m12345678",
    role: "ADMIN",
    unit: "Bộ đội Biên Phòng Bắc Giang",
    phone: "0384850711",
  },
  {
    username: "user1",
    password: "svg2m12345678",
    role: "USER",
    unit: "Bộ đội Biên Phòng Hà Tĩnh",
    phone: "0384850711",
    series: ["6050071"],
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
