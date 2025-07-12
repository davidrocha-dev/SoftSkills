const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Rotas de autenticação
router.post('/login', authController.login);
router.post('/verify-account', authController.verifyAccount);
router.get('/verify-account', authController.verifyAccount);

router.get('/first-login/validate', authController.validateFirstLogin);
router.post('/first-login', authController.firstLogin);

module.exports = router;