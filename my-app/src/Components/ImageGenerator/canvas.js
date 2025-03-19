import React, { useRef, useState, useEffect } from 'react';

const CanvasInpainting = (props) => {
  const imageCanvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 500, height: 500 });
  const [scaleFactor, setScaleFactor] = useState(1);
  const [brushSize, setBrushSize] = useState(20); // Default brush size

  useEffect(() => {
    if (props.uploadedImage && imageCanvasRef.current && maskCanvasRef.current) {
      const canvas = imageCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;

      const maxWidth = 700;
      const scale = maxWidth / props.uploadedImage.width;
      const newHeight = props.uploadedImage.height * scale;

      setDisplaySize({ width: maxWidth, height: newHeight });
      setScaleFactor(scale);

      canvas.width = props.uploadedImage.width;
      canvas.height = props.uploadedImage.height;
      maskCanvas.width = props.uploadedImage.width;
      maskCanvas.height = props.uploadedImage.height;

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(props.uploadedImage, 0, 0);

      const maskCtx = maskCanvas.getContext('2d');
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      maskCtx.globalCompositeOperation = 'source-over';
    }
  }, [props.uploadedImage]);

  const handleMouseDown = (e) => {
    if (maskCanvasRef.current) {
      setIsDrawing(true);
      const { x, y } = getCanvasCoordinates(e);
      setLastPos({ x, y });
      drawCircle(x, y);
    }
  };

  const handleMouseMove = (e) => {
    if (isDrawing && maskCanvasRef.current) {
      const { x, y } = getCanvasCoordinates(e);
      drawLine(lastPos.x, lastPos.y, x, y);
      setLastPos({ x, y });
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
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
        <label>Brush Size: {brushSize}px</label>
        <input
          type="range"
          min="5"
          max="50"
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
      </div>
      
      <br />
      <button onClick={clearMask} style={{ marginTop: '10px' }}>Clear Mask</button>
      <button onClick={saveCombinedImage} style={{ marginTop: '10px', marginLeft: '10px' }}>Save Image</button>
    </div>
  );
};

export default CanvasInpainting;