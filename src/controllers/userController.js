import { userService, jwtService } from "../services";
import {
  dispatchNewAccountEvent,
  dispatchDeleteAccountEvent,
  dispatchLogoutEvent,
  dispatchChangeInfoEvent,
  dispatchChangeSeriesEvent,
} from "../config/socket";

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).json({
      err: "Vui lòng điền username.",
    });
  }
  if (!password) {
    return res.status(400).json({
      err: "Vui lòng điền mật khẩu",
    });
  }
  const user = await userService.findByUsername(username);
  if (!user || user === -1) {
    return res.status(404).json({
      err: `Tài khoản \"${username}\" không tồn tại.`,
    });
  }
  if (user.password !== password) {
    return res.status(400).json({
      err: "Mật khẩu không chính xác.",
    });
  }
  const jwtToken = jwtService.signToken(
    {
      _id: user._id,
      permissions: user.permissions,
      role: user.role,
      active: user.active,
    },
    60 * 60
  );
  const resUser = {
    role: user.role,
    _id: user._id,
    username: user.username,
    active: user.active,
    role: user.role,
    unit: user.unit,
    phone: user.phone,
  };

  return res.status(200).json({
    user: resUser,
    token: jwtToken,
  });
};

const refreshToken = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({
      err: "Missing token in request body",
    });
  }
  const jwtUser = jwtService.verifyToken(token);
  if (!jwtUser) {
    return res.status(400).json({
      err: "Token invalid",
    });
  }
  if (!jwtUser._id) {
    return res.status(400).json({
      err: "Token invalid",
    });
  }
  const user = await userService.findById(jwtUser._id);
  if (!user || user === -1) {
    return res.status(404).json({
      err: `No account with id ${jwtUser._id} found`,
    });
  }
  if (jwtUser.iat * 1000 < user.validAt.getTime()) {
    return res.status(400).json({
      err: "Token invalid",
    });
  }
  const jwtToken = jwtService.signToken(
    {
      _id: user._id,
      permissions: user.permissions,
      role: user.role,
      active: user.active,
    },
    60 * 60
  );
  const resUser = {
    role: user.role,
    _id: user._id,
    username: user.username,
    active: user.active,
    role: user.role,
    unit: user.unit,
    phone: user.phone,
  };
  return res.status(200).json({
    user: resUser,
    token: jwtToken,
  });
};

const adminCheck = async (req, res) => {
  const token = req?.headers.authorization;
  if (!token) {
    return res.status(400).json({
      err: "Missing token in request headers",
    });
  }
  const jwtUser = jwtService.verifyToken(token);
  if (!jwtUser) {
    return res.status(400).json({
      err: "Token invalid",
    });
  }

  const user = await userService.findById(jwtUser._id);
  if (!user || user === -1) {
    return res.status(404).json({
      err: `No account with id ${jwtUser._id} found`,
    });
  }
  if (!user.role || user.role !== "ADMIN") {
    return res.status(400).json({
      err: "Not permission",
    });
  }
  return null;
};

const getAllUsers = async (req, res) => {
  const isNotAdmin = await adminCheck(req, res);
  if (isNotAdmin) {
    return isNotAdmin;
  }

  const users = await userService.getAll();
  if (!users) {
    return res.status(500).json({
      err: "Internal server error",
    });
  }

  return res.status(200).json({
    users: users,
  });
};

const createAccount = async (req, res) => {
  const isNotAdmin = await adminCheck(req, res);
  if (isNotAdmin) {
    return isNotAdmin;
  }
  const { username, password, unit, phone } = req.body;

  if (!username) {
    return res.status(400).json({
      err: "Missing username",
    });
  }
  if (!password) {
    return res.status(400).json({
      err: "Missing password",
    });
  }
  if (!unit) {
    return res.status(400).json({
      err: "Missing unit",
    });
  }
  if (!phone) {
    return res.status(400).json({
      err: "Missing phone",
    });
  }

  const user = await userService.findByUsername(username);
  if (user && user !== -1) {
    return res.status(403).json({
      err: "Username existed",
    });
  }
  if (user === -1) {
    const newUser = await userService.createUser({
      username: username,
      password: password,
      role: "USER",
      active: true,
      unit: unit,
      phone: phone,
    });
    if (newUser) {
      dispatchNewAccountEvent({
        username: newUser.username,
        _id: newUser._id,
        role: newUser.role,
        unit: unit,
        phone: phone,
        createAt: newUser.createAt,
      });
      return res.status(200).json({
        msg: "Create account successfully",
      });
    }
  }
  return res.status(500).json({
    err: "Internal server error",
  });
};

const deleteAccount = async (req, res) => {
  const isNotAdmin = await adminCheck(req, res);
  if (isNotAdmin) {
    return isNotAdmin;
  }
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      err: "Missing id",
    });
  }
  const user = await userService.findById(id);
  if (user && user === -1) {
    return res.status(404).json({
      err: `No user with id ${id} found`,
    });
  }
  if (user && user.role === "ADMIN") {
    return res.status(403).json({
      err: "Can not delete admin account",
    });
  }
  const removedUser = await userService.removeById(id);
  if (!removedUser) {
    return res.status(500).json({
      err: "Internal server error",
    });
  }
  dispatchDeleteAccountEvent(removedUser._id);
  return res.status(200).json({
    msg: "Delete account successfully",
  });
};

const logoutUser = async (req, res) => {
  const isNotAdmin = await adminCheck(req, res);
  if (isNotAdmin) {
    return isNotAdmin;
  }
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      err: "Missing id",
    });
  }
  const user = await userService.findById(id);
  if (user) {
    try {
      user.validAt = new Date();
      await user.save();
    } catch (error) {
      console.log(error);
    }
  }
  dispatchLogoutEvent(id);
};

const changePassword = async (req, res) => {
  const isNotAdmin = await adminCheck(req, res);
  if (isNotAdmin) {
    return isNotAdmin;
  }
  const { id, password } = req.body;
  if (!id) {
    return res.status(400).json({
      err: "Missing id",
    });
  }
  if (!password) {
    return res.status(400).json({
      err: "Missing password",
    });
  }
  const user = await userService.findById(id);
  if (!user || user === -1) {
    return res.status(404).json({
      err: `No user with id ${id} found`,
    });
  }
  try {
    user.password = password;
    // user.validAt = new Date();
    await user.save();
    return res.status(200).json({
      msg: "Change password successfully",
    });
  } catch (error) {
    return res.status(500).json({
      err: "Internal server error",
    });
  }
};

const changeInfo = async (req, res) => {
  const isNotAdmin = await adminCheck(req, res);
  if (isNotAdmin) {
    return isNotAdmin;
  }
  const { id, unit, contact } = req.body;
  if (!id) {
    return res.status(400).json({
      err: "Missing id",
    });
  }
  if (unit === undefined) {
    return res.status(400).json({
      err: "Missing unit",
    });
  }
  if (contact === undefined) {
    return res.status(400).json({
      err: "Missing contact",
    });
  }
  const user = await userService.findById(id);
  if (!user || user === -1) {
    return res.status(404).json({
      err: `No user with id ${id} found`,
    });
  }
  try {
    user.unit = unit;
    user.phone = contact;
    await user.save();
    dispatchChangeInfoEvent({
      username: user.username,
      _id: user._id,
      role: user.role,
      unit: unit,
      phone: contact,
      createAt: user.createAt,
    });
    return res.status(200).json({
      msg: "Change information successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      err: "Internal server error",
    });
  }
};

const updateSeries = async (req, res) => {
  const isNotAdmin = await adminCheck(req, res);
  if (isNotAdmin) {
    return isNotAdmin;
  }
  const { id, series, push } = req.body;
  if (!id) {
    return res.status(400).json({
      err: "Missing id",
    });
  }
  if (!series || !Array.isArray(series) || series.length === 0) {
    return res.status(400).json({
      err: "Missing series",
    });
  }
  let result = null;
  if (!push) {
    result = await userService.removeSeries(id, series);
  } else {
    result = await userService.pushSeries(id, series);
  }
  if (!result) {
    return res.status(500).json({
      err: "Internal server error",
    });
  }
  dispatchChangeSeriesEvent({ _id: result._id, series: result.series });
  return res.status(200).json({
    msg: `${push ? "Push" : "Remove"} series successfully`,
    // user: result,
  });
};

module.exports = {
  login,
  refreshToken,
  getAllUsers,
  createAccount,
  deleteAccount,
  logoutUser,
  changePassword,
  changeInfo,
  updateSeries,
  adminCheck,
};
