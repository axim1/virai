const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const https = require('https');
const path = require('path');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const router = express.Router();
const { GeneratedImage } = require('../models');

const upload = multer({ dest: 'uploads/' });
const RUNPOD_STATUS_TIMEOUT_MS = Number(process.env.RUNPOD_3D_STATUS_TIMEOUT_MS || 180000);
const RUNPOD_HTTPS_AGENT = new https.Agent({ keepAlive: true, family: 4 });
const TRELLIS_DEFAULT_INPUTS = {
  resolution: '512',
  decimation_target: 100000,
  texture_size: 1024,
  preview_resolution: 256,
  preview_mode: 'shaded_forest',
  include_glb_base64: true,
  include_preview: true,
  // TRELLIS is much more stable when it can isolate the object from the
  // background before structure sampling.
  preprocess_image: true,
  randomize_seed: true,
  seed: 0,
  ss_guidance_strength: 7.5,
  ss_guidance_rescale: 0.7,
  ss_sampling_steps: 12,
  ss_rescale_t: 5.0,
  shape_slat_guidance_strength: 7.5,
  shape_slat_guidance_rescale: 0.5,
  shape_slat_sampling_steps: 12,
  shape_slat_rescale_t: 3.0,
  tex_slat_guidance_strength: 1.0,
  tex_slat_guidance_rescale: 0.0,
  tex_slat_sampling_steps: 12,
  tex_slat_rescale_t: 3.0
};

function getRunpodEndpointId() {
  return process.env.RUNPOD_3D_ENDPOINT_ID || '6j6605vgn3mpx2';
}

function getRunpodBaseUrl() {
  return `https://api.runpod.ai/v2/${getRunpodEndpointId()}`;
}

function getModelOutputDir() {
  return process.env.MODEL_OUTPUT_DIR || path.join(__dirname, '../images');
}

function getR2Config() {
  const endpoint =
    process.env.R2_ENDPOINT ||
    (process.env.R2_ACCOUNT_ID
      ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
      : null);

  return {
    bucket: process.env.R2_BUCKET,
    endpoint,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL || null
  };
}

function isR2Configured() {
  const config = getR2Config();
  return Boolean(config.bucket && config.endpoint && config.accessKeyId && config.secretAccessKey);
}

let r2Client = null;
function getR2Client() {
  if (r2Client) return r2Client;

  const config = getR2Config();
  if (!isR2Configured()) {
    throw new Error('Cloudflare R2 is not fully configured.');
  }

  r2Client = new S3Client({
    region: 'auto',
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey
    }
  });

  return r2Client;
}

function buildProxyModelUrl(objectKey) {
  return `/api/serverless/3d-model-file?key=${encodeURIComponent(objectKey)}`;
}

function resolveReturnedModelLocation(output, fileName) {
  if (output?.glb_url) {
    return output.glb_url;
  }

  if (output?.glb_object_key) {
    return buildProxyModelUrl(output.glb_object_key);
  }

  return `/images/${fileName}`;
}

function toBase64(filePath) {
  const data = fs.readFileSync(filePath);
  return data.toString('base64');
}

function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function cleanupTempFile(filePath) {
  if (!filePath) return;
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    console.warn('⚠️ [3D-MODEL] Failed to clean up temporary file:', {
      filePath,
      error: error.message
    });
  }
}

async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      retries += 1;
      if (retries === maxRetries) throw error;

      const delay = initialDelay * Math.pow(2, retries - 1);
      console.log(`Retry ${retries}/${maxRetries} after ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

function getAuthHeaders() {
  const runpodApiKey = process.env.RUNPOD_API_KEY || process.env.RUNPOD_3D_API_KEY;

  if (!runpodApiKey) {
    throw new Error('RUNPOD_API_KEY (or RUNPOD_3D_API_KEY) is not configured.');
  }

  return {
    Authorization: `Bearer ${runpodApiKey}`,
    'Content-Type': 'application/json'
  };
}

function toBool(value, defaultValue) {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
  }
  return Boolean(value);
}

function toInt(value, defaultValue) {
  if (value === undefined || value === null || value === '') return defaultValue;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function toFloat(value, defaultValue) {
  if (value === undefined || value === null || value === '') return defaultValue;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function getRunpodRequestConfig(timeoutMs) {
  return {
    headers: getAuthHeaders(),
    timeout: timeoutMs,
    httpsAgent: RUNPOD_HTTPS_AGENT
  };
}

function isTransientRunpodNetworkError(error) {
  const transientCodes = new Set(['ETIMEDOUT', 'ECONNRESET', 'EAI_AGAIN', 'ENOTFOUND']);
  if (transientCodes.has(error.code)) {
    return true;
  }

  const message = error.message || '';
  return (
    message.includes('connect ETIMEDOUT') ||
    message.includes('socket hang up') ||
    message.includes('network timeout')
  );
}

function buildRunpodInput(req) {
  const uploadedImagePath = req.file?.path;
  const imageUrl = req.body?.image_url;

  if (!uploadedImagePath && !imageUrl) {
    throw new Error('Reference image is required.');
  }

  const input = {
    resolution: String(req.body?.resolution || TRELLIS_DEFAULT_INPUTS.resolution),
    include_glb_base64: toBool(
      req.body?.include_glb_base64,
      isR2Configured() ? false : TRELLIS_DEFAULT_INPUTS.include_glb_base64
    ),
    include_preview: toBool(req.body?.include_preview, TRELLIS_DEFAULT_INPUTS.include_preview),
    preview_mode: req.body?.preview_mode || TRELLIS_DEFAULT_INPUTS.preview_mode,
    preview_resolution: toInt(req.body?.preview_resolution, TRELLIS_DEFAULT_INPUTS.preview_resolution),
    decimation_target: toInt(req.body?.decimation_target, TRELLIS_DEFAULT_INPUTS.decimation_target),
    texture_size: toInt(req.body?.texture_size, TRELLIS_DEFAULT_INPUTS.texture_size),
    preprocess_image: toBool(req.body?.preprocess_image, TRELLIS_DEFAULT_INPUTS.preprocess_image),
    randomize_seed: toBool(req.body?.randomize_seed, TRELLIS_DEFAULT_INPUTS.randomize_seed),
    seed: toInt(req.body?.seed, TRELLIS_DEFAULT_INPUTS.seed),
    ss_guidance_strength: toFloat(req.body?.ss_guidance_strength, TRELLIS_DEFAULT_INPUTS.ss_guidance_strength),
    ss_guidance_rescale: toFloat(req.body?.ss_guidance_rescale, TRELLIS_DEFAULT_INPUTS.ss_guidance_rescale),
    ss_sampling_steps: toInt(req.body?.ss_sampling_steps, TRELLIS_DEFAULT_INPUTS.ss_sampling_steps),
    ss_rescale_t: toFloat(req.body?.ss_rescale_t, TRELLIS_DEFAULT_INPUTS.ss_rescale_t),
    shape_slat_guidance_strength: toFloat(
      req.body?.shape_slat_guidance_strength,
      TRELLIS_DEFAULT_INPUTS.shape_slat_guidance_strength
    ),
    shape_slat_guidance_rescale: toFloat(
      req.body?.shape_slat_guidance_rescale,
      TRELLIS_DEFAULT_INPUTS.shape_slat_guidance_rescale
    ),
    shape_slat_sampling_steps: toInt(
      req.body?.shape_slat_sampling_steps,
      TRELLIS_DEFAULT_INPUTS.shape_slat_sampling_steps
    ),
    shape_slat_rescale_t: toFloat(req.body?.shape_slat_rescale_t, TRELLIS_DEFAULT_INPUTS.shape_slat_rescale_t),
    tex_slat_guidance_strength: toFloat(
      req.body?.tex_slat_guidance_strength,
      TRELLIS_DEFAULT_INPUTS.tex_slat_guidance_strength
    ),
    tex_slat_guidance_rescale: toFloat(
      req.body?.tex_slat_guidance_rescale,
      TRELLIS_DEFAULT_INPUTS.tex_slat_guidance_rescale
    ),
    tex_slat_sampling_steps: toInt(
      req.body?.tex_slat_sampling_steps,
      TRELLIS_DEFAULT_INPUTS.tex_slat_sampling_steps
    ),
    tex_slat_rescale_t: toFloat(req.body?.tex_slat_rescale_t, TRELLIS_DEFAULT_INPUTS.tex_slat_rescale_t)
  };

  if (imageUrl) {
    input.image_url = imageUrl;
  } else {
    input.image_base64 = toBase64(uploadedImagePath);
  }

  return input;
}

function getGlbBase64(output) {
  if (typeof output?.glb_base64 === 'string' && output.glb_base64.length > 0) {
    return output.glb_base64;
  }

  if (Array.isArray(output?.files) && output.files[0]?.base64) {
    return output.files[0].base64;
  }

  return null;
}

function getPreviewImage(output) {
  if (output?.preview_images?.shaded_forest) {
    return output.preview_images.shaded_forest;
  }

  return null;
}

function parseDataUrl(dataUrl) {
  if (typeof dataUrl !== 'string') return null;
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], 'base64')
  };
}

function extensionForMimeType(mimeType) {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'bin';
  }
}

function sanitizeJobId(jobId) {
  return String(jobId || '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 120);
}

async function streamS3BodyToResponse(body, res) {
  if (!body) {
    throw new Error('R2 object response body is empty.');
  }

  if (typeof body.pipe === 'function') {
    await new Promise((resolve, reject) => {
      body.on('error', reject);
      res.on('close', resolve);
      body.pipe(res);
    });
    return;
  }

  if (typeof body.transformToByteArray === 'function') {
    const bytes = await body.transformToByteArray();
    res.send(Buffer.from(bytes));
    return;
  }

  throw new Error('Unsupported R2 response body type.');
}

async function s3BodyToBuffer(body) {
  if (!body) {
    throw new Error('R2 object response body is empty.');
  }

  if (typeof body.transformToByteArray === 'function') {
    const bytes = await body.transformToByteArray();
    return Buffer.from(bytes);
  }

  if (typeof body.pipe === 'function') {
    const chunks = [];
    for await (const chunk of body) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  throw new Error('Unsupported R2 response body type.');
}

// POST /generate-3d-model
router.post('/generate-3d-model', upload.single('image'), async (req, res) => {
  console.log('🎨 [3D-MODEL] New 3D model generation request received');

  try {
    const payload = { input: buildRunpodInput(req) };

    console.log('🚀 [3D-MODEL] Sending request to TRELLIS RunPod endpoint', {
      endpointId: getRunpodEndpointId(),
      usesImageUrl: Boolean(payload.input.image_url),
      resolution: payload.input.resolution,
      preprocessImage: payload.input.preprocess_image,
      decimationTarget: payload.input.decimation_target,
      textureSize: payload.input.texture_size,
      randomizeSeed: payload.input.randomize_seed
    });

    const response = await retryWithBackoff(() =>
      axios.post(`${getRunpodBaseUrl()}/run`, payload, getRunpodRequestConfig(30000))
    );

    cleanupTempFile(req.file?.path);

    const jobId = response.data?.id;
    if (!jobId) {
      throw new Error('Missing job ID from RunPod.');
    }

    return res.status(202).json({
      job_id: jobId,
      message: '3D model generation started. Use /3d-model-status/:job_id to check status.'
    });
  } catch (error) {
    cleanupTempFile(req.file?.path);

    console.error('❌ [3D-MODEL] Error during 3D model generation:', {
      error: error.message,
      response: error.response?.data
    });

    return res.status(500).json({
      message: 'Internal server error',
      details: error.response?.data || error.message
    });
  }
});

// GET /3d-model-status/:job_id
router.get('/3d-model-status/:job_id', async (req, res) => {
  const { job_id } = req.params;
  const { userId } = req.query;
  const statusRequestStartedAt = Date.now();

  console.log('🔍 [3D-MODEL-STATUS] Checking status for job:', { jobId: job_id, userId });

  try {
    const statusResponse = await retryWithBackoff(() =>
      axios.get(`${getRunpodBaseUrl()}/status/${job_id}`, getRunpodRequestConfig(RUNPOD_STATUS_TIMEOUT_MS)),
      2,
      1500
    );
    const statusRequestDurationMs = Date.now() - statusRequestStartedAt;

    const { status, output } = statusResponse.data;
    console.log('📊 [3D-MODEL-STATUS] RunPod status response received:', {
      jobId: job_id,
      status,
      durationMs: statusRequestDurationMs
    });

    if (status === 'IN_PROGRESS' || status === 'IN_QUEUE') {
      return res.status(202).json({ status });
    }

    if (status !== 'COMPLETED') {
      return res.status(500).json({
        error: '3D generation failed or returned an unexpected status.',
        status,
        rawOutput: output || statusResponse.data
      });
    }

    const glbBase64 = getGlbBase64(output);
    const previewImage = getPreviewImage(output);
    const fileName = output?.glb_filename || `3d-model-${Date.now()}.glb`;
    let modelUrl = resolveReturnedModelLocation(output, fileName);
    let glbSizeBytes = output?.glb_size_bytes || null;
    let modelBuffer = null;
    let previewImageUrl = null;
    const existingModel = userId
      ? await GeneratedImage.findOne({ userId, jobId: job_id }).sort({ createdAt: -1 })
      : null;

    if (!glbBase64 && !output?.glb_url && !output?.glb_object_key) {
      return res.status(500).json({
        error: 'Job completed but no GLB output was returned.',
        rawOutput: output
      });
    }

    if (glbBase64) {
      modelBuffer = Buffer.from(glbBase64, 'base64');
      const glbBase64Length = glbBase64.length;
      glbSizeBytes = glbSizeBytes || modelBuffer.length;
    } else {
      console.log('🌩️ [3D-MODEL-STATUS] Using remote model storage for completed GLB:', {
        jobId: job_id,
        modelUrl,
        glbObjectKey: output?.glb_object_key || null,
        glbSizeBytes
      });

      if (output?.glb_object_key && isR2Configured()) {
        const r2 = getR2Client();
        const { bucket } = getR2Config();
        const response = await r2.send(
          new GetObjectCommand({
            Bucket: bucket,
            Key: output.glb_object_key
          })
        );
        modelBuffer = await s3BodyToBuffer(response.Body);
        glbSizeBytes = glbSizeBytes || modelBuffer.length;
      }
    }

    if (modelBuffer) {
      const modelOutputDir = getModelOutputDir();
      ensureDirExists(modelOutputDir);
      const savePath = path.join(modelOutputDir, fileName);
      console.log('💾 [3D-MODEL-STATUS] Writing completed model to disk:', {
        jobId: job_id,
        outputDir: modelOutputDir,
        savePath,
        glbBase64Length: glbBase64 ? glbBase64.length : null,
        glbSizeBytes
      });
      if (!fs.existsSync(savePath)) {
        fs.writeFileSync(savePath, modelBuffer);
      }
      console.log('✅ [3D-MODEL-STATUS] Model file written:', {
        jobId: job_id,
        savePath
      });
      modelUrl = `/images/${fileName}`;
    }

    if (previewImage) {
      const parsedPreview = parseDataUrl(previewImage);
      if (parsedPreview) {
        const previewFileName = `image-${sanitizeJobId(job_id)}.${extensionForMimeType(parsedPreview.mimeType)}`;
        const previewOutputDir = getModelOutputDir();
        ensureDirExists(previewOutputDir);
        const previewSavePath = path.join(previewOutputDir, previewFileName);
        if (!fs.existsSync(previewSavePath)) {
          fs.writeFileSync(previewSavePath, parsedPreview.buffer);
        }
        previewImageUrl = `/images/${previewFileName}`;
      } else {
        previewImageUrl = previewImage;
      }
    }

    if (!previewImageUrl && existingModel?.imageUrl) {
      previewImageUrl = existingModel.imageUrl;
    }

    let savedModel = existingModel;
    if (userId) {
      try {
        const payload = {
          userId,
          jobId: job_id,
          type: '3d_model',
          modelUrl,
          imageUrl: previewImageUrl,
          description: JSON.stringify({
            resolution: output?.resolution,
            seed: output?.seed,
            texture_size: output?.texture_size,
            decimation_target: output?.decimation_target,
            glb_size_bytes: glbSizeBytes,
            glb_object_key: output?.glb_object_key || null
          })
        };

        if (existingModel) {
          savedModel = await GeneratedImage.findByIdAndUpdate(
            existingModel._id,
            { $set: payload },
            { new: true }
          );
        } else {
          savedModel = await GeneratedImage.create({
            ...payload,
            createdAt: new Date()
          });
        }
      } catch (saveError) {
        console.error('⚠️ [3D-MODEL-STATUS] Model finished but DB save failed:', {
          error: saveError.message
        });
      }
    }

    return res.status(200).json({
      status,
      message: '3D model generation completed.',
      modelId: savedModel?._id || null,
      modelUrl,
      glb_filename: fileName,
      glb_size_bytes: glbSizeBytes,
      glb_base64: glbBase64 || null,
      preview_image: previewImageUrl || previewImage,
      resolution: output?.resolution,
      seed: output?.seed,
      texture_size: output?.texture_size,
      cold_start: output?.cold_start,
      generation_seconds: output?.generation_seconds,
      model_load_seconds: output?.model_load_seconds
    });
  } catch (error) {
    if (isTransientRunpodNetworkError(error)) {
      console.warn('⚠️ [3D-MODEL-STATUS] Transient RunPod network error, keeping polling alive:', {
        jobId: job_id,
        error: error.message,
        code: error.code
      });

      return res.status(202).json({
        status: 'IN_PROGRESS',
        transient: true
      });
    }

    console.error('❌ [3D-MODEL-STATUS] Error checking job status:', {
      jobId: job_id,
      error: error.message,
      response: error.response?.data,
      timeoutMs: RUNPOD_STATUS_TIMEOUT_MS
    });

    return res.status(500).json({
      message: 'Failed to fetch status',
      details: error.response?.data || error.message
    });
  }
});

router.get('/3d-model-file', async (req, res) => {
  const objectKey = req.query.key;

  if (!objectKey) {
    return res.status(400).json({ message: 'Missing R2 object key.' });
  }

  if (!isR2Configured()) {
    return res.status(500).json({ message: 'Cloudflare R2 is not configured on the backend.' });
  }

  try {
    const r2 = getR2Client();
    const { bucket } = getR2Config();
    const response = await r2.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: objectKey
      })
    );

    res.setHeader('Content-Type', response.ContentType || 'model/gltf-binary');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    if (response.ContentLength) {
      res.setHeader('Content-Length', String(response.ContentLength));
    }

    await streamS3BodyToResponse(response.Body, res);
  } catch (error) {
    console.error('❌ [3D-MODEL-FILE] Failed to stream model from Cloudflare R2:', {
      key: objectKey,
      error: error.message
    });
    if (!res.headersSent) {
      return res.status(500).json({
        message: 'Failed to fetch model file from storage.',
        details: error.message
      });
    }
  }
});

module.exports = router;
