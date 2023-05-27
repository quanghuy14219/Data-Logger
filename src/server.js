import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRouters from "./route/web";
import cors from "cors";
import fs from "fs";
import http from "http";
import https from "https";

import connectDB from "./config/connectDB";
import { configSocket } from "./config/socket";
import path from "path";
const ioServer = require("socket.io");

require("dotenv").config();

const app = express();
// config app
app.use(bodyParser.json());
// app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: true }));

viewEngine(app);
initWebRouters(app);

connectDB();

const httpServer = http.createServer(app);
httpServer.listen(process.env.HTTP_PORT || 80, () => {
  console.log(`http server listening on port ${process.env.HTTP_PORT || 80}`);
});

const httpsServer = https.createServer(
  {
    key: fs.readFileSync(path.resolve(__dirname, "./rsa/key.pem")),
    cert: fs.readFileSync(path.resolve(__dirname, "./rsa/cert.pem")),
  },
  app
);
httpsServer.listen(process.env.HTTP_PORT || 443, () => {
  console.log(`http server listening on port ${process.env.HTTPS_PORT || 443}`);
});

const io = ioServer();

io.attach(httpServer, {
  cors: {
    origin: "*",
  },
});

io.attach(httpsServer, {
  cors: {
    origin: "*",
  },
});

configSocket(io);
