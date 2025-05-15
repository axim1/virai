import React, { useRef, useState, useEffect } from 'react';
import styles from './ImageGenerator.module.css';

const CanvasInpainting = (props) => {
  const imageCanvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [targetAspectRatio, setTargetAspectRatio] = useState(null);
  const [drawMode, setDrawMode] = useState('brush');
  const [shapeStart, setShapeStart] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 500, height: 500 });
  const [scaleFactor, setScaleFactor] = useState(1);
  const [brushSize, setBrushSize] = useState(20);

  useEffect(() => {
    if (!props.uploadedImage || !imageCanvasRef.current || !maskCanvasRef.current || !previewCanvasRef.current) return;

    const canvas = imageCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const previewCanvas = previewCanvasRef.current;

    const originalWidth = props.uploadedImage.width;
    const originalHeight = props.uploadedImage.height;

    let paddedWidth = originalWidth;
    let paddedHeight = originalHeight;

    if (targetAspectRatio) {
      const currentAspect = originalWidth / originalHeight;
      if (currentAspect > targetAspectRatio) {
        paddedHeight = originalWidth / targetAspectRatio;
      } else {
        paddedWidth = originalHeight * targetAspectRatio;
      }
    }

    const maxWidth = 700;
    const maxHeight = 500;
    const paddedAspect = paddedWidth / paddedHeight;

    let displayWidth = maxWidth;
    let displayHeight = displayWidth / paddedAspect;
    if (displayHeight > maxHeight) {
      displayHeight = maxHeight;
      displayWidth = displayHeight * paddedAspect;
    }

    setDisplaySize({ width: displayWidth, height: displayHeight });
    setScaleFactor(displayWidth / paddedWidth);

    canvas.width = paddedWidth;
    canvas.height = paddedHeight;
    maskCanvas.width = paddedWidth;
    maskCanvas.height = paddedHeight;
    previewCanvas.width = paddedWidth;
    previewCanvas.height = paddedHeight;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, paddedWidth, paddedHeight);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, paddedWidth, paddedHeight);

    const offsetX = (paddedWidth - originalWidth) / 2;
    const offsetY = (paddedHeight - originalHeight) / 2;

    ctx.drawImage(props.uploadedImage, offsetX, offsetY);

    const maskCtx = maskCanvas.getContext('2d');
    maskCtx.clearRect(0, 0, paddedWidth, paddedHeight);
    maskCtx.fillStyle = '#ffffff';

    if (offsetY > 0) {
      maskCtx.fillRect(0, 0, paddedWidth, offsetY);
      maskCtx.fillRect(0, paddedHeight - offsetY, paddedWidth, offsetY);
    }
    if (offsetX > 0) {
      maskCtx.fillRect(0, 0, offsetX, paddedHeight);
      maskCtx.fillRect(paddedWidth - offsetX, 0, offsetX, paddedHeight);
    }

    const previewCtx = previewCanvas.getContext('2d');
    previewCtx.clearRect(0, 0, paddedWidth, paddedHeight);
  }, [props.uploadedImage, targetAspectRatio]);

  const getCanvasCoordinates = (e) => {
    const rect = maskCanvasRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    return {
      x: (clientX - rect.left) * (maskCanvasRef.current.width / rect.width),
      y: (clientY - rect.top) * (maskCanvasRef.current.height / rect.height),
    };
  };

  const drawCircle = (x, y) => {
    const ctx = maskCanvasRef.current.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawLine = (x1, y1, x2, y2) => {
    const ctx = maskCanvasRef.current.getContext('2d');
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  const handleMouseDown = (e) => {
    const coords = getCanvasCoordinates(e);
    setIsDrawing(true);
    setLastPos(coords);

    if (drawMode === 'brush') {
      drawCircle(coords.x, coords.y);
    } else {
      setShapeStart(coords);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const coords = getCanvasCoordinates(e);

    if (drawMode === 'brush') {
      drawLine(lastPos.x, lastPos.y, coords.x, coords.y);
      setLastPos(coords);
    } else if (shapeStart && previewCanvasRef.current) {
      const ctx = previewCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);

      if (drawMode === 'rectangle') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(
          Math.min(shapeStart.x, coords.x),
          Math.min(shapeStart.y, coords.y),
          Math.abs(coords.x - shapeStart.x),
          Math.abs(coords.y - shapeStart.y)
        );
      } else if (drawMode === 'circle') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        const centerX = (shapeStart.x + coords.x) / 2;
        const centerY = (shapeStart.y + coords.y) / 2;
        const radiusX = Math.abs(coords.x - shapeStart.x) / 2;
        const radiusY = Math.abs(coords.y - shapeStart.y) / 2;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  };

  const handleMouseUp = (e) => {
    if (previewCanvasRef.current) {
      previewCanvasRef.current.getContext('2d').clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);
    }

    if (!isDrawing) return;

    if (drawMode !== 'brush' && shapeStart) {
      // For touch events ending, use lastPos since e might not have coordinates
      const endPos = e && e.touches ? lastPos : getCanvasCoordinates(e);

      if (drawMode === 'circle') {
        drawEllipse(shapeStart.x, shapeStart.y, endPos.x, endPos.y);
      } else if (drawMode === 'rectangle') {
        drawRect(shapeStart.x, shapeStart.y, endPos.x, endPos.y);
      }
    }

    setIsDrawing(false);
    setShapeStart(null);
  };

  // Improved touch handling
  useEffect(() => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e) => {
      e.preventDefault();
      handleMouseDown(e);
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      if (isDrawing) {
        handleMouseMove(e);
      }
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      // Pass the last known position for shapes
      const finalEvent = {...e};
      if (!finalEvent.clientX && lastPos) {
        // Create a synthetic event with the last known position
        finalEvent.clientX = lastPos.x;
        finalEvent.clientY = lastPos.y;
      }
      handleMouseUp(finalEvent);
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDrawing, drawMode, lastPos, shapeStart, brushSize]); // Added dependencies

  const drawEllipse = (x1, y1, x2, y2) => {
    const ctx = maskCanvasRef.current.getContext('2d');
    ctx.fillStyle = '#ffffff';
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    const radiusX = Math.abs(x2 - x1) / 2;
    const radiusY = Math.abs(y2 - y1) / 2;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.fill();
  };

  const drawRect = (x1, y1, x2, y2) => {
    const ctx = maskCanvasRef.current.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(
      Math.min(x1, x2),
      Math.min(y1, y2),
      Math.abs(x2 - x1),
      Math.abs(y2 - y1)
    );
  };

  const clearMask = () => {
    if (maskCanvasRef.current) {
      const ctx = maskCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
    }
  };

  const getMaskedImageBlob = () => {
    return new Promise((resolve, reject) => {
      if (!imageCanvasRef.current || !maskCanvasRef.current) {
        reject('Canvas not available');
        return;
      }

      const width = imageCanvasRef.current.width;
      const height = imageCanvasRef.current.height;

      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = width;
      finalCanvas.height = height;
      const finalCtx = finalCanvas.getContext('2d');

      finalCtx.drawImage(imageCanvasRef.current, 0, 0);

      const finalImageData = finalCtx.getImageData(0, 0, width, height);
      const finalData = finalImageData.data;

      const maskCtx = maskCanvasRef.current.getContext('2d');
      const maskImageData = maskCtx.getImageData(0, 0, width, height);
      const maskData = maskImageData.data;

      for (let i = 0; i < maskData.length; i += 4) {
        if (maskData[i] === 255 && maskData[i + 1] === 255 && maskData[i + 2] === 255 && maskData[i + 3] > 0) {
          finalData[i + 3] = 0;
        }
      }

      finalCtx.putImageData(finalImageData, 0, 0);

      finalCanvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject('Failed to create image blob');
      }, 'image/png');
    });
  };

  useEffect(() => {
    if (props.canvasRef) {
      props.canvasRef.current = {
        getMaskedImageBlob,
        clearMask,
      };
    }
  }, [props.canvasRef]);

  const saveCombinedImage = () => {
    getMaskedImageBlob()
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'masked_image.png';
        link.click();
        URL.revokeObjectURL(url);
      })
      .catch(error => console.error('Error saving image:', error));
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', width: '100%', height: '100%' }}>
      <div style={{ marginTop: '10px' }}>
        <label style={{ fontFamily: 'Poppins' }}>Brush Size: {brushSize}px</label>
        <input type="range" min="5" max="100" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} />
      </div>

      <div style={{
        position: 'relative',
        border: '1px solid #ccc',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: displaySize.width,
        height: displaySize.height,
        touchAction: 'none', // Prevents browser handling of touch events
      }}>
        <canvas ref={imageCanvasRef} style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', backgroundColor: 'white' }} />
        <canvas ref={maskCanvasRef}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            cursor: 'crosshair',
            opacity: 0.7,
            background: 'transparent',
            width: '100%',
            height: '100%',
            touchAction: 'none',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        <canvas ref={previewCanvasRef}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            cursor: 'crosshair',
            background: 'transparent',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            touchAction: 'none',
          }}
        />
      </div>

      <br />
      <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
        <button onClick={clearMask} className={styles.downloadButton}>Clear Mask</button>
        <button onClick={saveCombinedImage} className={styles.downloadButton}>Save Image</button>
        <div style={{
          marginTop: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontFamily: 'Poppins',
          fontSize: '14px'
        }}>
          <label style={{ fontFamily: 'Poppins' }}>Mode:</label>
          <select style={{
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            backgroundColor: '#f9f9f9',
            fontFamily: 'Poppins',
            fontSize: '14px',
            cursor: 'pointer'
          }} value={drawMode} onChange={(e) => setDrawMode(e.target.value)}>
            <option value="brush">Brush</option>
            <option value="circle">Circle</option>
            <option value="rectangle">Rectangle</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default CanvasInpainting;