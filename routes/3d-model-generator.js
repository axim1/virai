const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

const RUNPOD_ENDPOINT_ID = "gtcqcjl9ljcw5l";
const RUNPOD_API_KEY = "Bearer rpa_G2LMUWQ8316N4VV7GPA02Y0IG0KGTY27XN2GHL1Jde540g";
const RUNPOD_BASE_URL = `https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}`;

// Utility: Convert file to base64
function toBase64(filePath) {
  const data = fs.readFileSync(filePath);
  return data.toString('base64');
}

// POST /generate-3d-model
router.post('/generate-3d-model', upload.single('image'), async (req, res) => {
  try {
    const referenceImagePath = req.file?.path;

    if (!referenceImagePath) {
      return res.status(400).json({ message: 'Reference image is required.' });
    }

    const payload = {
      input: {
        reference_image: toBase64(referenceImagePath),
        revert_extra: null
      }
    };

    const response = await axios.post(`${RUNPOD_BASE_URL}/run`, payload, {
      headers: {
        Authorization: RUNPOD_API_KEY,
        "Content-Type": "application/json"
      }
    });
    console.log('response from runpod:', response.data?.id)
    fs.unlinkSync(referenceImagePath); // Clean up

    const jobId = response.data?.id;
    if (!jobId) throw new Error("Missing job ID from RunPod");

    return res.status(202).json({
      job_id: jobId,
      message: "3D model generation started. Use /3d-model-status/:job_id to check status."
    });
  } catch (err) {
    console.error("3D model generation error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /3d-model-status/:job_id
router.get('/3d-model-status/:job_id', async (req, res) => {
  const { job_id } = req.params;
  try {
    const statusResponse = await axios.get(`${RUNPOD_BASE_URL}/status/${job_id}`, {
      headers: {
        Authorization: RUNPOD_API_KEY
      }
    });

    const { status, output } = statusResponse.data;

    if (status === 'IN_PROGRESS' || status === 'IN_QUEUE') {
      return res.status(202).json({ status });
    }

    if (status === 'COMPLETED' && output?.files?.length > 0) {
      return res.status(200).json({
        glb_base64: output.files[0].base64,
        message: "3D model generation completed."
      });
    }

    return res.status(500).json({
      error: 'Job completed but no GLB output found.',
      rawOutput: output,
    });
  } catch (err) {
    console.error('Error checking 3D job status:', err.response?.data || err.message);
    return res.status(500).json({ message: 'Failed to fetch status', details: err.message });
  }
});

module.exports = router;
