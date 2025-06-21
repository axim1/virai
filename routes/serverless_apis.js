const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const { User, GeneratedImage } = require('../models');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const RUNPOD_ENDPOINT = "https://api.runpod.ai/v2/gz0b6c1odcb3d5/run";
const RUNPOD_API_KEY = "Bearer rpa_0GRW20NDH6XJMXLLG5YBD3VN0YO0R5SLG49QBD7A1c5fsl";

function toBase64(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
  const data = fs.readFileSync(filePath);
  return `data:${mimeType};base64,${data.toString('base64')}`;
}

router.post('/image-enhancement', upload.fields([
  { name: 'masked_image', maxCount: 1 },
  { name: 'original_image', maxCount: 1 }
]), async (req, res) => {
  console.log('🎨 [IMAGE-ENHANCEMENT] Request received:', {
    userId: req.body.userId,
    hasOriginalImage: !!req.files?.original_image,
    hasMaskedImage: !!req.files?.masked_image
  });

  try {
    const maskImagePath = req.files?.masked_image?.[0]?.path;
    const originalImagePath = req.files?.original_image?.[0]?.path;

    if (!maskImagePath || !originalImagePath) {
      console.error('⚠️ Missing input files.');
      return res.status(400).send({ message: 'Both masked and original images are required.' });
    }

    const userId = req.body.userId;
    const user = await User.findById(userId);
    if (!user) {
      console.error(`❌ User not found: ${userId}`);
      return res.status(404).send({ message: "User not found" });
    }
    if (user.no_of_images_left <= 0) {
      console.warn(`⚠️ Image quota exceeded for user: ${userId}`);
      return res.status(400).send({ message: "Image generation limit reached" });
    }

    await User.findByIdAndUpdate(userId, { $inc: { no_of_images_left: -1 } });
    console.log(`📊 User ${userId} validated. Quota decremented.`);

    const payload = {
      input: {
        prompt: req.body.prompt,
        denoise: parseFloat(req.body.denoise) || 1,
        revert_extra: req.body.revert_extra || null,
        mask_image: toBase64(originalImagePath),
        original_image: toBase64(maskImagePath)
      }
    };

    console.log('📦 Payload ready for RunPod:');

    const response = await axios.post(RUNPOD_ENDPOINT, payload, {
      headers: {
        Authorization: RUNPOD_API_KEY,
        "Content-Type": "application/json"
      }
    });

    const jobId = response.data?.id;
    if (!jobId) throw new Error("Missing job ID from RunPod");

    console.log(`🚀 Job submitted to RunPod. Job ID: ${jobId}`);
    res.status(202).send({
      job_id: jobId,
        uuid: jobId,  // <-- add this line so frontend sees "uuid"

      message: "Image enhancement started. Use /image-enhancement-status/:job_id to check results."
    });
  } catch (err) {
    console.error('❌ [IMAGE-ENHANCEMENT] Error:', {
      message: err.message,
      stack: err.stack,
      response: err.response?.data
    });
    res.status(500).send({ message: "Internal server error" });
  }
});

router.get('/image-enhancement-status/:job_id', async (req, res) => {
  const { job_id } = req.params;
  try {
    console.log(`🔍 Polling status for job: ${job_id}`);
    const statusResponse = await axios.get(`https://api.runpod.ai/v2/gz0b6c1odcb3d5/status/${job_id}`, {
      headers: { Authorization: RUNPOD_API_KEY }
    });

    const { status, output } = statusResponse.data;
    console.log(`📈 RunPod job status: ${status}`);

    if (status === 'IN_PROGRESS' || status === 'IN_QUEUE') {
      return res.status(202).json({ status });
    }

    if (status === 'COMPLETED' && output?.images?.length > 0) {
      const imageUrls = output.images.map(img => `data:image/png;base64,${img}`);

      if (req.query.userId) {
        for (const img of output.images) {
          const buffer = Buffer.from(img, 'base64');
          await GeneratedImage.create({                         userId: req.query.userId,
            image: buffer,
            imageUrl: `data:image/png;base64,${img}`,
            prompt: req.query.prompt || '',
            negativePrompt: req.query.negative_prompt || '',
            width: parseInt(req.query.width) || 512,
            height: parseInt(req.query.height) || 512,
            steps: parseInt(req.query.steps) || 25,
            guidanceScale: parseFloat(req.query.guidance_scale) || 7.5,
            seed: parseInt(req.query.seed) || Math.floor(Math.random() * 1000000000),
            scheduler: req.query.scheduler || 'normal',
            clipSkip: parseInt(req.query.clip_skip) || 0,
            style: req.query.style || 'default',
            model: req.query.model_xl === 'true' ? 'XL' : 'default',
            type: 'image' });
          console.log(`💾 Image stored for user: ${req.query.userId}`);
        }
      }

      console.log(`✅ Job completed. ${imageUrls.length} image(s) returned.`);
      return res.status(200).json({ imageUrls });
    }

    console.warn('⚠️ Job completed but no images in output:', output);
    return res.status(500).json({
      error: 'Job completed but no output images found.',
      rawOutput: output
    });

  } catch (err) {
    console.error('❌ [IMAGE-ENHANCEMENT-STATUS] Error:', {
      jobId: job_id,
      error: err.message,
      response: err.response?.data
    });
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;