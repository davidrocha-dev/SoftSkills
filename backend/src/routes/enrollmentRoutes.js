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

// Lista inscrições de um curso específico
router.get('/curso/:courseId', controller.getEnrollmentsByCourse);

// Cria uma inscrição
router.post(
  '/',
  authorize(['gestor','formador','formando']),
  controller.createEnrollment
);

// Atualiza o status de uma inscrição
router.patch('/:id', controller.updateEnrollmentStatus);

// Remove uma inscrição
router.delete('/:id', controller.deleteEnrollment);

module.exports = router;
