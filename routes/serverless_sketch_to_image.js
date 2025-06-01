const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const { User, GeneratedImage } = require('../models');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

const RUNPOD_ENDPOINT = "https://api.runpod.ai/v2/3odhh7juot5ez0/run";
const RUNPOD_API_KEY = "Bearer rpa_G2LMUWQ8316N4VV7GPA02Y0IG0KGTY27XN2GHL1Jde540g";

// Convert file to base64
function toBase64(filePath) {
  const mimeType = "image/png";
  const data = fs.readFileSync(filePath);
  return `data:${mimeType};base64,${data.toString('base64')}`;
}

// Route to submit sketch image
router.post('/sketch-to-image-serverless', upload.single('sketch_image'), async (req, res) => {
  try {
    console.log('I am here')
    const { userId, prompt } = req.body;
    const sketchImagePath = req.file?.path;

    if (!userId || !prompt || !sketchImagePath) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).send({ message: "User not found" });

    if (user.no_of_images_left <= 0) {
      return res.status(400).send({ message: "Image generation limit reached" });
    }

    await User.findByIdAndUpdate(userId, { $inc: { no_of_images_left: -1 } });

    const payload = {
      input: {
        sketch_image: toBase64(sketchImagePath),
        prompt,
        style: req.body.style || 'default',
        guidance_scale: parseFloat(req.body.guidance_scale) || 7.5,
        strength: parseFloat(req.body.strength) || 0.8
      }
    };

    const response = await axios.post(RUNPOD_ENDPOINT, payload, {
      headers: {
        Authorization: RUNPOD_API_KEY,
        "Content-Type": "application/json"
      }
    });

    const jobId = response.data?.id;
    fs.unlinkSync(sketchImagePath); // Clean up
    console.log('Job id: ',jobId)
    if (!jobId) throw new Error("Missing job ID from RunPod");

    res.status(202).json({
      job_id: jobId,
      message: "Sketch-to-image generation started. Use /sketch-to-image-status/:job_id to poll."
    });

  } catch (err) {
    console.error("Sketch-to-image error:", err);
    if (err.response) console.error("RunPod Error:", err.response.data);
    res.status(500).send({ message: "Internal server error" });
  }
});
router.get('/sketch-to-image-status/:job_id', async (req, res) => {
    const { job_id } = req.params;
    try {
      const statusResponse = await axios.get(
        `https://api.runpod.ai/v2/3odhh7juot5ez0/status/${job_id}`,
        {
          headers: { Authorization: `Bearer rpa_G2LMUWQ8316N4VV7GPA02Y0IG0KGTY27XN2GHL1Jde540g` },
        }
      );
  
      const { status, output } = statusResponse.data;
      console.log('status: ',status)

      if (status === 'IN_PROGRESS' || status === 'IN_QUEUE') {
        return res.status(202).json({ status });
      }
  
      if (status === 'COMPLETED' && output?.images?.length > 0) {
        const formattedImages = output.images.map(img => `data:image/png;base64,${img}`);
        return res.status(200).json({ imageUrls: formattedImages });
      }
      
  
      return res.status(500).json({
        error: 'Job completed but no output images found.',
        rawOutput: output,
      });
    } catch (err) {
      console.error('❌ Error fetching status:', err.response?.data || err.message);
      return res.status(500).json({ error: 'Server error', details: err.message });
    }
  });
  
  
module.exports = router;
