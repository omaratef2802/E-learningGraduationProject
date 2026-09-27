const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const connectDb = require("./configs/db");
const passport = require("./configs/passport");
const mountRoutes = require("./Routers");

const app = express();
connectDb();

const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",").map((origin) => origin.trim()).filter(Boolean) : null;
app.use(cors({
  origin: allowedOrigins ? (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  } : true,
  credentials: true,
}));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(passport.initialize());

mountRoutes(app);

app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  if (err.code === 11000) statusCode = 409;
  if (err.name === "ValidationError") statusCode = 400;
  if (err.name === "CastError") statusCode = 400;
  res.status(statusCode).json({ success: false, message: err.message || "Internal server error" });
});

module.exports = { app };
