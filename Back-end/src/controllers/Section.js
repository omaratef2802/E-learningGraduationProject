const Section = require('../modules/dbSection');

exports.createSection = async (req, res, next) => {
  try {
    const section = await Section.create(req.body);
    res.status(201).json({ message: 'Section created', section });
  } catch (err) {
    next(err);
  }
};

exports.getSectionsByCourse = async (req, res, next) => {
  try {
    const sections = await Section.find({ courseId: req.params.courseId }).sort({ order: 1 });
    res.json({ sections });
  } catch (err) {
    next(err);
  }
};