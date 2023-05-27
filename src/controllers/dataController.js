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

const getDataByQuery = async (req, res) => {
  const query = req.query || {};
  if (query.page && typeof query.page === "string") {
    query.page = parseInt(query.page);
  }
  if (query.limit && typeof query.limit === "string") {
    query.limit = parseInt(query.limit);
  }

  const data = await dataService.getDataWithPagination(query);
  if (!data) {
    return res.status(500).send("Internal Server Error");
  }
  // Parse data split into date and time fields
  data.results = data.results.map((data) => {
    return parseData(data);
  });
  return res.status(200).json(data);
};

const getData = async (req, res) => {
  const query = req.query;
  const svg2mData = await dataService.queryData(query);
  if (!svg2mData) {
    return req.status(500).json({
      err: "Internal server error",
    });
  }

  const converted = svg2mData.map((svg2m) => {
    return parseData(svg2m);
  });
  return res.status(200).json(converted);
};

const querySeries = async (req, res) => {
  const query = req.query || {};
  let { prefix, page, limit } = query;
  // query.prefix = page && !isNaN(prefix) && Number(prefix);
  query.page = page && !isNaN(page) && Number(page);
  query.limit = limit && !isNaN(limit) && Number(limit);
  const series = await dataService.querySeries(query);
  if (!series) {
    return req.status(500).json({
      err: "Internal server error",
    });
  }
  return res.status(200).json(series);
};

module.exports = {
  addData,
  getDataByQuery,
  getData,
  querySeries,
};
