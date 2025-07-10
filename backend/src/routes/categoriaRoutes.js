const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');

if (typeof categoriaController.createCategory !== 'function') {
  console.error('createCategory não é uma função!');
}

router.get('/', categoriaController.listCategories);
router.post('/', categoriaController.createCategory);
router.get('/checkFk/:id', categoriaController.checkFk);
router.put('/:id', categoriaController.updateCategory);
router.delete('/:id', categoriaController.deleteCategory);

module.exports = router;