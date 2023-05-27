import { dataService } from "../services";

const stringToDate = (str) => {
  const dateTimeParts = str.split(" ");
  const dateParts = dateTimeParts[0].split("/");
  const timeParts = dateTimeParts[1].split(":");
  const dateObject = new Date(
    parseInt(dateParts[2]),
    parseInt(dateParts[1]) - 1,
    parseInt(dateParts[0]),
    parseInt(timeParts[0]),
    parseInt(timeParts[1]),
    parseInt(timeParts[2])
  );
  return dateObject;
};

const isValidDate = (dateString) => {
  var regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(dateString)) {
    return false;
  }

  var parts = dateString.split("/");
  var day = parseInt(parts[0], 10);
  var month = parseInt(parts[1], 10);
  var year = parseInt(parts[2], 10);
  if (year < 1000 || year > 3000 || month == 0 || month > 12) {
    return false;
  }

  var maxDays = new Date(year, month, 0).getDate();
  if (day > maxDays || day == 0) {
    return false;
  }

  return true;
};

const isValidTime = (timeString) => {
  var regex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  if (!regex.test(timeString)) {
    return false;
  }

  var parts = timeString.split(":");
  var hour = parseInt(parts[0], 10);
  var minute = parseInt(parts[1], 10);
  var second = parseInt(parts[2], 10);
  if (hour > 23 || minute > 59 || second > 59) {
    return false;
  }

  return true;
};

const dataValidCheck = async (req, res, next) => {
  const params = req.query;

  const requireField = [
    "seri",
    "date",
    "time",
    // "longitude",
    // "latitude",
    "mode",
    "draDoseRate",
    "draDose",
    "neutron",
    "actAlpha",
    "actBeta",
    "actGamma",
  ];

  // Check null
  for (const field of requireField) {
    if (!params[field]) {
      console.log(`Missing ${field}`);
      return res.status(400).send("0");
    }
  }

  const svg2mData = {};
  [
    "seri",
    "longitude",
    "latitude",
    "mode",
    "draDoseRate",
    "draDose",
    "neutron",
    "actAlpha",
    "actBeta",
    "actGamma",
  ].forEach((field) => {
    const val = params[field];
    if (val && !isNaN(val)) {
      svg2mData[field] = parseFloat(val);
    }
    // console.log(svg2mData[field]);
  });

  // Check valid
  const valid = {
    seri: svg2mData.seri > 3300000,
    longitude:
      !svg2mData.longitude ||
      (svg2mData.longitude >= -180 && svg2mData.longitude <= 180),
    latitude:
      !svg2mData.latitude ||
      (svg2mData.latitude >= -180 && svg2mData.latitude <= 180),
    mode: svg2mData.mode === 0 || svg2mData.mode === 1,
    draDoseRate: svg2mData.mode >= 0,
    draDose: svg2mData.draDose >= 0,
    neutron: svg2mData.neutron >= 0,
    actAlpha: svg2mData.actAlpha >= 0,
    actBeta: svg2mData.actBeta >= 0,
    actGamma: svg2mData.actGamma >= 0,
    date: isValidDate(params.date),
    time: isValidTime(params.time),
  };

  //   console.log(valid);

  const isValidAll = Object.values(valid).every((t) => t);
  if (!isValidAll) {
    return res.status(400).send("0");
  }

  const timeStamp = params.date + " " + params.time;
  svg2mData.time = stringToDate(timeStamp);

  // Check duplicate seri and time
  const svg2mExisted = await dataService.isExisted(
    svg2mData.seri,
    svg2mData.time
  );
  if (svg2mExisted || svg2mExisted === -1) {
    return res.status(400).send("0");
  }

  req.svg2mData = svg2mData;
  next();
};

const parseQuery = (req, res, next) => {
  const query = req.query || {};

  try {
    const arr = query.series && query.series.split(",").map(Number);
    query.series =
      arr && arr.length !== 0 && arr.every((seri) => !isNaN(seri)) ? arr : null;

    ["beginTime", "endTime", "page", "limit"].forEach((key) => {
      const value = query[key];
      query[key] = value && !isNaN(value) ? Number(value) : null;
    });
  } catch (error) {
    return res.status(400).json({
      err: "Invalid request! The request must like: /?[series=a,b,c,...]&[beginTime=<Number>]&[endTime=<Number>]&[page=<Number>]&[limit=<Number>]",
    });
  }
  req.query = query;
  next();
};

module.exports = {
  dataValidCheck,
  parseQuery,
};
