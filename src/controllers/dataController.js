import { dataService } from "../services";
import { parseData } from "../utils/dataDB2View";
import { dispatchNewDataEvent } from "../config/socket";

const addData = async (req, res) => {
  const { svg2mData } = req;

  //   console.log(svg2mData);
  //   return res.send("1");

  const svg2m = await dataService.saveData(svg2mData);

  //   console.log(svg2m);

  if (svg2m) {
    dispatchNewDataEvent(parseData(svg2m));
    return res.status(200).send("1");
  } else {
    return res.status(200).send("0");
  }
};

module.exports = {
  addData,
};
