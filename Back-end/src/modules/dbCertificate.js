const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  certificateId: { type: String, required: true, unique: true },
  issueDate: { type: Date, default: Date.now },
  verificationUrl: { type: String, required: true },
  qrCode: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);