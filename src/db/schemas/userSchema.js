import { Schema } from "mongoose";

const userSchema = new Schema({
  username: String,
  password: String,
  role: {
    type: String,
    default: "USER",
  },
  active: {
    type: Boolean,
    default: true,
  },
  unit: String,
  phone: String,
  series: [String],
  createAt: { type: Date, default: Date.now },
  validAt: { type: Date, default: Date.now },
});
export default userSchema;
