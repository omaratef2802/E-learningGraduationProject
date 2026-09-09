const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("./configs/passport");
mongoose
  .connect("mongodb://127.0.0.1:27017/E-learning")
  .then(() => {
    console.log("the db runing successfuly");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.use(cors());
app.use(express.json());
app.use(express.Router());
app.use(passport.initialize());

const users = require("./Routers/users");
app.use("/E-learning/users", users);
app.use((err, req, res, next) => {
  let statusCode = err.statusCode ? err.statusCode : 500;
  res.status(statusCode).json({ message: err.message });
});
module.exports = { app };
