const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuração do storage para diferentes tipos de arquivo
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

// Storage para recursos de cursos
const courseResourceStorage = createCloudinaryStorage('course-resources');

// Storage para imagens de cursos
const courseImageStorage = createCloudinaryStorage('course-images', 'image');

// Multer middleware
const uploadCourseResource = multer({ 
  storage: courseResourceStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
});

const uploadCourseImage = multer({ 
  storage: courseImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

module.exports = {
  cloudinary,
  uploadCourseResource,
  uploadCourseImage
};