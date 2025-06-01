const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const { User, Subscription, GeneratedImage } = require('../models');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const RUNPOD_ENDPOINT = "https://api.runpod.ai/v2/gz0b6c1odcb3d5/run";
const RUNPOD_API_KEY = "Bearer rpa_G2LMUWQ8316N4VV7GPA02Y0IG0KGTY27XN2GHL1Jde540g";

// Convert file to base64
function toBase64(filePath) {
  const mimeType = "image/png";
  const data = fs.readFileSync(filePath);
  return `data:${mimeType};base64,${data.toString('base64')}`;
}

router.post('/image-enhancement', upload.fields([
  { name: 'masked_image', maxCount: 1 },
  { name: 'original_image', maxCount: 1 }
]), async (req, res) => {
  try {
    const maskImagePath = req.files?.masked_image?.[0]?.path;
    const originalImagePath = req.files?.original_image?.[0]?.path;

    if (!maskImagePath || !originalImagePath) {
      return res.status(400).send({ message: 'Both masked and original images are required.' });
    }

    const userId = req.body.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).send({ message: "User not found" });

    if (user.no_of_images_left <= 0) {
      return res.status(400).send({ message: "Image generation limit reached" });
    }

    await User.findByIdAndUpdate(userId, { $inc: { no_of_images_left: -1 } });

    const payload = {
      input: {
        prompt: req.body.prompt,
        denoise: parseFloat(req.body.denoise) || 1,
        revert_extra: req.body.revert_extra || null,
        mask_image: toBase64(maskImagePath),
        original_image: toBase64(originalImagePath)
      }
    };

    const response = await axios.post(RUNPOD_ENDPOINT, payload, {
      headers: {
        Authorization: RUNPOD_API_KEY,
        "Content-Type": "application/json"
      }
    });

    const jobId = response.data?.id;
    if (!jobId) throw new Error("Missing job ID from RunPod");

    [maskImagePath, originalImagePath].forEach(fp => {
      if (fp && fs.existsSync(fp)) fs.unlinkSync(fp);
    });

    res.status(202).send({
      job_id: jobId,
      message: "Image enhancement started. Use /image-enhancement-status/:job_id to check results."
    });

  } catch (err) {
    console.error("Image enhancement error:", err);
    if (err.response) console.error("RunPod Error:", err.response.data);
    res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = router;
