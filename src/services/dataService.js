import { SVG2M } from "../db/models";

const saveData = async (svg2mData) => {
  const svg2m = new SVG2M(svg2mData);
  try {
    await svg2m.save();
    return svg2m;
  } catch (error) {
    console.log("ERROR when save new data: ");
    console.log("==> Data description");
    console.log(svg2mData);
    console.log("<======================>");
    return null;
  }
};

const getAllData = async () => {
  try {
    const data = await SVG2M.find().sort({ time: -1 }).exec();
    return data;
  } catch (error) {
    return null;
  }
};

module.exports = {
  saveData,
  getAllData,
};
