const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');

router.get('/topics', forumController.getTopics);
router.post('/reactions', forumController.createReaction);
router.post('/comments', forumController.createComment);
router.post('/reports', forumController.createReport);
router.get('/topics-list', forumController.getTopicsList);
router.get('/pending-comments', forumController.getPendingComments);
router.put('/moderate-comment/:id', forumController.moderateComment);
router.get('/pending-reports', forumController.getPendingReports);
router.put('/resolve-report/:id', forumController.resolveReport);

module.exports = router; 