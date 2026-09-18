const express = require("express");
const app = express();

app.use(express.json());

const quizRoutes = require("./Routers/QuizAttempt");
const projectRoutes = require("./Routers/Projects");
const certificateRoutes = require("./Routers/Certificate");

app.use("/api/quizzes", quizRoutes);         
app.use("/api/projects", projectRoutes);
app.use("/api/certificates", certificateRoutes);

app.get("/", (req, res) => {

  res.status(200).json({
    success: true,
    message: "Smart E-Learning Backend (Member 4) is running successfully!",
  });
});

module.exports = app;