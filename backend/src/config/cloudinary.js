const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createCloudinaryStorage = (folder, resourceType = 'auto') => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      resource_type: resourceType,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt', 'mp4', 'avi', 'mov'],
      transformation: [
        { width: 1000, height: 1000, crop: 'limit', quality: 'auto' }
      ]
    },
  });
};

const courseResourceStorage = createCloudinaryStorage('course-resources');

const courseImageStorage = createCloudinaryStorage('course-images', 'image');

const uploadCourseResource = multer({ 
  storage: courseResourceStorage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  }
});

const uploadCourseImage = multer({ 
  storage: courseImageStorage,
  fileFilter: (req, file, cb) => {
    console.log('[upload] Recebido ficheiro:', file.originalname, file.mimetype);
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      const err = new Error('Apenas imagens são permitidas!');
      console.error('[upload] Ficheiro inválido:', file.originalname);
      cb(err, false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  }
});

module.exports = {
  cloudinary,
  uploadCourseResource,
  uploadCourseImage
};