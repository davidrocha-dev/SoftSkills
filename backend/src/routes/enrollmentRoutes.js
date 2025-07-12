const express = require('express');
const { authorize } = require('../middleware/authMiddleware');
const router  = express.Router();
const controller = require('../controllers/enrollmentController');

router.get('/', controller.listEnrollments);
router.post('/create', controller.createEnrollment);
router.get('/enrolled/:userId', authorize(['gestor','formador','formando']), controller.getEnrolledCoursesByUser);
router.get('/curso/:courseId', controller.getEnrollmentsByCourse);
router.post('/', authorize(['gestor','formador','formando']), controller.createEnrollment);
router.patch('/:id', controller.updateEnrollmentStatus);
router.delete('/:id', controller.deleteEnrollment);

module.exports = router;
