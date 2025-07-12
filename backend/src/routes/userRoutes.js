const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authorize } = require('../middleware/authMiddleware');

router.post('/create', userController.createUser); 

router.get('/id/:workerNumber', userController.getProfileByWorkerNumber);
router.get('/profile', authorize(), userController.getProfile);
router.get('/', authorize(['gestor']), userController.getAllUsers);
router.put('/:id', userController.updateUser);
router.get('/:id', userController.getUserById);
router.post('/:id/password-reset', userController.passwordReset);
router.post('/reset-password',     userController.resetPassword);
router.get('/reset-password/validate', userController.validateResetToken);
router.delete('/:id', userController.deleteUser);
router.post('/password-reset-request', userController.requestPasswordResetByEmail);

module.exports = router;