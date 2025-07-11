const express = require('express');
const router = express.Router();
const { authorize } = require('../middleware/authMiddleware');
const courseController = require('../controllers/courseController');

// A FUNCIONAR
router.get('/', courseController.listCourses);
router.get('/available', courseController.getAvailableCourses);
router.post('/', authorize(['gestor']), courseController.createCourse);
router.get('/formador/courses', authorize(['formador']), courseController.listFormadorCourses);
router.delete('/:id', authorize(['gestor']), courseController.deleteCourse);
router.get('/enrolled/:userId', courseController.getEnrolledCourses);
router.get('/:id',authorize(['gestor','formador','formando']), courseController.getCourseById);
router.post('/resource', authorize(['gestor','formador']), courseController.createResource);


// Criar seção individual para um curso
router.post('/:id/sections', authorize(['gestor','formador']), courseController.createSection);

//TESTE
router.put('/id/:id', authorize(['gestor','formador']),courseController.updateCourse);

module.exports = router;