const express = require('express');
const router = express.Router();
const resourceTypeController = require('../controllers/resourceTypeController');
const courseController = require('../controllers/courseController');
const authorize = require('../middleware/authMiddleware');

router.get('/', resourceTypeController.listResourceTypes);
module.exports = router; 