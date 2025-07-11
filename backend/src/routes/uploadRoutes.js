const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

// Endpoint para upload de anexos de comentários
router.post('/comment-attachment', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Nenhum ficheiro enviado.' });
  }
  // Retorna o caminho/URL do ficheiro
  res.json({ success: true, file: { url: `/uploads/${req.file.filename}` } });
});

module.exports = router; 