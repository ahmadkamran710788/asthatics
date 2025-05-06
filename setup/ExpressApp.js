const express = require("express");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const bodyParser = require("body-parser");
// const errorHandler = require("../middleware/errorHandler");
const routes = require("../routes/index");
const App = async (app) => {
  app.use(express.json());
  //   app.use(express.urlencoded({ extended: true }));
  app.use(bodyParser.json({ limit: "1gb" }));
  app.use(bodyParser.urlencoded({ limit: "1gb", extended: true }));
  app.use(
    cors({
      origin: "*",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  app.use(morgan("dev"));
  app.use(helmet());
  app.use("/api", routes);

  return app;
};

module.exports = {
  App,
};
