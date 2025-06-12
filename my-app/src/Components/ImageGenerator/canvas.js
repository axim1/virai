import React, { useRef, useState, useEffect } from 'react';
import styles from './ImageGenerator.module.css';

// Import the icons
import tticon1 from '../../assets/vector_icons/crop-01 1.svg';
import tticon2 from '../../assets/vector_icons/edit-01 1.svg';
import tticon3 from '../../assets/vector_icons/resize-01 1.svg';
import tticon4 from '../../assets/vector_icons/share-01 1.svg';
import tticon5 from '../../assets/vector_icons/download-01 1.svg';
import tticon6 from '../../assets/vector_icons/delete-01 1.svg';

const CanvasInpainting = (props) => {
  const imageCanvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [targetAspectRatio, setTargetAspectRatio] = useState(null);
  const [drawMode, setDrawMode] = useState('brush');
  const [shapeStart, setShapeStart] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 }); // ✅ Track latest position
  const [displaySize, setDisplaySize] = useState({ width: 500, height: 500 });
  const [scaleFactor, setScaleFactor] = useState(1);
  const [brushSize, setBrushSize] = useState(20);

  // Array of toolbar icons
  const tticons = [tticon1, tticon2, tticon3, tticon4, tticon5, tticon6];

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
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
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
    setCurrentPos(coords); // ✅ Set initial position

    if (drawMode === 'brush') {
      drawCircle(coords.x, coords.y);
    } else {
      setShapeStart(coords);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const coords = getCanvasCoordinates(e);
    setCurrentPos(coords); // ✅ Continuously track current position

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

  const handleMouseUp = () => {
    if (previewCanvasRef.current) {
      previewCanvasRef.current.getContext('2d').clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);
    }

    if (!isDrawing) return;

    if (drawMode !== 'brush' && shapeStart) {
      if (drawMode === 'circle') {
        drawEllipse(shapeStart.x, shapeStart.y, currentPos.x, currentPos.y); // ✅ Use currentPos
      } else if (drawMode === 'rectangle') {
        drawRect(shapeStart.x, shapeStart.y, currentPos.x, currentPos.y);
      }
    }

    setIsDrawing(false);
    setShapeStart(null);
  };

  // Touch support
  useEffect(() => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e) => {
      e.preventDefault();
      handleMouseDown(e);
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      handleMouseMove(e);
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      handleMouseUp();
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDrawing, drawMode, shapeStart, currentPos]);

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
    const ctx = maskCanvasRef.current?.getContext('2d');
    ctx?.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
  };

  const getMaskedImageBlob = () => {
    return new Promise((resolve, reject) => {
      const imageCanvas = imageCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      if (!imageCanvas || !maskCanvas) {
        reject('Canvas not available');
        return;
      }

      const width = imageCanvas.width;
      const height = imageCanvas.height;

      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = width;
      finalCanvas.height = height;
      const finalCtx = finalCanvas.getContext('2d');

      finalCtx.drawImage(imageCanvas, 0, 0);

      const finalImageData = finalCtx.getImageData(0, 0, width, height);
      const finalData = finalImageData.data;

      const maskCtx = maskCanvas.getContext('2d');
      const maskData = maskCtx.getImageData(0, 0, width, height).data;

      for (let i = 0; i < maskData.length; i += 4) {
        if (maskData[i] === 255 && maskData[i + 1] === 255 && maskData[i + 2] === 255 && maskData[i + 3] > 0) {
          finalData[i + 3] = 0; // make transparent
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
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      flexDirection: 'column', 
      width: '100%', 
      height: '100%',
      fontFamily: 'Poppins',
      padding: '20px'
    }}>
      {/* Controls Container */}
      <div style={{ 
        width: '100%',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        {/* Brush Size Control */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '8px'
        }}>
          <label style={{ 
            color: '#FFF',
            fontSize: '14px',
            fontWeight: '400'
          }}>
            Brush Size: {brushSize}px
          </label>
          <input 
            type="range" 
            min="5" 
            max="100" 
            value={brushSize} 
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            style={{
              width: '100%',
              maxWidth: '300px',
              accentColor: '#2E8B57'
            }}
          />
        </div>

        {/* Drawing Mode Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <label style={{ 
            color: '#FFF',
            fontSize: '14px',
            fontWeight: '400'
          }}>
            Mode:
          </label>
          <select 
            value={drawMode} 
            onChange={(e) => setDrawMode(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '7px',
              border: '1px solid #2E8B57',
              backgroundColor: 'rgba(46, 139, 87, 0.1)',
              color: '#FFF',
              fontFamily: 'Poppins',
              fontSize: '14px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="brush">Brush</option>
            <option value="circle">Circle</option>
            <option value="rectangle">Rectangle</option>
          </select>
        </div>
      </div>

      {/* Canvas Container */}
      <div style={{
        position: 'relative',
        border: '1px solid rgba(46, 139, 87, 0.3)',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: displaySize.width,
        height: displaySize.height,
        touchAction: 'none',
        backgroundColor: 'rgba(46, 139, 87, 0.05)'
      }}>
        <canvas 
          ref={imageCanvasRef} 
          style={{ 
            position: 'absolute', 
            left: 0, 
            top: 0, 
            width: '100%', 
            height: '100%', 
            backgroundColor: 'white',
            borderRadius: '8px'
          }} 
        />
        <canvas 
          ref={maskCanvasRef}
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
            borderRadius: '8px'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        <canvas 
          ref={previewCanvasRef}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            pointerEvents: 'none',
            background: 'transparent',
            width: '100%',
            height: '100%',
            touchAction: 'none',
            borderRadius: '8px'
          }}
        />
      </div>
    </div>
  );
};

export default CanvasInpainting;
