import { SVG2M } from "../db/models";

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
  const opts = [{ $group: { _id: "$seri" } }];

  // Pagination
  let startIndex = page && limit ? (page - 1) * limit : 0;
  opts.push({ $skip: startIndex });
  limit && opts.push({ $limit: limit });

  try {
    const series = await SVG2M.distinct("seri");
    if (!prefix || !series) {
      return series.slice(startIndex || 0, limit || filterPrefix.length);
    }
    const filterPrefix = series.filter((seri) => {
      return seri.toString().startsWith(prefix);
    });

    const filterPagination = filterPrefix.slice(
      startIndex || 0,
      limit || filterPrefix.length
    );
    return filterPagination;
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
};
