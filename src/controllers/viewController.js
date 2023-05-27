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

const viewSvg2mPage = async (req, res) => {
  const lastUpdatedSvg2m = await dataService.queryData({ limit: 1 });
  return res.render("seri.ejs", {
    MAP_API_KEY: process.env.MAP_API_KEY,
    MAP_API_V: process.env.MAP_API_V,
    LAST_UPDATED_SERI:
      lastUpdatedSvg2m &&
      lastUpdatedSvg2m.length > 0 &&
      lastUpdatedSvg2m[0].seri,
  });
};

module.exports = {
  viewSVG2M,
  viewSvg2mPage,
};
