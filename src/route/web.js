import express from "express";
import { dataController, viewController } from "../controllers";
import { dataMiddleware } from "../middlewares";

const router = express.Router();

const initWebRouters = (app) => {
  router.get("/", (req, res) => {
    return res.status(200).send("Hello");
  });
  // For post new svg2m data
  router.get(
    "/api/data",
    dataMiddleware.dataValidCheck,
    dataController.addData
  );
  // For get svg2m data
  router.get("/api/data/pagination", dataController.getDataByQuery);
  router.get("/view", viewController.viewSVG2M);

  // View page
  router.get("/view/svg2m", viewController.viewSvg2mPage);

  router.get("/api/svg2m", dataMiddleware.parseQuery, dataController.getData);

  router.get("/api/svg2m/series", dataController.querySeries);
  return app.use("/", router);
};

module.exports = initWebRouters;
