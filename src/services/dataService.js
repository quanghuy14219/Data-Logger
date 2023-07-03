import { SVG2M, Seri } from "../db/models";

const isExisted = async (seri, time) => {
  try {
    const svg2m = await SVG2M.findOne({
      seri,
      time,
    });
    return svg2m;
  } catch (error) {
    return -1;
  }
};

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

const getDataWithPagination = async (query) => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const startIndex = (page - 1) * limit;
  try {
    const results = await SVG2M.find()
      .sort({ time: -1 })
      .skip(startIndex)
      .limit(limit)
      .exec();
    const count = await SVG2M.countDocuments().exec();
    const totalPages = Math.ceil(count / limit);
    return {
      results,
      count,
      totalPages,
      page,
      limit,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};

const queryData = async (query) => {
  let { series, beginTime, endTime, page, limit } = query;

  const findQuery = {};

  // Time
  const timeRequire = {};
  if (beginTime) {
    timeRequire.$gte = beginTime;
  }
  if (endTime) {
    timeRequire.$lte = endTime;
  }
  if (beginTime || endTime) {
    findQuery.time = timeRequire;
  }

  // Series
  if (series) {
    findQuery.seri = {
      $in: series,
    };
  }

  let dbQuery = SVG2M.find(findQuery).sort({ time: -1 });

  // Pagination
  let startIndex = page && limit ? (page - 1) * limit : 0;
  dbQuery = dbQuery.skip(startIndex);
  dbQuery = limit ? dbQuery.limit(limit) : dbQuery;

  try {
    const data = await dbQuery.exec();
    return data;
  } catch (error) {
    return null;
  }
};

const querySeries = async (query) => {
  let { prefix, page, limit } = query;
  let querySeries = prefix
    ? Seri.find({
        seriStr: {
          $regex: prefix,
        },
      })
    : Seri.find();

  // Pagination
  let startIndex = page && limit ? (page - 1) * limit : 0;
  querySeries = querySeries.skip(startIndex);
  if (limit) {
    querySeries = querySeries.limit(limit);
  }

  try {
    const series = await querySeries.exec();
    return series;
  } catch (error) {
    return null;
  }
};

const queryUserSeries = async (series) => {
  if (!series || series.length === 0) {
    return [];
  }
  // console.log(series);
  try {
    const userSeries = await Seri.find({
      seriStr: {
        $in: series,
      },
    }).exec();
    return userSeries;
  } catch (error) {
    return null;
  }
};

const createSeri = async (seri) => {
  try {
    const seriDB = await Seri.findOne({
      seri: seri,
    }).exec();
    if (!seriDB) {
      const newSeri = new Seri({
        seri: seri,
        seriStr: seri.toString(),
      });
      await newSeri.save();
      return newSeri;
    }
    return -1;
  } catch (error) {
    return false;
  }
};

const findSeriById = async (id) => {
  try {
    const seri = await Seri.findById(id).exec();
    return seri || -1;
  } catch (error) {
    return null;
  }
};

const getAllSeries = async () => {
  try {
    const series = await Seri.find()
      .sort({
        createAt: -1,
      })
      .exec();
    return series;
  } catch (error) {
    return null;
  }
};

const getNewestRecords = async (series) => {
  if (!series || !Array.isArray(series) || series.length === 0) {
    return [];
  }
  try {
    const data = await SVG2M.aggregate([
      { $match: { seriStr: { $in: series } } },
      { $sort: { seri: 1, time: -1 } },
      {
        $group: {
          _id: "$seri",
          latestRecord: { $first: "$$ROOT" },
        },
      },
    ]).exec();
    return data;
  } catch (error) {
    return null;
  }
};

module.exports = {
  saveData,
  getAllData,
  getDataWithPagination,
  queryData,
  isExisted,
  querySeries,
  createSeri,
  findSeriById,
  getAllSeries,
  queryUserSeries,
  getNewestRecords,
};
