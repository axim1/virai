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
const completedEnhancementJobPromises = new Map();

function getImageOutputDir() {
  return process.env.MODEL_OUTPUT_DIR || path.join(__dirname, '../images');
}

function sanitizeJobId(jobId = '') {
  return jobId.replace(/[^a-zA-Z0-9-_]/g, '');
}

function getPublicImageUrl(fileName) {
  const baseUrl = (process.env.BACKEND_URL || '').replace(/\/+$/, '');
  const imagePath = `/images/${fileName}`;
  return baseUrl ? `${baseUrl}${imagePath}` : imagePath;
}

async function persistCompletedEnhancementImages(jobId, output, query) {
  const existingImages = await GeneratedImage.find({ jobId })
    .sort({ createdAt: 1 })
    .select('imageUrl')
    .lean();

  if (existingImages.length > 0) {
    return existingImages.map(image => image.imageUrl).filter(Boolean);
  }

  const outputDir = getImageOutputDir();
  fs.mkdirSync(outputDir, { recursive: true });
  const safeJobId = sanitizeJobId(jobId) || Date.now().toString();
  const imageUrls = [];

  for (const [index, img] of output.images.entries()) {
    const buffer = Buffer.from(img, 'base64');
    const fileName = `image-${safeJobId}-${index + 1}.png`;
    const savePath = path.join(outputDir, fileName);
    if (!fs.existsSync(savePath)) {
      fs.writeFileSync(savePath, buffer);
    }

    const imageUrl = getPublicImageUrl(fileName);
    imageUrls.push(imageUrl);

    await GeneratedImage.create({
      userId: query.userId,
      jobId,
      imageUrl,
      prompt: query.prompt || '',
      negativePrompt: query.negative_prompt || '',
      width: parseInt(query.width) || 512,
      height: parseInt(query.height) || 512,
      steps: parseInt(query.steps) || 25,
      guidanceScale: parseFloat(query.guidance_scale) || 7.5,
      seed: parseInt(query.seed) || Math.floor(Math.random() * 1000000000),
      scheduler: query.scheduler || 'normal',
      clipSkip: parseInt(query.clip_skip) || 0,
      style: query.style || 'default',
      model: query.model_xl === 'true' ? 'XL' : 'default',
      type: 'enhanced_image'
    });
  }

  return imageUrls;
}

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
      if (!req.query.userId) {
        const imageUrls = output.images.map(img => `data:image/png;base64,${img}`);
        return res.status(200).json({ imageUrls });
      }

      if (!completedEnhancementJobPromises.has(job_id)) {
        const persistencePromise = persistCompletedEnhancementImages(job_id, output, req.query)
          .finally(() => completedEnhancementJobPromises.delete(job_id));
        completedEnhancementJobPromises.set(job_id, persistencePromise);
      }

      const imageUrls = await completedEnhancementJobPromises.get(job_id);
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
