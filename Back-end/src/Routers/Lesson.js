const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploads');
const {
  createLesson,
  getLessonsByCourse,
  getLessonsBySection,
  getLessonById,
  updateLesson,
  deleteLesson
} = require('../controllers/Lesson');

router.post('/', upload.single('video'), createLesson);
router.get('/course/:courseId', getLessonsByCourse);
router.get('/section/:sectionId', getLessonsBySection);
router.get('/:id', getLessonById);
router.patch('/:id', upload.single('video'), updateLesson);
router.delete('/:id', deleteLesson);

module.exports = router;