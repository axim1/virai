const express = require('express');
const upload = require('../middlewares/runwayUpload');
const { generateVideo, checkVideo } = require('../controllers/runwayController');

const router = express.Router();

router.post('/generate-video', (req, res, next) => {
  upload.single('image')(req, res, (error) => {
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    return next();
  });
}, generateVideo);

router.get('/check-video/:uuid', checkVideo);

module.exports = router;
