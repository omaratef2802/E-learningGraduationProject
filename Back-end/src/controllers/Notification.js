const Notification = require("../modules/dbNotification");
const User = require("../modules/dbUsers");
const ApiError = require("../utils/ApiError");

const sendNotification = async (req, res, next) => {
  try {
    const { to, type, subject, message } = req.body;
    if (!to || !subject || !message) return next(new ApiError(400, "To, subject, and message are required"));
    const user = await User.findById(to).select("_id");
    if (!user) return next(new ApiError(404, "Recipient not found"));
    const notification = await Notification.create({ to, from: req.fullname || "admin", type: type || "system", subject, message });
    return res.status(201).json({ message: "Notification sent successfully", notification });
  } catch (error) { return next(new ApiError(500, error.message)); }
};
const getNotifications = async (req, res, next) => {
  try { return res.status(200).json({ notifications: await Notification.find({ to: req.id }).sort({ createdAt: -1 }) }); }
  catch (error) { return next(new ApiError(500, error.message)); }
};
const updateNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, to: req.id });
    if (!notification) return next(new ApiError(404, "Notification not found"));
    if (req.body.isRead !== undefined) notification.isRead = Boolean(req.body.isRead);
    await notification.save();
    return res.status(200).json({ message: "Notification updated successfully", notification });
  } catch (error) { return next(new ApiError(500, error.message)); }
};
const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, to: req.id });
    if (!notification) return next(new ApiError(404, "Notification not found"));
    return res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) { return next(new ApiError(500, error.message)); }
};
module.exports = { sendNotification, getNotifications, updateNotification, deleteNotification };
