const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');

// Endpoint real para buscar tópicos do fórum
router.get('/topics', forumController.getTopics);

// Endpoint para criar ou atualizar uma reação
router.post('/reactions', forumController.createReaction);

// Endpoint para criar um novo comentário associado a um tópico
router.post('/comments', forumController.createComment);

// Endpoint para denunciar um comentário
router.post('/reports', forumController.createReport);

// Endpoint para devolver todos os tópicos (id e descricao) para dropdowns
router.get('/topics-list', forumController.getTopicsList);

// Endpoint para buscar comentários pendentes de moderação
router.get('/pending-comments', forumController.getPendingComments);

// Endpoint para aprovar/rejeitar comentários
router.put('/moderate-comment/:id', forumController.moderateComment);

// Endpoint para buscar denúncias pendentes
router.get('/pending-reports', forumController.getPendingReports);

// Endpoint para resolver denúncias
router.put('/resolve-report/:id', forumController.resolveReport);

module.exports = router; 