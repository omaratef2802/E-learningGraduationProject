const users = require("./users");
const admin = require("./admin");
const categoryRoutes = require("./Category");
const trackRoutes = require("./Track");
const courseRoutes = require("./Course");
const cartRouter = require("./Cart");
const wishlistRouter = require("./Wishlist");
const orderRouter = require("./Order");
const paymentRouter = require("./Payment");
const refundRouter = require("./Refund");
const walletRouter = require("./Wallet");
const payoutRouter = require("./Payout");
const enrollment = require("./Enrollement");
const section = require("./section");
const lesson = require("./Lesson");
const project = require("./Projects");
const sumbitProject = require("./projectSubmission");
const notification = require("./Notification");
const review = require("./Review");
const certificate = require("./Certificate");
const AttemptQuiz = require("./QuizAttempt");
const Quizs = require("./Quizs");

const mountRoutes = (app) => {
  app.use("/E-learning/users", users);
  app.use("/E-learning/admins", admin);

  app.use("/E-learning/category", categoryRoutes);
  app.use("/E-learning/track", trackRoutes);
  app.use("/E-learning/course", courseRoutes);

  app.use("/E-learning/cart", cartRouter);
  app.use("/E-learning/wishlist", wishlistRouter);
  app.use("/E-learning/orders", orderRouter);
  app.use("/E-learning/payments", paymentRouter);
  app.use("/E-learning/refunds", refundRouter);
  app.use("/E-learning/wallet", walletRouter);
  app.use("/E-learning/payouts", payoutRouter);

  app.use("/E-learning/enroll", enrollment);
  app.use("/E-learning/section", section);
  app.use("/E-learning/lesson", lesson);

  app.use("/E-learning/project", project);
  app.use("/E-learning/project-submission", sumbitProject);
  app.use("/E-learning/Notification", notification);
  app.use("/E-learning/review", review);
  app.use("/E-learning/certificate", certificate);
  app.use("/E-learning/Quiz", Quizs);
  app.use("/E-learning/QuizAttempt", AttemptQuiz);
};

module.exports = mountRoutes;
