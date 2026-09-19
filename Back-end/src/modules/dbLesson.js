const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    required: true
  },
  isFree: {
    type: Boolean,
    default: false
  },
  videoUrl: {
    type: String
  },
  textContent: {
    type: String
  },
  type: {
    type: String,
    enum: ['video', 'text'],
    required: true
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  order: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);