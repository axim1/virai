# Legacy 3D Route Notes

This note captures the older 3D generation flow that existed before switching to the TRELLIS RunPod worker.

## Legacy backend route

Primary location before the TRELLIS swap:

- `routes/3d-model-generator.js` on the older branch / earlier revision

Earlier behavior:

1. `POST /api/serverless/generate-3d-model`
   - accepted an uploaded image file via `multer`
   - converted it to base64
   - sent it to the older RunPod endpoint as:
     - `reference_image`
     - `revert_extra`

2. `GET /api/serverless/3d-model-status/:job_id`
   - polled the old RunPod status endpoint
   - expected the model at:
     - `output.files[0].base64`
   - decoded that base64 into a `.glb`
   - saved a local file under `/images/...`
   - returned `glb_base64` back to the frontend

## Legacy frontend expectations

The frontend already expects base64 GLB data:

- [my-app/src/Components/ImageGenerator/ImageGenerator.jsx](/Users/ifratahir/Documents/am/virai/my-app/src/Components/ImageGenerator/ImageGenerator.jsx:126)
- [my-app/src/Components/ImageGenerator/ImageGenerator.jsx](/Users/ifratahir/Documents/am/virai/my-app/src/Components/ImageGenerator/ImageGenerator.jsx:152)

That flow:

1. starts the backend route
2. polls `/api/serverless/3d-model-status/:job_id`
3. waits for `statusRes.data.glb_base64`
4. converts that base64 GLB into a Blob in the browser

## Older server implementation

There is also an older monolithic implementation in:

- [serverlOld-2.js](/Users/ifratahir/Documents/am/virai/serverlOld-2.js:817)

Relevant details from that file:

- it requested 3D model data with `base64_c: true`
- gallery rendering built a data URL like:
  - `data:model/gltf-binary;base64,...`

## Why this matters for TRELLIS

The TRELLIS worker can fit into the existing app shape cleanly because:

- old flow already used base64 GLB transport
- frontend already knows how to consume `glb_base64`
- backend already stores 3D items as `type: '3d_model'`

So the main migration is only:

- old response: `output.files[0].base64`
- new TRELLIS response: `output.glb_base64`
