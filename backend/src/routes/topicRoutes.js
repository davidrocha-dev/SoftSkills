const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');

router.get('/', topicController.listTopics);
router.post('/', topicController.createTopic);
router.put('/:id', topicController.updateTopic);
router.get('/checkFk/:id', topicController.checkFk);
router.delete('/:id', topicController.deleteTopic);

module.exports = router;