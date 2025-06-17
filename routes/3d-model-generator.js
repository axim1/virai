const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const router = express.Router();
const { GeneratedImage } = require('../models');
const path = require('path');

const upload = multer({ dest: 'uploads/' });

const RUNPOD_ENDPOINT_ID = "5ebbw8na6bijga";
const RUNPOD_API_KEY = "rpa_OPBINZKI3UYA9HX0YGSQ3ZMNPR1KMFT0PR0HSC7Qvtvij7";
const RUNPOD_BASE_URL = `https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}`;

// Utility: Convert file to base64
function toBase64(filePath) {
  console.log('📄 [3D-MODEL] Converting file to base64:', { filePath });
  const data = fs.readFileSync(filePath);
  return data.toString('base64');
}

// Utility: Retry function with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      retries++;
      if (retries === maxRetries) throw error;
      
      const delay = initialDelay * Math.pow(2, retries - 1);
      console.log(`Retry ${retries}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// POST /generate-3d-model
router.post('/generate-3d-model', upload.single('image'), async (req, res) => {
  console.log('🎨 [3D-MODEL] New 3D model generation request received');
  
  try {
    const referenceImagePath = req.file?.path;

    if (!referenceImagePath) {
      console.warn('❌ [3D-MODEL] No reference image provided in request');
      return res.status(400).json({ message: 'Reference image is required.' });
    }

    console.log('📸 [3D-MODEL] Reference image received:', { path: referenceImagePath });

    const payload = {
      input: {
        reference_image: toBase64(referenceImagePath),
        revert_extra: null
      }
    };

    console.log('🚀 [3D-MODEL] Sending request to RunPod');

    const response = await retryWithBackoff(async () => {
      return await axios.post(`${RUNPOD_BASE_URL}/run`, payload, {
        headers: {
          'Authorization': `Bearer ${RUNPOD_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });
    });
    
    console.log('✅ [3D-MODEL] RunPod response received:', { jobId: response.data?.id });

    fs.unlinkSync(referenceImagePath);
    console.log('🗑️ [3D-MODEL] Cleaned up temporary file:', { path: referenceImagePath });

    const jobId = response.data?.id;
    if (!jobId) {
      console.error('❌ [3D-MODEL] No job ID received from RunPod');
      throw new Error("Missing job ID from RunPod");
    }

    console.log('✨ [3D-MODEL] Job submitted successfully:', { jobId });
    return res.status(202).json({
      job_id: jobId,
      message: "3D model generation started. Use /3d-model-status/:job_id to check status."
    });
  } catch (err) {
    console.error('❌ [3D-MODEL] Error during 3D model generation:', {
      error: err.message,
      stack: err.stack,
      response: err.response?.data
    });
    
    // Clean up the file if it exists
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupErr) {
        console.error('Failed to clean up file:', cleanupErr);
      }
    }
    
    return res.status(500).json({ 
      message: "Internal server error",
      details: err.response?.data || err.message
    });
  }
});

// GET /3d-model-status/:job_id
router.get('/3d-model-status/:job_id', async (req, res) => {
  const { job_id } = req.params;
  console.log('🔍 [3D-MODEL-STATUS] Checking status for job:', { jobId: job_id });

  const { userId } = req.query;
  console.log('🔍 [3D-MODEL-STATUS] Checking status for job:', { jobId: userId });

  try {
    const statusResponse = await axios.get(`${RUNPOD_BASE_URL}/status/${job_id}`, {
      headers: {
        Authorization: RUNPOD_API_KEY
      }
    });

    const { status, output } = statusResponse.data;
    console.log('📊 [3D-MODEL-STATUS] Status received:', { jobId: job_id, status });

    if (status === 'IN_PROGRESS' || status === 'IN_QUEUE') {
      console.log('⏳ [3D-MODEL-STATUS] Job still processing:', { jobId: job_id, status });
      return res.status(202).json({ status });
    }

    if (status === 'COMPLETED' && output?.files?.length > 0) {
      console.log('✅ [3D-MODEL-STATUS] Job completed successfully:', { 
        jobId: job_id,
        filesCount: output.files.length,
        userId: userId
      });
      
      // Save to DB if userId is provided
      if (userId) {
        try {
          console.log('🔄 [3D-MODEL-STATUS] Processing model data...');
          
          // Convert base64 to buffer
          const modelBuffer = Buffer.from(output.files[0].base64, 'base64');
          
          console.log('📦 [3D-MODEL-STATUS] Model data processed:', {
            size: modelBuffer.length
          });

          // Save to database with type and model data
          console.log('💾 [3D-MODEL-STATUS] Saving model to database...');
          const savedModel = await GeneratedImage.create({
            userId: userId,
            image: modelBuffer,
            type: '3d_model',
            modelUrl: null,
            createdAt: new Date()
          });
          
          console.log('✅ [3D-MODEL-STATUS] Model saved successfully:', {
            jobId: job_id,
            type: '3d_model',
            modelId: savedModel._id,
            modelSize: modelBuffer.length
          });

          // Verify the model was saved correctly
          const verifyModel = await GeneratedImage.findById(savedModel._id);
          console.log('🔍 [3D-MODEL-STATUS] Verification:', {
            type: verifyModel.type,
            hasImage: !!verifyModel.image,
            imageSize: verifyModel.image?.length
          });

          // Return the saved model ID along with the completion message
          return res.status(200).json({
            glb_base64: output.files[0].base64,
            message: "3D model generation completed.",
            modelId: savedModel._id
          });
        } catch (saveError) {
          console.error('❌ [3D-MODEL-STATUS] Error saving model:', {
            error: saveError.message,
            stack: saveError.stack
          });
          throw saveError;
        }
      } else {
        console.log('⚠️ [3D-MODEL-STATUS] No userId provided, skipping database save');
      }
      
      return res.status(200).json({
        glb_base64: output.files[0].base64,
        message: "3D model generation completed."
      });
    }

    console.warn('⚠️ [3D-MODEL-STATUS] Job completed but no GLB found:', {
      jobId: job_id,
      status,
      outputKeys: Object.keys(output || {})
    });
    return res.status(500).json({
      error: 'Job completed but no GLB output found.',
      rawOutput: output,
    });
  } catch (err) {
    console.error('❌ [3D-MODEL-STATUS] Error checking job status:', {
      jobId: job_id,
      error: err.message,
      response: err.response?.data
    });
    return res.status(500).json({ message: 'Failed to fetch status', details: err.message });
  }
});

module.exports = router;
