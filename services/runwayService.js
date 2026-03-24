const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const RunwayML = require('@runwayml/sdk').default;
const { toFile } = require('@runwayml/sdk');
const { GeneratedImage } = require('../models');
const taskStore = require('./runwayTaskStore');

const RUNWAY_API_VERSION = process.env.RUNWAY_API_VERSION || '2024-11-06';
const RUNWAY_TEXT_MODEL = process.env.RUNWAY_TEXT_MODEL || 'gen4.5';
const RUNWAY_IMAGE_MODEL = process.env.RUNWAY_IMAGE_MODEL || 'gen4_turbo';
const BACKEND_URL = (process.env.BACKEND_URL || '').replace(/\/+$/, '');
const MEDIA_DIR = process.env.RUNWAY_MEDIA_DIR || path.join(__dirname, '..', '..', 'images');
const SHOULD_SAVE_TO_DB = process.env.RUNWAY_SAVE_TO_DB !== 'false';
const RUNWAY_LOG_VERBOSE = process.env.RUNWAY_LOG_VERBOSE === 'true';
const SUPPORTED_TEXT_MODELS = new Set(['gen4.5', 'veo3.1', 'veo3.1_fast', 'veo3']);
const GEN45_ALLOWED_RATIOS = new Set(['1280:720', '720:1280']);

const TERMINAL_SUCCESS = new Set(['SUCCEEDED']);
const TERMINAL_FAILED = new Set(['FAILED', 'CANCELLED', 'THROTTLED']);

function logInfo(message, meta) {
  if (meta) return console.log(`[runway] ${message}`, meta);
  return console.log(`[runway] ${message}`);
}

function logWarn(message, meta) {
  if (meta) return console.warn(`[runway] ${message}`, meta);
  return console.warn(`[runway] ${message}`);
}

function logError(message, meta) {
  if (meta) return console.error(`[runway] ${message}`, meta);
  return console.error(`[runway] ${message}`);
}

function getRunwayClient() {
  if (!process.env.RUNWAY_API_KEY) {
    const err = new Error('RUNWAY_API_KEY is missing.');
    err.statusCode = 500;
    throw err;
  }

  const configuredBase = process.env.RUNWAY_API_BASE_URL;
  let normalizedBaseURL;
  if (configuredBase && configuredBase.trim()) {
    // SDK already targets /v1 routes. If /v1 is included in env, it can produce /v1/v1/*.
    normalizedBaseURL = configuredBase.trim().replace(/\/+$/, '').replace(/\/v1$/i, '');
  }

  if (configuredBase && normalizedBaseURL && normalizedBaseURL !== configuredBase.trim()) {
    logWarn('Normalized RUNWAY_API_BASE_URL to avoid duplicated /v1 path', {
      configuredBase,
      normalizedBaseURL,
    });
  }

  return new RunwayML({
    apiKey: process.env.RUNWAY_API_KEY,
    runwayVersion: RUNWAY_API_VERSION,
    baseURL: normalizedBaseURL || undefined,
    timeout: Number(process.env.RUNWAY_SDK_TIMEOUT_MS || 60000),
    maxRetries: Number(process.env.RUNWAY_SDK_MAX_RETRIES || 2),
  });
}

function ensurePrompt(prompt) {
  if (!prompt || !String(prompt).trim()) {
    const err = new Error('Prompt is required.');
    err.statusCode = 400;
    throw err;
  }
  return String(prompt).trim();
}

function coerceOptionalNumber(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function normalizeRatio(value, fallback = '1280:720') {
  if (!value) return fallback;
  const map = {
    '16:9': '1280:720',
    '9:16': '720:1280',
    '4:3': '1104:832',
    '3:4': '832:1104',
    '1:1': '960:960',
  };
  return map[value] || value;
}

function resolveTextModel() {
  if (SUPPORTED_TEXT_MODELS.has(RUNWAY_TEXT_MODEL)) return RUNWAY_TEXT_MODEL;
  logWarn('RUNWAY_TEXT_MODEL is not supported for textToVideo, falling back to gen4.5', {
    configuredModel: RUNWAY_TEXT_MODEL,
  });
  return 'gen4.5';
}

function normalizeTextToVideoParams(model, ratio, duration) {
  let safeRatio = ratio;
  let safeDuration = duration;

  if (model === 'gen4.5') {
    if (!GEN45_ALLOWED_RATIOS.has(safeRatio)) {
      logWarn('Text model gen4.5 only supports 1280:720 or 720:1280. Falling back to 1280:720.', {
        requestedRatio: safeRatio,
      });
      safeRatio = '1280:720';
    }
    if (!Number.isFinite(safeDuration)) safeDuration = 5;
    safeDuration = Math.max(2, Math.min(10, Math.round(safeDuration)));
  }

  if (model === 'veo3') {
    safeDuration = 8;
  }

  return { safeRatio, safeDuration };
}

function getExtensionFromMime(mimeType) {
  const mime = (mimeType || '').toLowerCase().split(';')[0].trim();
  const mimeMap = {
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
    'video/x-msvideo': 'avi',
  };
  return mimeMap[mime] || 'mp4';
}

async function uploadPromptImage(client, file) {
  logInfo('Uploading prompt image to Runway ephemeral storage', {
    filename: file.originalname,
    mimetype: file.mimetype,
    bytes: file.size,
  });
  const uploadable = await toFile(file.buffer, file.originalname || `input-${Date.now()}.png`, {
    type: file.mimetype,
  });
  const upload = await client.uploads.createEphemeral({ file: uploadable });
  logInfo('Prompt image upload complete');
  return upload.uri;
}

async function submitVideoGeneration({ prompt, file, userId, duration, ratio, seed }) {
  const client = getRunwayClient();
  const normalizedPrompt = ensurePrompt(prompt);
  const uuid = uuidv4();
  const normalizedRatio = normalizeRatio(ratio);
  const normalizedSeed = coerceOptionalNumber(seed);
  const normalizedDuration = coerceOptionalNumber(duration);
  logInfo('Submitting Runway video generation task', {
    requestUuid: uuid,
    hasImage: Boolean(file),
    userId: userId || null,
    ratio: normalizedRatio,
    duration: normalizedDuration || null,
    seed: normalizedSeed || null,
  });

  let runwayTask;
  if (file) {
    const promptImageUri = await uploadPromptImage(client, file);
    const payload = {
      model: RUNWAY_IMAGE_MODEL,
      promptText: normalizedPrompt,
      promptImage: [{ uri: promptImageUri, position: 'first' }],
      ratio: normalizedRatio,
      duration: normalizedDuration || undefined,
      seed: normalizedSeed || undefined,
    };
    runwayTask = await client.imageToVideo.create(payload);
    logInfo('Runway image-to-video task created', {
      requestUuid: uuid,
      model: RUNWAY_IMAGE_MODEL,
      runwayTaskId: runwayTask?.id,
    });
  } else {
    const textModel = resolveTextModel();
    const { safeRatio, safeDuration } = normalizeTextToVideoParams(textModel, normalizedRatio, normalizedDuration);
    const payload = {
      model: textModel,
      promptText: normalizedPrompt,
      ratio: safeRatio,
      duration: safeDuration,
      seed: normalizedSeed || undefined,
    };
    runwayTask = await client.textToVideo.create(payload);
    logInfo('Runway text-to-video task created', {
      requestUuid: uuid,
      model: textModel,
      runwayTaskId: runwayTask?.id,
    });
  }

  const runwayTaskId = runwayTask.id || runwayTask.taskId || runwayTask.uuid;
  if (!runwayTaskId) {
    const err = new Error('Runway task id missing in response.');
    err.statusCode = 502;
    throw err;
  }

  taskStore.set(uuid, {
    uuid,
    runwayTaskId,
    prompt: normalizedPrompt,
    userId: userId || null,
    status: 'pending',
    runwayStatus: 'PENDING',
    downloadUrl: null,
    dbId: null,
    error: null,
    finalizing: false,
  });
  logInfo('Runway task stored in local task map', {
    requestUuid: uuid,
    runwayTaskId,
    status: 'pending',
  });

  return { uuid };
}

async function fetchRunwayTask(runwayTaskId) {
  const client = getRunwayClient();
  if (RUNWAY_LOG_VERBOSE) {
    logInfo('Fetching task status from Runway', { runwayTaskId });
  }
  return client.tasks.retrieve(runwayTaskId);
}

function extractVideoUrl(output) {
  if (!output) return null;
  if (typeof output === 'string' && /^https?:\/\//i.test(output)) return output;
  if (Array.isArray(output)) {
    for (const item of output) {
      const url = extractVideoUrl(item);
      if (url) return url;
    }
    return null;
  }
  if (typeof output === 'object') {
    const directKeys = ['url', 'videoUrl', 'downloadUrl'];
    for (const key of directKeys) {
      if (typeof output[key] === 'string' && /^https?:\/\//i.test(output[key])) return output[key];
    }
    for (const value of Object.values(output)) {
      const url = extractVideoUrl(value);
      if (url) return url;
    }
  }
  return null;
}

async function downloadAndPersistVideo({ sourceUrl, prompt, userId }) {
  await fs.promises.mkdir(MEDIA_DIR, { recursive: true });

  const headResponse = await axios.get(sourceUrl, {
    responseType: 'stream',
    timeout: Number(process.env.RUNWAY_DOWNLOAD_TIMEOUT_MS || 120000),
  });
  const mimeType = (headResponse.headers['content-type'] || '').split(';')[0].trim() || 'video/mp4';
  const extension = getExtensionFromMime(mimeType);
  const filename = `runway-video-${Date.now()}-${uuidv4()}.${extension}`;
  const outputPath = path.join(MEDIA_DIR, filename);
  const relativePath = `/images/${filename}`;
  const downloadUrl = BACKEND_URL ? `${BACKEND_URL}${relativePath}` : relativePath;
  logInfo('Downloading generated video from Runway output URL', {
    sourceHost: (() => {
      try {
        return new URL(sourceUrl).host;
      } catch {
        return 'unknown';
      }
    })(),
    outputPath,
  });

  await new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(outputPath);
    headResponse.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
    headResponse.data.on('error', reject);
  });
  logInfo('Video saved locally', { outputPath, relativePath });

  let dbId = null;
  if (SHOULD_SAVE_TO_DB) {
    const saved = await GeneratedImage.create({
      type: 'video',
      imageUrl: relativePath,
      prompt: prompt || 'Runway video generation',
      userId: userId || null,
    });
    dbId = saved?._id || null;
    logInfo('Video metadata persisted to database', { dbId, userId: userId || null });
  }

  return { downloadUrl, dbId, mimeType };
}

async function getVideoStatusByUuid(uuid) {
  const task = taskStore.get(uuid);
  if (!task) {
    const err = new Error('Unknown video UUID');
    err.statusCode = 404;
    throw err;
  }

  if (task.status === 'ready') {
    return {
      statusCode: 200,
      payload: { status: 'ready', downloadUrl: task.downloadUrl, dbId: task.dbId, mimeType: task.mimeType || 'video/mp4' },
    };
  }

  if (task.status === 'error') {
    return { statusCode: 500, payload: { status: 'error', message: task.error || 'Video generation failed' } };
  }

  if (task.finalizing) {
    if (RUNWAY_LOG_VERBOSE) {
      logInfo('Task is finalizing (download/save in progress)', { requestUuid: uuid });
    }
    return { statusCode: 202, payload: { status: 'processing' } };
  }

  const runwayTask = await fetchRunwayTask(task.runwayTaskId);
  const runwayStatus = (runwayTask.status || '').toUpperCase();
  if (task.runwayStatus !== runwayStatus) {
    logInfo('Runway task status transition', {
      requestUuid: uuid,
      runwayTaskId: task.runwayTaskId,
      from: task.runwayStatus || 'UNKNOWN',
      to: runwayStatus,
    });
  }
  taskStore.update(uuid, { runwayStatus });

  if (TERMINAL_FAILED.has(runwayStatus)) {
    taskStore.update(uuid, { status: 'error', error: runwayTask.failure || 'Runway task failed' });
    logWarn('Runway task failed', {
      requestUuid: uuid,
      runwayTaskId: task.runwayTaskId,
      failure: runwayTask.failure || 'Runway task failed',
    });
    return {
      statusCode: 500,
      payload: { status: 'error', message: runwayTask.failure || 'Runway task failed' },
    };
  }

  if (!TERMINAL_SUCCESS.has(runwayStatus)) {
    taskStore.update(uuid, { status: 'pending' });
    return { statusCode: 202, payload: { status: 'pending' } };
  }

  const sourceUrl = extractVideoUrl(runwayTask.output);
  if (!sourceUrl) {
    taskStore.update(uuid, { status: 'error', error: 'Runway task succeeded but no output URL was found.' });
    logError('Runway task succeeded but output URL was missing', {
      requestUuid: uuid,
      runwayTaskId: task.runwayTaskId,
    });
    return {
      statusCode: 500,
      payload: { status: 'error', message: 'Missing video output URL from Runway task' },
    };
  }

  taskStore.update(uuid, { finalizing: true, status: 'processing' });
  try {
    const { downloadUrl, dbId, mimeType } = await downloadAndPersistVideo({
      sourceUrl,
      prompt: task.prompt,
      userId: task.userId,
    });
    taskStore.update(uuid, {
      status: 'ready',
      finalizing: false,
      downloadUrl,
      dbId,
      mimeType,
      sourceUrl,
    });
    logInfo('Runway task completed and finalized', {
      requestUuid: uuid,
      runwayTaskId: task.runwayTaskId,
      downloadUrl,
      dbId,
      mimeType,
    });
    return { statusCode: 200, payload: { status: 'ready', downloadUrl, dbId, mimeType } };
  } catch (error) {
    taskStore.update(uuid, { status: 'error', finalizing: false, error: error.message });
    logError('Failed while finalizing Runway task output', {
      requestUuid: uuid,
      runwayTaskId: task.runwayTaskId,
      error: error.message,
    });
    return { statusCode: 500, payload: { status: 'error', message: 'Failed to download and save video' } };
  }
}

module.exports = {
  submitVideoGeneration,
  getVideoStatusByUuid,
};
