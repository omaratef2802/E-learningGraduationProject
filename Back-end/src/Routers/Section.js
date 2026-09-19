const express = require('express');
const router = express.Router();
const { createSection, getSectionsByCourse } = require('../controllers/Section');

router.post('/', createSection);
router.get('/course/:courseId', getSectionsByCourse);

module.exports = router;