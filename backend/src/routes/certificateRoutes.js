const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/enrollments/:courseId', certificateController.getCourseEnrollments);
router.post('/issue', certificateController.issueCertificate);
router.get('/course/:courseId', certificateController.getCourseCertificates);
router.get('/download/:certificateId', certificateController.downloadCertificate);

module.exports = router; 