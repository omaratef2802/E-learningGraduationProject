const express = require("express");
const { auth, relasedTo } = require("../middlewares/auth");
const router = express.Router();

const {
  sendNotification,
  getNotifications,
  updateNotification,
  deleteNotification,
} = require("../controllers/Notification");

router.post("/sendNotification", auth, relasedTo("admin"), sendNotification);
router.get("/getNotification", auth, getNotifications);
router.patch("/updateNotification/:id", auth, updateNotification);
router.delete("/deleteNotification/:id", auth, deleteNotification);

module.exports = router;
