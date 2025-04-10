// import express from "express";
// import App from "./services/ExpressApp";
// import DBconnections from "./services/Database";
// import { PORT } from "./config";
const { DBconnections } = require("./setup/Database");
const express = require("express");
const { App } = require("./setup/ExpressApp");
require("dotenv").config();
const startServer = async () => {
  const PORT = 8000;
  const app = express();
  await DBconnections();
  await App(app);
  app.listen(PORT, () => {
    console.log(`we are live on port ${PORT}`);
  });
};

startServer();
