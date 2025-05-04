import React, { useRef, useState, useEffect } from 'react';
import styles from './ImageGenerator.module.css'

const CanvasInpainting = (props) => {
  const imageCanvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const [targetAspectRatio, setTargetAspectRatio] = useState(null); // e.g., 1 (1:1), 4/3, 16/9
  const previewCanvasRef = useRef(null);
  const [drawMode, setDrawMode] = useState('brush'); // 'brush', 'circle', 'rectangle'
  const [shapeStart, setShapeStart] = useState(null); // For shape drawing
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 500, height: 500 });
  const [scaleFactor, setScaleFactor] = useState(1);
  const [brushSize, setBrushSize] = useState(20); // Default brush size

  useEffect(() => {
    if (!props.uploadedImage || !imageCanvasRef.current || !maskCanvasRef.current || !previewCanvasRef.current) return;
  
    const canvas = imageCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const previewCanvas = previewCanvasRef.current;
  
    const originalWidth = props.uploadedImage.width;
    const originalHeight = props.uploadedImage.height;
  
    // Default to original size
    let paddedWidth = originalWidth;
    let paddedHeight = originalHeight;
  
    // Apply padding for selected aspect ratio
    if (targetAspectRatio) {
      const currentAspect = originalWidth / originalHeight;
      if (currentAspect > targetAspectRatio) {
        paddedHeight = originalWidth / targetAspectRatio;
      } else {
        paddedWidth = originalHeight * targetAspectRatio;
      }
    }
  
    // Update display size to fit within max container bounds
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
  
    // Resize canvases
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
  
    // Prepare mask canvas
    const maskCtx = maskCanvas.getContext('2d');
    maskCtx.clearRect(0, 0, paddedWidth, paddedHeight);
    maskCtx.fillStyle = '#ffffff';
  
    // Mask top/bottom padding
    if (offsetY > 0) {
      maskCtx.fillRect(0, 0, paddedWidth, offsetY);
      maskCtx.fillRect(0, paddedHeight - offsetY, paddedWidth, offsetY);
    }
    // Mask side padding
    if (offsetX > 0) {
      maskCtx.fillRect(0, 0, offsetX, paddedHeight);
      maskCtx.fillRect(paddedWidth - offsetX, 0, offsetX, paddedHeight);
    }
  
    // Clear preview canvas
    const previewCtx = previewCanvas.getContext('2d');
    previewCtx.clearRect(0, 0, paddedWidth, paddedHeight);
  
  }, [props.uploadedImage, targetAspectRatio]);
  

  const handleMouseDown = (e) => {
    const { x, y } = getCanvasCoordinates(e);
    setIsDrawing(true);
    setLastPos({ x, y });
  
    if (drawMode === 'brush') {
      drawCircle(x, y);
    } else {
      setShapeStart({ x, y });
    }
  };
  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const { x, y } = getCanvasCoordinates(e);
  
    if (drawMode === 'brush') {
      drawLine(lastPos.x, lastPos.y, x, y);
      setLastPos({ x, y });
    } else if (shapeStart && previewCanvasRef.current) {
      const ctx = previewCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);
  
      if (drawMode === 'rectangle') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(
          Math.min(shapeStart.x, x),
          Math.min(shapeStart.y, y),
          Math.abs(x - shapeStart.x),
          Math.abs(y - shapeStart.y)
        );
      } else if (drawMode === 'circle') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        const centerX = (shapeStart.x + x) / 2;
        const centerY = (shapeStart.y + y) / 2;
        const radiusX = Math.abs(x - shapeStart.x) / 2;
        const radiusY = Math.abs(y - shapeStart.y) / 2;
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
    
    if (!isDrawing || !shapeStart) {
      setIsDrawing(false);
      return;
    }
  
    const { x, y } = getCanvasCoordinates(e);
    if (drawMode === 'circle') {
      drawEllipse(shapeStart.x, shapeStart.y, x, y);
    } else if (drawMode === 'rectangle') {
      drawRect(shapeStart.x, shapeStart.y, x, y);
    }
  
    setIsDrawing(false);
    setShapeStart(null);
  };
  

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
  

  const getCanvasCoordinates = (e) => {
    const rect = maskCanvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (maskCanvasRef.current.width / rect.width),
      y: (e.clientY - rect.top) * (maskCanvasRef.current.height / rect.height),
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

  const clearMask = () => {
    if (maskCanvasRef.current) {
      const ctx = maskCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
    }
  };

  // This function creates and returns the masked image as a Blob
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
        if (blob) {
          resolve(blob);
        } else {
          reject('Failed to create image blob');
        }
      }, 'image/png');
    });
  };

  // Expose getMaskedImageBlob to parent component via ref
  useEffect(() => {
    if (props.canvasRef) {
      props.canvasRef.current = {
        getMaskedImageBlob,
        clearMask
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
        height: '100%' 
      }}>
      <div style={{ marginTop: '10px' }}>
        <label style={{fontFamily:'Poppins'}}>Brush Size: {brushSize}px</label>
        <input
          type="range"
          min="5"
          max="100"
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
        />
      </div>

      <div
        style={{
          position: 'relative',
          border: '1px solid #ccc',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: displaySize.width,
          height: displaySize.height,
        }}
      >


        <canvas ref={imageCanvasRef} 
          style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%',backgroundColor:'white' }} 
        />
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
    pointerEvents: 'none', // Prevent interaction
  }}
/>
      </div>
      
      <br />
      <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
  <button onClick={clearMask} className={styles.downloadButton}>Clear Mask</button>
  <button onClick={saveCombinedImage} className={styles.downloadButton}>Save Image</button>
  <div  style={{
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