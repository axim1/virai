const express = require('express');
const axios = require('axios');
const { User } = require('../models');
const router = express.Router();

const RUNPOD_ENDPOINT = "https://api.runpod.ai/v2/mj5zlxc5nnkozl/run";
const RUNPOD_STATUS_BASE = "https://api.runpod.ai/v2/mj5zlxc5nnkozl/status";
const RUNPOD_API_KEY = "Bearer rpa_G2LMUWQ8316N4VV7GPA02Y0IG0KGTY27XN2GHL1Jde540g";

// Submit text-to-image job
router.post('/text-to-image-serverless', async (req, res) => {
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
      return res.status(400).json({ message: "Missing required fields: userId or prompt." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.no_of_images_left <= 0) {
      return res.status(400).json({ message: "Image generation limit reached" });
    }

    await User.findByIdAndUpdate(userId, { $inc: { no_of_images_left: -num_images } });

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
    if (!jobId) throw new Error("Job submission failed: Missing job ID");

    res.status(202).json({
      job_id: jobId,
      message: "Text-to-image generation started. Use /text-to-image-status/:job_id to poll."
    });

  } catch (err) {
    console.error("Text-to-image error:", err);
    if (err.response) console.error("RunPod Error:", err.response.data);
    res.status(500).json({ message: "Internal server error", details: err.message });
  }
});

// Poll job status
router.get('/text-to-image-status/:job_id', async (req, res) => {
  const { job_id } = req.params;
  try {
    const statusResponse = await axios.get(`${RUNPOD_STATUS_BASE}/${job_id}`, {
      headers: { Authorization: RUNPOD_API_KEY }
    });

    const { status, output } = statusResponse.data;

    if (status === 'IN_PROGRESS' || status === 'IN_QUEUE') {
      return res.status(202).json({ status });
    }

    if (status === 'COMPLETED' && output?.images?.length > 0) {
      const imageUrls = output.images.map(img => `data:image/png;base64,${img}`);
      return res.status(200).json({ imageUrls });
    }

    return res.status(500).json({
      error: 'Job completed but no output images found.',
      rawOutput: output,
    });

  } catch (err) {
    console.error('❌ Error fetching text-to-image status:', err.response?.data || err.message);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
