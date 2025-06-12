const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const { User, GeneratedImage } = require('../models');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

const RUNPOD_ENDPOINT = "https://api.runpod.ai/v2/e9h6mg32jrf3ol/run";
const RUNPOD_API_KEY = "Bearer rpa_OPBINZKI3UYA9HX0YGSQ3ZMNPR1KMFT0PR0HSC7Qvtvij7";

// Convert file to base64
function toBase64(filePath) {
  console.log('📄 [SKETCH-TO-IMAGE] Converting file to base64:', { filePath });
  const mimeType = "image/png";
  const data = fs.readFileSync(filePath);
  return `data:${mimeType};base64,${data.toString('base64')}`;
}

// Route to submit sketch image
router.post('/sketch-to-image-serverless', upload.single('sketch_image'), async (req, res) => {
  console.log('🎨 [SKETCH-TO-IMAGE] New request received:', {
    userId: req.body.userId,
    hasSketchImage: !!req.file,
    prompt: req.body.prompt
  });

  try {
    const { userId, prompt } = req.body;
    const sketchImagePath = req.file?.path;

    if (!userId || !prompt || !sketchImagePath) {
      console.warn('❌ [SKETCH-TO-IMAGE] Missing required fields:', {
        hasUserId: !!userId,
        hasPrompt: !!prompt,
        hasSketchImage: !!sketchImagePath
      });
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.warn('❌ [SKETCH-TO-IMAGE] User not found:', { userId });
      return res.status(404).send({ message: "User not found" });
    }

    if (user.no_of_images_left <= 0) {
      console.warn('⚠️ [SKETCH-TO-IMAGE] Image limit reached for user:', {
        userId,
        imagesLeft: user.no_of_images_left
      });
      return res.status(400).send({ message: "Image generation limit reached" });
    }

    console.log('👤 [SKETCH-TO-IMAGE] User verified:', {
      userId,
      imagesLeft: user.no_of_images_left
    });

    await User.findByIdAndUpdate(userId, { $inc: { no_of_images_left: -1 } });
    console.log('📊 [SKETCH-TO-IMAGE] Updated user image count:', { userId });

    const payload = {
      input: {
        sketch_image: toBase64(sketchImagePath),
        prompt,
        style: req.body.style || 'default',
        guidance_scale: parseFloat(req.body.guidance_scale) || 7.5,
        strength: parseFloat(req.body.strength) || 0.8
      }
    };

    console.log('🚀 [SKETCH-TO-IMAGE] Sending request to RunPod:', {
      prompt,
      style: payload.input.style,
      guidance_scale: payload.input.guidance_scale,
      strength: payload.input.strength
    });

    const response = await axios.post(RUNPOD_ENDPOINT, payload, {
      headers: {
        Authorization: RUNPOD_API_KEY,
        "Content-Type": "application/json"
      }
    });

    const jobId = response.data?.id;
    console.log('✅ [SKETCH-TO-IMAGE] RunPod response received:', { jobId });

    fs.unlinkSync(sketchImagePath);
    console.log('🗑️ [SKETCH-TO-IMAGE] Cleaned up temporary file:', { path: sketchImagePath });

    if (!jobId) {
      console.error('❌ [SKETCH-TO-IMAGE] No job ID received from RunPod');
      throw new Error("Missing job ID from RunPod");
    }

    console.log('✨ [SKETCH-TO-IMAGE] Job submitted successfully:', { jobId });
    res.status(202).json({
      job_id: jobId,
      message: "Sketch-to-image generation started. Use /sketch-to-image-status/:job_id to poll."
    });

  } catch (err) {
    console.error('❌ [SKETCH-TO-IMAGE] Error:', {
      message: err.message,
      stack: err.stack,
      response: err.response?.data
    });
    if (err.response) console.error("🔍 [SKETCH-TO-IMAGE] RunPod Error:", err.response.data);
    res.status(500).send({ message: "Internal server error" });
  }
});

router.get('/sketch-to-image-status/:job_id', async (req, res) => {
  const { job_id } = req.params;
  console.log('🔍 [SKETCH-TO-IMAGE-STATUS] Checking status for job:', { jobId: job_id });

  try {
    const statusResponse = await axios.get(
      `https://api.runpod.ai/v2/e9h6mg32jrf3ol/status/${job_id}`,
      {
        headers: { Authorization: RUNPOD_API_KEY },
      }
    );

    const { status, output } = statusResponse.data;
    console.log('📊 [SKETCH-TO-IMAGE-STATUS] Status received:', { jobId: job_id, status });

    if (status === 'IN_PROGRESS' || status === 'IN_QUEUE') {
      console.log('⏳ [SKETCH-TO-IMAGE-STATUS] Job still processing:', { jobId: job_id, status });
      return res.status(202).json({ status });
    }

    if (status === 'COMPLETED' && output?.images?.length > 0) {
      console.log('✅ [SKETCH-TO-IMAGE-STATUS] Job completed successfully:', {
        jobId: job_id,
        imageCount: output.images.length
      });
      const formattedImages = output.images.map(img => `data:image/png;base64,${img}`);
      return res.status(200).json({ imageUrls: formattedImages });
    }

    console.warn('⚠️ [SKETCH-TO-IMAGE-STATUS] Job completed but no images found:', {
      jobId: job_id,
      status,
      outputKeys: Object.keys(output || {})
    });
    return res.status(500).json({
      error: 'Job completed but no output images found.',
      rawOutput: output,
    });
  } catch (err) {
    console.error('❌ [SKETCH-TO-IMAGE-STATUS] Error:', {
      jobId: job_id,
      error: err.message,
      response: err.response?.data
    });
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
