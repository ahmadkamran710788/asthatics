const mongoose = require("mongoose");

const DBconnections = async () => {
  try {
    mongoose
      .connect(
        "mongodb+srv://amjadhasi009:3YodDQdjJ97Qw9vc@cluster0.qb2ns.mongodb.net/aesthetic?retryWrites=true&w=majority&appName=Cluster0",
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
