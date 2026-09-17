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
const cartRouter = require("./Routers/Cart");
const wishlistRouter = require("./Routers/Wishlist");
const orderRouter = require("./Routers/Order");
const paymentRouter = require("./Routers/Payment");
const refundRouter = require("./Routers/Refund");
const walletRouter = require("./Routers/Wallet");
const payoutRouter = require("./Routers/Payout");
app.use("/E-learning/users", users);
app.use("/cart", cartRouter);
app.use("/wishlist", wishlistRouter);
app.use("/orders", orderRouter);
app.use("/payments", paymentRouter);
app.use("/refunds", refundRouter);
app.use("/wallet", walletRouter);
app.use("/payouts", payoutRouter);
app.use((err, req, res, next) => {
  let statusCode = err.statusCode ? err.statusCode : 500;
  res.status(statusCode).json({ message: err.message });
});
module.exports = { app };
