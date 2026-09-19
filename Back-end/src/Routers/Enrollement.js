const express = require('express');
const router = express.Router();
const {
  createEnrollment,
  getMyCourses,
  completeEnrollment
} = require('../controllers/Enrollement');

router.post('/', createEnrollment);
router.get('/my-courses/:userId', getMyCourses);
router.patch('/:id/complete', completeEnrollment);

module.exports = router;