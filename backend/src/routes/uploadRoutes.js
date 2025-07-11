const express = require('express');
const router = express.Router();
const { uploadCourseResource } = require('../config/cloudinary');

// Middleware para upload de recursos
const uploadResource = (req, res, next) => {
  uploadCourseResource.single('file')(req, res, err => {
    if (err) {
      console.error('❌ [upload.resource] Erro no upload:', err.message);
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
};

// Upload de recursos de curso
router.post('/resource', uploadResource, (req, res) => {
  console.log('🔔 [uploadResource] req.file:', req.file);
  if (!req.file) {
    console.warn('⚠️ [uploadResource] Nenhum arquivo enviado');
    return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado' });
  }

  // path inclui a URL no Cloudinary
  const fileUrl = req.file.path;
  console.log('✅ [uploadResource] URL do arquivo:', fileUrl);
  return res.status(200).json({ success: true, fileUrl });
});

module.exports = router; 