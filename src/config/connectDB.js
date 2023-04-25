import mongoose from "mongoose";
require("dotenv").config();

const useURI = () => {
  const map = {
    development: process.env.MONGODB_LOCAL_URI,
    product: process.env.MONGODB_CLOUD_URI,
  };
  const uri = map[process.env.APP_MODE];
  if (!uri) {
    console.error(
      "Some environment variables is missing. Please check file .env at src/.env"
    );
    console.error(
      `State of environment variables cause error: \nAPP_MODE: ${process.env.APP_MODE}\n`
    );
  }
  console.info(
    `INFO: You are using database URI for ${process.env.APP_MODE}. Change APP_MODE at .env file to link to other URI`
  );
  return uri;
};

const connectDB = async () => {
  mongoose.connect(useURI(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const conn = mongoose.connection;
  conn.on("connected", function () {
    console.log("database is connected successfully");
  });
  conn.on("disconnected", function () {
    console.log("database is disconnected successfully");
  });
  conn.on("error", console.error.bind(console, "connection error:"));
};

export default connectDB;
