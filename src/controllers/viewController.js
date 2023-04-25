import { dataService } from "../services";
import { parseData } from "../utils/dataDB2View";

const viewSVG2M = async (req, res) => {
  const svg2mData = await dataService.getAllData();

  if (!svg2mData) {
    return res.status(500).send("Internal server error");
  }

  const converted = svg2mData.map((data) => {
    return parseData(data);
  });

  return res.render("experimental-data-logger.ejs", {
    data: converted,
  });
};

module.exports = {
  viewSVG2M,
};
