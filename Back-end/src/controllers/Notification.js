const Notification = require("../modules/dbNotification");

const recipientFor = (req) => req.id || null;

const getNotifications = async (req, res, next) => {
	try {
		const filter = req.id ? { $or: [{ recipient: req.id }, { recipient: null }] } : { recipient: null };
		const notifications = await Notification.find(filter).sort({ createdAt: -1 });
		res.status(200).json({ success: true, data: notifications });
	} catch (error) { next(error); }
};

const createNotification = async (req, res, next) => {
	try {
		const { title, message, type } = req.body;
		if (!title || !message) return res.status(400).json({ success: false, message: "title and message are required" });
		const notification = await Notification.create({ title, message, type, recipient: recipientFor(req) });
		res.status(201).json({ success: true, data: notification });
	} catch (error) { next(error); }
};

const markNotificationRead = async (req, res, next) => {
	try {
		const notification = await Notification.findOneAndUpdate({ _id: req.params.id, $or: [{ recipient: req.id }, { recipient: null }] }, { isRead: true }, { new: true });
		if (!notification) return res.status(404).json({ success: false, message: "notification not found" });
		res.status(200).json({ success: true, data: notification });
	} catch (error) { next(error); }
};

const deleteNotification = async (req, res, next) => {
	try {
		const notification = await Notification.findOneAndDelete({ _id: req.params.id, $or: [{ recipient: req.id }, { recipient: null }] });
		if (!notification) return res.status(404).json({ success: false, message: "notification not found" });
		res.status(204).send();
	} catch (error) { next(error); }
};

module.exports = { getNotifications, createNotification, markNotificationRead, deleteNotification };
