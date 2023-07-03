import { dataService, userService } from "../services";
import { parseData } from "../utils/dataDB2View";
import {
  dispatchNewDataEvent,
  dispatchNewSeriEvent,
  dispatchChangeSeriInfoEvent,
} from "../config/socket";
import { adminCheck } from "./userController";

const addData = async (req, res) => {
  const { svg2mData } = req;

  const seri = await dataService.createSeri(svg2mData.seri);
  if (!seri) {
    return res.status(200).send("0");
  }

  if (seri && seri !== -1) {
    dispatchNewSeriEvent(seri);
  }

  const svg2m = await dataService.saveData(svg2mData);

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
  let { prefix, page, limit, id } = query;
  if (!id) {
    return res.status(400).json({
      err: "Missing id",
    });
  }

  const user = await userService.findById(id);
  if (!user) {
    return res.status(404).json({
      err: `No user with id ${id} found`,
    });
  }

  if (user.role === "USER") {
    let userSeries = await dataService.queryUserSeries(user.series);
    if (!userSeries) {
      return req.status(500).json({
        err: "Internal server error",
      });
    }
    if (prefix) {
      userSeries = userSeries.filter((seri) => seri.seriStr.startsWith(prefix));
    }

    const startIndex = page && limit ? (page - 1) * limit : 0;
    userSeries = userSeries.slice(startIndex, startIndex + (limit || 5));
    return res.status(200).json(userSeries);
  }

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

const changeSeriInfo = async (req, res) => {
  const isNotAdmin = await adminCheck(req, res);
  if (isNotAdmin) {
    return isNotAdmin;
  }
  const { id, unit, contact } = req.body;
  if (!id) {
    return res.status(400).json({
      err: "Missing id",
    });
  }
  if (unit === undefined) {
    return res.status(400).json({
      err: "Missing unit",
    });
  }
  if (contact === undefined) {
    return res.status(400).json({
      err: "Missing contact",
    });
  }

  const seri = await dataService.findSeriById(id);
  if (!seri || seri === -1) {
    return res.status(404).json({
      err: `No seri with id ${id} found`,
    });
  }
  try {
    seri.unit = unit;
    seri.phone = contact;
    await seri.save();
    dispatchChangeSeriInfoEvent({
      _id: seri._id,
      unit: seri.unit,
      phone: contact,
    });
    return res.status(200).json({
      msg: "Change information successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      err: "Internal server error",
    });
  }
};

const getAllSeries = async (req, res) => {
  const isNotAdmin = await adminCheck(req, res);
  if (isNotAdmin) {
    return isNotAdmin;
  }
  const series = await dataService.getAllSeries();
  if (!series) {
    return res.status(500).json({
      err: "Internal server error",
    });
  }
  return res.status(200).json({
    series: series,
  });
};

const getNewestRecords = async (req, res) => {
  const query = req.query || {};
  let { id } = query;
  if (!id) {
    return res.status(400).json({
      err: "Missing id",
    });
  }

  const user = await userService.findById(id);
  if (!user) {
    return res.status(404).json({
      err: `No user with id ${id} found`,
    });
  }

  let series = null;
  if (user.role === "USER") {
    series = await dataService.queryUserSeries(user.series);
  } else {
    series = await dataService.querySeries({});
  }

  if (!series) {
    return req.status(500).json({
      err: "Internal server error",
    });
  }

  series = series.map((s) => s.seriStr);
  const records = await dataService.getNewestRecords(series);
  if (!records) {
    return req.status(500).json({
      err: "Internal server error",
    });
  }

  const convertRecords = records.map((record) => {
    const svg2m = record.latestRecord;
    svg2m.time = new Date(svg2m.time);
    const dateTime = parseData(svg2m);
    return {
      ...svg2m,
      ...dateTime,
    };
  });

  return res.status(200).json(convertRecords);
};

module.exports = {
  addData,
  getDataByQuery,
  getData,
  querySeries,
  changeSeriInfo,
  getAllSeries,
  getNewestRecords,
};
