const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const cors = require("cors");
// const mongoose = require("mongoose");
const passport = require("./configs/passport");
// connect db
// mongoose .connect(process.env.URL_MONGO)
//   .then(() => {
//     console.log("the db runing successfuly");
//   })
//   .catch((err) => {
//     console.log(err.message);
//   });
 
app.use(cors());
app.use(express.json());
app.use(express.Router());
app.use(passport.initialize());

// require endpoints
const users = require("./Routers/users");
const categoryRoutes=require("./Routers/Category")
const trackRoutes=require("./Routers/Track")
const courseRoutes = require("./Routers/Course");
const instructorRoutes = require("./Routers/Instructor");
app.use("/E-learning/users", users);
app.use("/E-learning/category",categoryRoutes)
app.use("/E-learning/track",trackRoutes)
app.use("/E-learning/course",courseRoutes)
app.use("/E-learning/instructor", instructorRoutes);

const cartRouter = require("./Routers/Cart");
const wishlistRouter = require("./Routers/Wishlist");
const orderRouter = require("./Routers/Order");
const paymentRouter = require("./Routers/Payment");
const refundRouter = require("./Routers/Refund");
const walletRouter = require("./Routers/Wallet");
const payoutRouter = require("./Routers/Payout");
const notificationRouter = require("./Routers/Notification");
app.use("/E-learning/users", users);
app.use("/cart", cartRouter);
app.use("/wishlist", wishlistRouter);
app.use("/orders", orderRouter);
app.use("/payments", paymentRouter);
app.use("/refunds", refundRouter);
app.use("/wallet", walletRouter);
app.use("/payouts", payoutRouter);
app.use("/notifications", notificationRouter);
app.use("/E-learning/notifications", notificationRouter);
app.use((err, req, res, next) => {
  let statusCode = err.statusCode ? err.statusCode : 500;
  res.status(statusCode).json({ message: err.message });
});
module.exports = { app };
