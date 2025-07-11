const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { verifyToken } = require('../middleware/authMiddleware');

// Todas as rotas requerem autenticação
router.use(verifyToken);

// Listar inscritos de um curso para emissão de certificados
router.get('/enrollments/:courseId', certificateController.getCourseEnrollments);

// Emitir certificado para um usuário
router.post('/issue', certificateController.issueCertificate);

// Listar certificados de um curso
router.get('/course/:courseId', certificateController.getCourseCertificates);

// Baixar certificado por ID
router.get('/download/:certificateId', certificateController.downloadCertificate);

module.exports = router; 