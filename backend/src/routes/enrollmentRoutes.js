const express = require('express');
const { authorize } = require('../middleware/authMiddleware');
const router  = express.Router();
const controller = require('../controllers/enrollmentController');

// lista todas as inscrições
router.get('/', controller.listEnrollments);
router.post('/create', controller.createEnrollment);




router.get(
  '/enrolled/:userId',
  authorize(['gestor','formador','formando']),
  controller.getEnrolledCoursesByUser
);

// Cria uma inscrição
router.post(
  '/',
  authorize(['gestor','formador','formando']),
  controller.createEnrollment
);

module.exports = router;
