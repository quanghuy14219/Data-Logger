import { Schema } from "mongoose";

const seriSchema = new Schema({
  seri: Number,
  seriStr: String,
  unit: String,
  phone: String,
  createAt: {
    type: Date,
    default: Date.now,
  },
});
export default seriSchema;
