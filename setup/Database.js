const mongoose = require("mongoose");

const DBconnections = async () => {
  try {
    mongoose
      .connect(
        "mongodb://localhost:27017/aesthetic-website",
      )
      .then(() => {
        // console.log(process.env.FRONTEND_URL);
        console.log("Connected to MongoDB");
      });
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  DBconnections,
};
