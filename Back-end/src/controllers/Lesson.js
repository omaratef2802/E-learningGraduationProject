const Lesson = require('../modules/dbLesson');
const uploadVideo = require('../utils/uploadVideo');

exports.createLesson = async (req, res, next) => {
  try {
    let videoUrl;
    if (req.file) {
      videoUrl = await uploadVideo(req.file.buffer);
    }

    const lesson = await Lesson.create({
      ...req.body,
      videoUrl,
      duration: Number(req.body.duration),
      isFree: req.body.isFree === 'true' || req.body.isFree === true
    });

    res.status(201).json({ message: 'Lesson created', lesson });
  } catch (err) {
    next(err);
  }
};

exports.getLessonsByCourse = async (req, res, next) => {
  try {
    const lessons = await Lesson.find({ courseId: req.params.courseId })
      .populate('sectionId')
      .sort({ order: 1 });
    res.json({ lessons });
  } catch (err) {
    next(err);
  }
};

exports.getLessonsBySection = async (req, res, next) => {
  try {
    const lessons = await Lesson.find({ sectionId: req.params.sectionId }).sort({ order: 1 });
    res.json({ lessons });
  } catch (err) {
    next(err);
  }
};

exports.getLessonById = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('sectionId');
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    res.json({ lesson });
  } catch (err) {
    next(err);
  }
};

exports.updateLesson = async (req, res, next) => {
  try {
    if (req.file) {
      req.body.videoUrl = await uploadVideo(req.file.buffer);
    }
    if (req.body.duration) {
      req.body.duration = Number(req.body.duration);
    }
    if (req.body.isFree !== undefined) {
      req.body.isFree = req.body.isFree === 'true' || req.body.isFree === true;
    }

    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    res.json({ message: 'Lesson updated', lesson });
  } catch (err) {
    next(err);
  }
};

exports.deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    res.json({ message: 'Lesson deleted' });
  } catch (err) {
    next(err);
  }
};