import mongoose from "mongoose";
import { svg2mSchema, userSchema, seriSchema } from "../schemas";

import { collections } from "../collections";

const SVG2M = mongoose.model("SVG2M", svg2mSchema, collections.SVG2M);
const User = mongoose.model("User", userSchema, collections.user);
const Seri = mongoose.model("Seri", seriSchema, collections.seri);

module.exports = {
  SVG2M,
  User,
  Seri,
};
