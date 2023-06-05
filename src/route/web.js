import express from "express";
import { dataController, viewController, userController } from "../controllers";
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

  // user
  router.post("/api/user/login", userController.login);
  router.post("/api/user/token", userController.refreshToken);
  router.get("/view/login", viewController.loginPage);
  router.get("/view/management", viewController.userPage);
  router.get("/api/user", userController.getAllUsers);
  router.post("/api/user", userController.createAccount);
  router.delete("/api/user/:id", userController.deleteAccount);
  router.get("/api/user/logout/:id", userController.logoutUser);
  router.put("/api/user", userController.changePassword);

  return app.use("/", router);
};

module.exports = initWebRouters;
