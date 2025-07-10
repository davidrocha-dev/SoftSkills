const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'my-website',
    format: async () => 'jpg',
    public_id: (req, file) => {
      const safeName = file.originalname
        .split('.')[0]
        .replace(/[^a-zA-Z0-9]/g, '-');
      return `${Date.now()}-${safeName}`;
    },
    transformation: [
      { width: 800, crop: "scale" },
      { quality: "auto" }
    ]
  }
});

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

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

// Trata erros do Multer antes de passar ao controller
module.exports = (req, res, next) => {
  upload.single('image')(req, res, err => {
    if (err) {
      console.error('❌ [upload.middleware] Erro no upload:', err.message);
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
};