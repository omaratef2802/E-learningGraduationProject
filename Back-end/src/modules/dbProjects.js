const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  projectDescription: { type: String, required: true },
  githubRepo: { type: String, required: true },
  liveDemo: { type: String },
  screenshots: [String],
  deadline: { type: Date, required: true },
  submissionDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['Assigned', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Request Changes'], 
    default: 'Submitted' 
  },
  instructorFeedback: {
    score: Number,
    comment: String,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date
  },
  skillsAwarded: [String] // مهارات تضاف تلقائياً عند الاعتماد
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);