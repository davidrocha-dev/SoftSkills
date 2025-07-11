const { uploadCourseImage } = require('../config/cloudinary');

// Filtro de tipos
const fileFilter = (req, file, cb) => {
  console.log('🔍 [upload] Recebido arquivo:', file.originalname, file.mimetype);
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    const err = new Error('Apenas imagens são permitidas!');
    console.error('❌ [upload] Ficheiro inválido:', file.originalname);
    cb(err, false);
  }
};

// Trata erros do Multer antes de passar ao controller
module.exports = (req, res, next) => {
  uploadCourseImage.single('file')(req, res, err => {
    if (err) {
      console.error('❌ [upload.middleware] Erro no upload:', err.message);
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
};