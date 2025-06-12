const express = require('express');
const axios = require('axios');
const { User } = require('../models');
const router = express.Router();

const RUNPOD_ENDPOINT = "https://api.runpod.ai/v2/q5rsf2wvu67m43/run";
const RUNPOD_STATUS_BASE = "https://api.runpod.ai/v2/q5rsf2wvu67m43/status";
const RUNPOD_API_KEY = "Bearer rpa_OPBINZKI3UYA9HX0YGSQ3ZMNPR1KMFT0PR0HSC7Qvtvij7";

// Submit text-to-image job
router.post('/text-to-image-serverless', async (req, res) => {
  console.log('📝 [TEXT-TO-IMAGE] New request received:', {
    userId: req.body.userId,
    prompt: req.body.prompt,
    requestParams: { ...req.body, prompt: undefined, userId: undefined }
  });

  try {
    const {
      userId,
      prompt,
      negative_prompt,
      width = 512,
      height = 512,
      num_images = 1,
      steps = 25,
      guidance_scale = 7.5,
      seed = Math.floor(Math.random() * 1000000000),
      scheduler = "normal",
      clip_skip = 0,
      style = "default",
      safetensor = false,
      model_xl = false,
      revert_extra = null
    } = req.body;

    if (!userId || !prompt) {
      console.warn('❌ [TEXT-TO-IMAGE] Missing required fields:', { userId: !!userId, prompt: !!prompt });
      return res.status(400).json({ message: "Missing required fields: userId or prompt." });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.warn('❌ [TEXT-TO-IMAGE] User not found:', { userId });
      return res.status(404).json({ message: "User not found" });
    }

    if (user.no_of_images_left <= 0) {
      console.warn('⚠️ [TEXT-TO-IMAGE] Image limit reached for user:', { userId, imagesLeft: user.no_of_images_left });
      return res.status(400).json({ message: "Image generation limit reached" });
    }

    console.log('👤 [TEXT-TO-IMAGE] User verified:', { userId, imagesLeft: user.no_of_images_left });

    await User.findByIdAndUpdate(userId, { $inc: { no_of_images_left: -num_images } });
    console.log('✅ [TEXT-TO-IMAGE] Updated user image count:', { userId, deducted: num_images });

    const payload = {
      prompt,
      negative_prompt,
      width: parseInt(width),
      height: parseInt(height),
      num_images: parseInt(num_images),
      steps: parseInt(steps),
      guidance_scale: parseFloat(guidance_scale),
      seed: parseInt(seed),
      scheduler,
      clip_skip: parseInt(clip_skip),
      style,
      safetensor: Boolean(safetensor),
      model_xl: Boolean(model_xl),
      revert_extra
    };

    const response = await axios.post(RUNPOD_ENDPOINT, { input: payload }, {
      headers: {
        Authorization: RUNPOD_API_KEY,
        "Content-Type": "application/json"
      }
    });

    const jobId = response.data?.id;
    if (!jobId) {
      console.error('❌ [TEXT-TO-IMAGE] Job submission failed - no job ID received');
      throw new Error("Job submission failed: Missing job ID");
    }

    console.log('✨ [TEXT-TO-IMAGE] Job submitted successfully:', { jobId, userId });
    res.status(202).json({
      job_id: jobId,
      message: "Text-to-image generation started. Use /text-to-image-status/:job_id to poll."
    });

  } catch (err) {
    console.error("❌ [TEXT-TO-IMAGE] Error:", err.message);
    console.error("📋 [TEXT-TO-IMAGE] Error details:", {
      name: err.name,
      stack: err.stack,
      response: err.response?.data
    });
    if (err.response) console.error("🔍 [TEXT-TO-IMAGE] RunPod Error:", err.response.data);
    res.status(500).json({ message: "Internal server error", details: err.message });
  }
});

// Poll job status
router.get('/text-to-image-status/:job_id', async (req, res) => {
  const { job_id } = req.params;
  console.log('🔍 [TEXT-TO-IMAGE-STATUS] Checking status for job:', { job_id });

  try {
    const statusResponse = await axios.get(`${RUNPOD_STATUS_BASE}/${job_id}`, {
      headers: { Authorization: RUNPOD_API_KEY }
    });

    const { status, output } = statusResponse.data;
    console.log('📊 [TEXT-TO-IMAGE-STATUS] Status received:', { job_id, status });

    if (status === 'IN_PROGRESS' || status === 'IN_QUEUE') {
      console.log('⏳ [TEXT-TO-IMAGE-STATUS] Job still processing:', { job_id, status });
      return res.status(202).json({ status });
    }

    if (status === 'COMPLETED' && output?.images?.length > 0) {
      console.log('✅ [TEXT-TO-IMAGE-STATUS] Job completed successfully:', { 
        job_id, 
        imageCount: output.images.length 
      });
      const imageUrls = output.images.map(img => `data:image/png;base64,${img}`);
      return res.status(200).json({ imageUrls });
    }

    console.warn('⚠️ [TEXT-TO-IMAGE-STATUS] Job completed but no images:', { 
      job_id, 
      status, 
      outputKeys: Object.keys(output || {})
    });
    return res.status(500).json({
      error: 'Job completed but no output images found.',
      rawOutput: output,
    });

  } catch (err) {
    console.error('❌ [TEXT-TO-IMAGE-STATUS] Error:', {
      job_id,
      error: err.message,
      response: err.response?.data
    });
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
