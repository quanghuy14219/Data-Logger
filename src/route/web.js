import express from "express";
import { dataController, viewController } from "../controllers";
import { dataMiddleware } from "../middlewares";

const router = express.Router();

const initWebRouters = (app) => {
  router.get("/", (req, res) => {
    return res.status(200).send("Hello");
  });
  router.get(
    "/api/data",
    dataMiddleware.dataValidCheck,
    dataController.addData
  );
  router.get("/view", viewController.viewSVG2M);
  return app.use("/", router);
};

module.exports = initWebRouters;
