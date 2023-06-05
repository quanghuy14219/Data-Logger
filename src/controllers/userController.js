import { userService, jwtService } from "../services";
import {
  dispatchNewAccountEvent,
  dispatchDeleteAccountEvent,
  dispatchLogoutEvent,
} from "../config/socket";

const login = async (req, res) => {
  const { username, password } = req.body;
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
  const user = await userService.findByUsername(username);
  if (!user || user === -1) {
    return res.status(404).json({
      err: `No username ${username} found`,
    });
  }
  if (user.password !== password) {
    return res.status(400).json({
      err: "Password incorrect",
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
    permissions: user.permissions,
    active: user.active,
    role: user.role,
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
    permissions: user.permissions,
    active: user.active,
    role: user.role,
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
  const { username, password } = req.body;
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
    });
    if (newUser) {
      dispatchNewAccountEvent({
        username: newUser.username,
        _id: newUser._id,
        role: newUser.role,
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

module.exports = {
  login,
  refreshToken,
  getAllUsers,
  createAccount,
  deleteAccount,
  logoutUser,
  changePassword,
};
