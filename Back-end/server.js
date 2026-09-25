require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./src/app");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(3000, () => {
      console.log("the server run on the port 3000");
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });