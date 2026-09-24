const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Notification = require("../modules/dbNotification");
const ApiError = require("../utils/ApiError");

let io = null;

/**
 * Initialize Socket.IO with JWT authentication and room management
 * @param {import("socket.io").Server} socketIOInstance
 */
const initSocket = (socketIOInstance) => {
  io = socketIOInstance;

  // Socket.IO authentication middleware using existing JWT approach
  io.use((socket, next) => {
    try {
      let token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization ||
        socket.handshake.query?.token;

      if (!token) {
        return next(new Error("Authentication error: Token is required"));
      }

      if (typeof token === "string" && token.startsWith("Bearer ")) {
        token = token.slice(7).trim();
      }

      jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
          return next(new Error("Authentication error: Invalid or expired token"));
        }
        socket.userId = decoded.userId || decoded.id;
        socket.user = decoded;
        next();
      });
    } catch (error) {
      next(new Error("Authentication error: " + error.message));
    }
  });

  io.on("connection", (socket) => {
    const userRoom = `user:${socket.userId}`;
    socket.join(userRoom);
    console.log(`Socket connected: ${socket.id} joined private room ${userRoom}`);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id} from room ${userRoom}`);
    });
  });
};

/**
 * Helper to get the current Socket.IO instance
 */
const getIO = () => io;

/**
 * Reusable helper to create a Notification in MongoDB and emit via Socket.IO
 * Can be called from any controller when a business action occurs.
 */
const createNotificationHelper = async ({
  userId,
  title,
  message,
  type = "system",
  referenceId = null,
}) => {
  if (!userId || !title || !message) {
    throw new Error("userId, title, and message are required to create a notification");
  }

  const notification = await Notification.create({
    userId,
    title,
    message,
    type,
    referenceId,
  });

  if (io) {
    io.to(`user:${userId}`).emit("notification", notification);
  }

  return notification;
};

/**
 * GET /notifications
 * Get authenticated user's notifications, newest first
 */
const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id || req.id;
    if (!userId) {
      throw new ApiError(401, "You must login first");
    }

    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      message: "success",
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /notifications/unread
 * Get authenticated user's unread notifications, newest first
 */
const getUnreadNotifications = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id || req.id;
    if (!userId) {
      throw new ApiError(401, "You must login first");
    }

    const notifications = await Notification.find({
      userId,
      isRead: false,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "success",
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /notifications/:id/read
 * Mark one notification as read (only if owned by authenticated user)
 */
const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id || req.id;
    if (!userId) {
      throw new ApiError(401, "You must login first");
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid notification ID");
    }

    const notification = await Notification.findOne({ _id: id, userId });
    if (!notification) {
      const exists = await Notification.findById(id);
      if (exists) {
        throw new ApiError(403, "You are not authorized to access this notification");
      }
      throw new ApiError(404, "Notification not found");
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /notifications/read-all
 * Mark all notifications for authenticated user as read
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id || req.id;
    if (!userId) {
      throw new ApiError(401, "You must login first");
    }

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /notifications
 * Create a notification via HTTP API (for manual creation/testing)
 */
const createNotificationController = async (req, res, next) => {
  try {
    const currentUserId = req.user?.id || req.user?._id || req.id;
    const { userId, title, message, type, referenceId } = req.body;

    const targetUserId = userId || currentUserId;
    if (!targetUserId) {
      throw new ApiError(400, "Target userId is required");
    }
    if (!title || !message) {
      throw new ApiError(400, "Title and message are required");
    }

    const notification = await createNotificationHelper({
      userId: targetUserId,
      title,
      message,
      type,
      referenceId,
    });

    res.status(201).json({
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  initSocket,
  getIO,
  createNotificationHelper,
  getMyNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  createNotificationController,
};
