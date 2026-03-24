const { submitVideoGeneration, getVideoStatusByUuid } = require('../services/runwayService');

function toClientError(error) {
  if (error?.statusCode) return error.statusCode;
  if (error?.name === 'MulterError') return 400;
  if (error?.response?.status && error.response.status < 500) return 502;
  return 500;
}

function toClientMessage(error) {
  if (error?.name === 'MulterError') return error.message;
  if (error?.statusCode && error.message) return error.message;
  if (typeof error?.response?.data === 'string') {
    return `Runway API error (${error.response.status || 'unknown'}): ${error.response.data}`;
  }
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  return 'Runway request failed';
}

async function generateVideo(req, res) {
  try {
    console.log('[runway.controller] generate-video request received', {
      hasImage: Boolean(req.file),
      userId: req.body.userId || null,
      ratio: req.body.ratio || req.body.aspectRatio || null,
      duration: req.body.duration || null,
    });
    const result = await submitVideoGeneration({
      prompt: req.body.prompt,
      file: req.file,
      userId: req.body.userId,
      duration: req.body.duration,
      ratio: req.body.ratio || req.body.aspectRatio,
      seed: req.body.seed,
    });
    console.log('[runway.controller] generate-video accepted', { uuid: result.uuid });
    return res.status(202).json(result);
  } catch (error) {
    console.error('[runway.generateVideo] error:', error.response?.data || error.message);
    return res.status(toClientError(error)).json({
      message: toClientMessage(error),
    });
  }
}

async function checkVideo(req, res) {
  try {
    const { uuid } = req.params;
    if (!uuid) {
      return res.status(400).json({ message: 'uuid is required' });
    }
    const { statusCode, payload } = await getVideoStatusByUuid(uuid);
    if (statusCode !== 202) {
      console.log('[runway.controller] check-video terminal response', {
        uuid,
        statusCode,
        status: payload?.status || null,
      });
    }
    return res.status(statusCode).json(payload);
  } catch (error) {
    console.error('[runway.checkVideo] error:', error.response?.data || error.message);
    return res.status(toClientError(error)).json({
      message: toClientMessage(error),
      status: 'error',
    });
  }
}

module.exports = {
  generateVideo,
  checkVideo,
};
