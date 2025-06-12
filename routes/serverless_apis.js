const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const { User, Subscription, GeneratedImage } = require('../models');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const RUNPOD_ENDPOINT = "https://api.runpod.ai/v2/gz0b6c1odcb3d5/run";
const RUNPOD_API_KEY = "Bearer  rpa_OPBINZKI3UYA9HX0YGSQ3ZMNPR1KMFT0PR0HSC7Qvtvij7";

// Convert file to base64
function toBase64(filePath) {
  console.log('📄 [IMAGE-ENHANCEMENT] Converting file to base64:', { filePath });
  const mimeType = "image/png";
  const data = fs.readFileSync(filePath);
  return `data:${mimeType};base64,${data.toString('base64')}`;
}

router.post('/image-enhancement', upload.fields([
  { name: 'masked_image', maxCount: 1 },
  { name: 'original_image', maxCount: 1 }
]), async (req, res) => {
  console.log('🎨 [IMAGE-ENHANCEMENT] New enhancement request received:', {
    userId: req.body.userId,
    hasOriginalImage: !!req.files?.original_image,
    hasMaskedImage: !!req.files?.masked_image
  });

  try {
    const maskImagePath = req.files?.masked_image?.[0]?.path;
    const originalImagePath = req.files?.original_image?.[0]?.path;

    if (!maskImagePath || !originalImagePath) {
      console.warn('❌ [IMAGE-ENHANCEMENT] Missing required images:', {
        hasMaskImage: !!maskImagePath,
        hasOriginalImage: !!originalImagePath
      });
      return res.status(400).send({ message: 'Both masked and original images are required.' });
    }

    const userId = req.body.userId;
    console.log('👤 [IMAGE-ENHANCEMENT] Processing request for user:', { userId });

    const user = await User.findById(userId);
    if (!user) {
      console.warn('❌ [IMAGE-ENHANCEMENT] User not found:', { userId });
      return res.status(404).send({ message: "User not found" });
    }

    if (user.no_of_images_left <= 0) {
      console.warn('⚠️ [IMAGE-ENHANCEMENT] Image limit reached for user:', { 
        userId, 
        imagesLeft: user.no_of_images_left 
      });
      return res.status(400).send({ message: "Image generation limit reached" });
    }

    console.log('✅ [IMAGE-ENHANCEMENT] User verified:', { 
      userId, 
      imagesLeft: user.no_of_images_left 
    });

    await User.findByIdAndUpdate(userId, { $inc: { no_of_images_left: -1 } });
    console.log('📊 [IMAGE-ENHANCEMENT] Updated user image count:', { userId });

    const payload = {
      input: {
        prompt: req.body.prompt,
        denoise: parseFloat(req.body.denoise) || 1,
        revert_extra: req.body.revert_extra || null,
        mask_image: toBase64(maskImagePath),
        original_image: toBase64(originalImagePath)
      }
    };

    console.log('🚀 [IMAGE-ENHANCEMENT] Sending request to RunPod:', {
      prompt: req.body.prompt,
      denoise: payload.input.denoise
    });

    const response = await axios.post(RUNPOD_ENDPOINT, payload, {
      headers: {
        Authorization: RUNPOD_API_KEY,
        "Content-Type": "application/json"
      }
    });

    const jobId = response.data?.id;
    if (!jobId) {
      console.error('❌ [IMAGE-ENHANCEMENT] No job ID received from RunPod');
      throw new Error("Missing job ID from RunPod");
    }

    console.log('✨ [IMAGE-ENHANCEMENT] Job submitted successfully:', { jobId });

    [maskImagePath, originalImagePath].forEach(fp => {
      if (fp && fs.existsSync(fp)) {
        fs.unlinkSync(fp);
        console.log('🗑️ [IMAGE-ENHANCEMENT] Cleaned up temporary file:', { path: fp });
      }
    });

    res.status(202).send({
      job_id: jobId,
      message: "Image enhancement started. Use /image-enhancement-status/:job_id to check results."
    });

  } catch (err) {
    console.error('❌ [IMAGE-ENHANCEMENT] Error:', {
      message: err.message,
      stack: err.stack,
      response: err.response?.data
    });
    if (err.response) console.error("🔍 [IMAGE-ENHANCEMENT] RunPod Error:", err.response.data);
    res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = router;
