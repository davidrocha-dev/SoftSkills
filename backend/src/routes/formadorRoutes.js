const express = require('express');
const { authorize } = require('../middleware/authMiddleware');
const {
  listFormadorCourses,
  getFormadorStats
} = require('../controllers/courseController');

const router = express.Router();

router.get('/courses', authorize(['formador']), listFormadorCourses);
router.get('/stats',   authorize(['formador']), getFormadorStats);

module.exports = router;
