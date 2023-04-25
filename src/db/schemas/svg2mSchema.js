import { Schema } from "mongoose";

const svg2mSchema = new Schema({
  seri: Number,
  time: Date,
  longitude: Number,
  latitude: Number,
  mode: Number,
  draDoseRate: Number,
  draDose: Number,
  neutron: Number,
  actAlpha: Number,
  actBeta: Number,
  actGamma: Number,
  createAt: { type: Date, default: Date.now },
});
export default svg2mSchema;
