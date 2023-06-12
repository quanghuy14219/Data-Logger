const fs = require("fs");
import path from "path";

const randInt = (a, b) => {
  const range = b - a + 1;
  const random = Math.floor(Math.random() * range);
  return a + random;
};

const randomFloat = () => {
  // Generate a random number between 0 and 100 (exclusive)
  const random = Math.random();

  // Limit the number to two decimal places
  const rounded = Math.floor(random * 100) / 100;

  return rounded;
};

const randomData = (numSeri = 5, countPer = 500) => {
  const svg2mData = [];
  const series = [];
  for (let sIndex = 0; sIndex < numSeri; sIndex++) {
    const seri = randInt(4000000, 9999999);
    let lastTime = new Date();
    series.push({
      seri: seri,
      seriStr: seri.toString(),
      createAt: lastTime.getTime(),
    });

    Array.from(Array(countPer), (_, index) => {
      lastTime = new Date(lastTime.getTime() - randInt(60, 600) * 1000);
      svg2mData.push({
        seri: seri,
        seriStr: seri.toString(),
        time: lastTime,
        longitude: randInt(1, 179),
        latitude: randInt(1, 90),
        mode: randInt(0, 1),
        draDoseRate: randomFloat(),
        draDose: randomFloat(),
        neutron: randomFloat(),
        actAlpha: randomFloat(),
        actBeta: randomFloat(),
        actGamma: randomFloat(),
        createAt: lastTime,
      });
    });
  }
  return [svg2mData, series];
};

const initSvg2mData = () => {
  const [svg2mData, series] = randomData();
  const jsonStringSvg2m = JSON.stringify(svg2mData);
  const jsonStringSeries = JSON.stringify(series);
  fs.writeFile(
    path.resolve(__dirname, "../data/svg2m.json"),
    jsonStringSvg2m,
    (err) => {
      if (err) {
        console.error("Error writing JSON file:", err);
      } else {
        console.log("Array saved to JSON file SVG2M successfully.");
      }
    }
  );
  fs.writeFile(
    path.resolve(__dirname, "../data/series.json"),
    jsonStringSeries,
    (err) => {
      if (err) {
        console.error("Error writing JSON file:", err);
      } else {
        console.log("Array saved to JSON file SVG2M successfully.");
      }
    }
  );
};

module.exports = {
  initSvg2mData,
};
