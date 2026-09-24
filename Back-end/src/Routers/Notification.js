const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const {
  getMyNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  createNotificationController,
} = require("../controllers/Notification");

// GET authenticated user's notifications (newest first)
router.get("/", auth, getMyNotifications);

// GET authenticated user's unread notifications
router.get("/unread", auth, getUnreadNotifications);

// PATCH mark all notifications as read for current user
router.patch("/read-all", auth, markAllAsRead);

// PATCH mark one notification as read (with user ownership check)
router.patch("/:id/read", auth, markAsRead);

// POST create notification (for testing / admin / direct trigger)
router.post("/", auth, createNotificationController);

module.exports = router;
