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
  permissions: {
    pushData: {
      type: Boolean,
      default: false,
    },
    deleteData: {
      type: Boolean,
      default: false,
    },
    getData: {
      type: Boolean,
      default: false,
    },
    updateData: {
      type: Boolean,
      default: false,
    },
    createAccount: {
      type: Boolean,
      default: false,
    },
    deleteAccount: {
      type: Boolean,
      default: false,
    },
    updateAccount: {
      type: Boolean,
      default: false,
    },
  },
  createAt: { type: Date, default: Date.now },
});
export default userSchema;
