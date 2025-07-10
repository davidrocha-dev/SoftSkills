const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');


router.post('/create', requestController.createRequest);
router.put('/:id/resolve', requestController.resolveRequest);
router.get('/', requestController.listRequests);
router.get('/:id', requestController.getRequestById);

module.exports = router;