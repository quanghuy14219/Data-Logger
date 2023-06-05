import mongoose from "mongoose";
import { svg2mSchema, userSchema } from "../schemas";
import { collections } from "../collections";

const SVG2M = mongoose.model("SVG2M", svg2mSchema, collections.SVG2M);
const User = mongoose.model("User", userSchema, collections.user);

module.exports = {
  SVG2M,
  User,
};
