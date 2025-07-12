const { uploadCourseImage } = require('../config/cloudinary');

module.exports = (req, res, next) => {
  uploadCourseImage.single('file')(req, res, err => {
    if (err) {
      console.error('[upload.middleware] Erro no upload:', err.message);
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
};