const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

app.use(express.json());

app.post("/users/login", (req, res) => {
  const token = jwt.sign(
    { email: req.body.email }, 
    process.env.JWT_SECRET || "your_super_secret_key", 
    { expiresIn: "1d" }
  );

  res.status(200).json({
    success: true,
    message: "Login successful!",
    data: { 
      email: req.body.email,
      token: token
    }
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Smart E-Learning Backend is running successfully!",
  });
});

module.exports = app;
