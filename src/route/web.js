import express from "express";
import { dataController, viewController, userController } from "../controllers";
import { dataMiddleware } from "../middlewares";

const router = express.Router();

const initWebRouters = (app) => {
  // For post new svg2m data
  router.get(
    "/api/data",
    dataMiddleware.dataValidCheck,
    dataController.addData
  );
  // For get svg2m data
  router.get("/api/data/pagination", dataController.getDataByQuery);

  // View page
  router.get("/table-data", viewController.viewSVG2M);
  router.get("/", viewController.viewSvg2mPage);
  router.get("/login", viewController.loginPage);
  router.get("/management", viewController.userPage);
  router.get("/series", viewController.mapSeriesPage);

  router.get("/api/svg2m", dataMiddleware.parseQuery, dataController.getData);
  router.get("/api/svg2m/series", dataController.querySeries);
  router.get("/api/svg2m/records", dataController.getNewestRecords);

  // user
  router.post("/api/user/login", userController.login);
  router.post("/api/user/token", userController.refreshToken);
  router.get("/api/user", userController.getAllUsers);
  router.post("/api/user", userController.createAccount);
  router.delete("/api/user/:id", userController.deleteAccount);
  router.get("/api/user/logout/:id", userController.logoutUser);
  router.put("/api/user/password", userController.changePassword);
  router.put("/api/user/info", userController.changeInfo);
  router.put("/api/user/series", userController.updateSeries);

  // seri
  router.put("/api/series", dataController.changeSeriInfo);
  router.get("/api/series", dataController.getAllSeries);

  return app.use("/", router);
};

module.exports = initWebRouters;
