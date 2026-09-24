const express = require("express");
const { auth } = require("../middlewares/auth");
const { getNotifications, createNotification, markNotificationRead, deleteNotification } = require("../controllers/Notification");

const router = express.Router();
router.get("/", auth, getNotifications);
router.post("/", auth, createNotification);
router.patch("/:id/read", auth, markNotificationRead);
router.delete("/:id", auth, deleteNotification);

module.exports = router;
