const express = require('express');
const router = express.Router();
const resourceTypeController = require('../controllers/resourceTypeController');

router.get('/', resourceTypeController.listResourceTypes);
module.exports = router; 