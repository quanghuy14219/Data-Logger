import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRouters from "./route/web";
import cors from "cors";
import http from "http";

import connectDB from "./config/connectDB";
import { openSocket } from "./config/socket";

require("dotenv").config();

const app = express();
const server = http.createServer(app);

// config app
app.use(bodyParser.json());
// app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: true }));

viewEngine(app);
initWebRouters(app);

connectDB();

let port = process.env.PORT || 80;

server.listen(port, () => {
  console.log("Running on the port: " + port);
});

openSocket(server, {
  cors: {
    origin: "*",
  },
});
