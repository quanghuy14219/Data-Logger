import fs from "fs";
import path from "path";
require("dotenv").config();
const jwt = require("jsonwebtoken");

// const jwtPrivateKey = fs.readFileSync(
//   path.resolve(__dirname, "../rsa/private-key.pem")
// );

const signToken = (data, expiresIn = "1h") => {
  return jwt.sign(data, process.env.JWT_SECRET_KEY || "Nothing else", {
    expiresIn,
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET_KEY || "Nothing else");
  } catch (error) {
    return null;
  }
};

module.exports = {
  signToken,
  verifyToken,
};
