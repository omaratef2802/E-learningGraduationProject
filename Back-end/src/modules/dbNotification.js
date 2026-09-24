const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
	{
		recipient: { type: mongoose.Schema.Types.ObjectId, ref: "users", default: null },
		title: { type: String, required: true, trim: true, maxlength: 120 },
		message: { type: String, required: true, trim: true, maxlength: 500 },
		type: { type: String, default: "Course Update", trim: true },
		isRead: { type: Boolean, default: false },
	},
	{ timestamps: true },
);

module.exports = mongoose.model("notifications", notificationSchema);
