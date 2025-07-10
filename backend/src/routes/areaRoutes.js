const express = require('express');
const router = express.Router();
const areaController = require('../controllers/areaController');

router.get('/', areaController.listAreas);
router.post('/', areaController.createArea);
router.get('/checkFk/:id', areaController.checkFk);
router.put('/:id', areaController.updateArea);
router.delete('/:id', areaController.deleteArea);


module.exports = router;