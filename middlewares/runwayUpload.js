const multer = require('multer');

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(process.env.RUNWAY_MAX_IMAGE_BYTES || 10 * 1024 * 1024), // 10MB
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new Error('Invalid image type. Only JPEG, PNG, and WEBP are allowed.'));
    }
    cb(null, true);
  },
});

module.exports = upload;
