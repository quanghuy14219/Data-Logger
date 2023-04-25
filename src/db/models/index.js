import mongoose from "mongoose";
import { svg2mSchema } from "../schemas";
import { collections } from "../collections";

const SVG2M = mongoose.model("SVG2M", svg2mSchema, collections.SVG2M);

module.exports = {
  SVG2M,
};
