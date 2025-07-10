const express = require('express');
const {
  createUser,
  listUsers,
  updateUserStatus,
  updateUser,
  countUsersByRole
} = require('../controllers/gestorController');
const courseController = require('../controllers/courseController');
const { authorize } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

const router = express.Router();

// Todas as rotas exigem autorização de gestor
router.post('/users', authorize(['gestor']), createUser);
router.get('/users', authorize(['gestor']), listUsers);
router.patch('/users/:id/status', authorize(['gestor']), updateUserStatus);
router.patch('/users/:id', authorize(['gestor']), updateUser);
router.get('/users/counts', authorize(['gestor']), countUsersByRole);
router.get('/courses/counts', authorize(['gestor', 'formador']), courseController.getCourseCounts);
router.delete('/users/:id', authorize(['gestor']), userController.deleteUser);

module.exports = router;