import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ImageGenerator.module.css';
import { useNavigate } from "react-router-dom";

const apiUrl = process.env.REACT_APP_API_URL;
const username = JSON.parse(localStorage.getItem('user')) || {};
const userId = username._id;

function ImageGenerator({ onGenerateImage }) {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading2, setIsLoading2] = useState(false);

  const [apiType, setApiType] = useState('sketch-to-image');
  const [generatorType, setGeneratorType] = useState('');
  const [promptText, setPromptText] = useState('');
  const [negativePromptText, setNegativePromptText] = useState('');
  const [styleType, setStyleType] = useState('default');
  const [aspectRatio, setAspectRatio] = useState('');
  const [scale, setScale] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(false);
  const [strength, setStrength] = useState(0.75);
  const [imageWidth, setImageWidth] = useState(512);
  const [imageHeight, setImageHeight] = useState(512);
  const [modelXl, setModelXl] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchImages = async () => {
      setIsLoading2(true);
      try {
        const response = await axios.get(`${apiUrl}topimages/${userId}`);
        setImages(response.data.images.reverse());
      } catch (error) {
        console.error('Error fetching images:', error);
      }
      setIsLoading2(false);
    };

    fetchImages();
  }, [userId]);

  const handleGenerateClick = async () => {
    setFormSubmitted(true);
    setIsLoading(true);

    if (!isFormValid) {
      setIsLoading(false);
      return;
    }
    if (!userId) {
      navigate('/login');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('generatorType', generatorType);
      formData.append('prompt', promptText);
      formData.append('negativePromptText', negativePromptText);
      formData.append('styleType', styleType);
      formData.append('aspectRatio', aspectRatio);
      formData.append('scale', scale);
      formData.append('userId', userId);
      formData.append('width', imageWidth);
      formData.append('height', imageHeight);
      formData.append('maintainAspectRatio', maintainAspectRatio.toString());
      formData.append('model_xl', modelXl.toString());

      if (apiType === 'sketch-to-image' && uploadedImage) {
        formData.append('sketch_image', uploadedImage);
        formData.append('sketch_image_uuid', 1234);
        formData.append('strength', strength);
      } else if (uploadedImage) {
        formData.append('image', uploadedImage); // Handle image upload for other types
      }

      const response = await axios.post(`${apiUrl}${apiType}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const imageUrls = Array.isArray(response.data.imageUrls) ? response.data.imageUrls : [response.data.imageUrls];
      setGeneratedImages(imageUrls);
      onGenerateImage(imageUrls);
    } catch (error) {
      console.error('Error generating image:', error);
    }
    setIsLoading(false);
  };

  const handlePromptEnhancer = async () => {
    try {
      const formData = new FormData();
      formData.append('prompt', promptText);
      formData.append('userId', userId);

      const response = await axios.post(`${apiUrl}prompt-enhancer`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { uuid } = response.data;

      const pollImageStatus = async (uuid) => {
        try {
          const statusResponse = await axios.get(`${apiUrl}check-text-status/${userId}/${uuid}`);
          if (statusResponse.status === 200 && statusResponse.data.en_prompt) {
            setPromptText(statusResponse.data.en_prompt);
          } else {
            setTimeout(() => pollImageStatus(uuid), 1000);
          }
        } catch (pollingError) {
          console.error('Error polling image status:', pollingError);
          setIsLoading(false);
        }
      };

      pollImageStatus(uuid);
    } catch (error) {
      console.error('Error generating text:', error);
    }
  };

  const handleImageUpload = (event) => {
    setUploadedImage(event.target.files[0]);
  };

  const downloadImage = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  const openPreview = (image) => {
    setSelectedImage(image);
  };

  const closePreview = () => {
    setSelectedImage(null);
  };

  const handleTextChange = (label, value) => {
    switch (label) {
      case 'Text for prompts':
        setPromptText(value);
        break;
      case 'Text for negative prompts':
        setNegativePromptText(value);
        break;
      default:
        break;
    }
  };

  const handleWidthChange = (event) => {
    setImageWidth(Number(event.target.value) || 0);
  };

  const handleHeightChange = (event) => {
    setImageHeight(Number(event.target.value) || 0);
  };

  const handleApiTypeChange = (event) => {
    setApiType(event.target.value);
    setUploadedImage(null);
  };

  const handleStyleTypeChange = (style) => {
    setStyleType(style);
  };

  const handleAspectRatioChange = (event) => {
    setAspectRatio(event.target.value);
  };

  const toggleAdvancedOptions = () => {
    setShowAdvancedOptions(!showAdvancedOptions);
  };

  const isFormValid = promptText.trim() !== '' || apiType === 'sketch-to-image';

  return (
    <div className={styles.generatorContainer}>
      <div className={styles.inputRow}>
        <div className={styles.inputColumn}>
          <label className={styles.label}>Prompt</label>
          <input
            type="text"
            placeholder="Describe what you want or hit a tag below"
            className={styles.inputField}
            value={promptText}
            onChange={(e) => handleTextChange('Text for prompts', e.target.value)}
          />
          <button className={styles.magicButton} onClick={handlePromptEnhancer} style={{ width: "100%", marginTop: '5px' }}>
            MAGIC
          </button>
        </div>
        <div className={styles.inputColumn}>
          <label className={styles.label}>Select</label>
          <select className={styles.select} value={apiType} onChange={handleApiTypeChange}>
            <option value="sketch-to-image">Sketch to Image</option>
            <option value="text-to-image">Text to Image</option>
          </select>
          <button className={styles.advancedButton} onClick={toggleAdvancedOptions}>⚙️</button>
          {showAdvancedOptions && (
            <div className={styles.advancedOptions}>
              {/* <label className={styles.advancedLabel}>Guidance scale:</label>
              <input
                type="number"
                min="1"
                max="20"
                step="0.1"
                className={styles.advancedInput}
                value={scale}
                onChange={(e) => setScale(e.target.value)}
              /> */}
              <label className={styles.advancedLabel}>Strength:</label>
              <input
                type="number"
                min="1"
                max="100"
                step="1"
                className={styles.advancedInput}
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
              />
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={maintainAspectRatio}
                  onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                />
                Maintain Aspect Ratio
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={modelXl}
                  onChange={(e) => setModelXl(e.target.checked)}
                />
                Model XL
              </label>
            </div>
          )}
        </div>
      </div>

      <div className={styles.inputRow}>
        <div className={styles.inputColumn}>
          <label className={styles.label}>Negative prompt (optional)</label>
          <input
            type="text"
            placeholder="Items you don't want in the image"
            className={styles.inputField}
            value={negativePromptText}
            onChange={(e) => handleTextChange('Text for negative prompts', e.target.value)}
          />
        </div>
        <div className={styles.inputColumn}>
          <label className={styles.label}>Size (px)</label>
          <div className={styles.sizeInputRow}>
            <input
              type="number"
              placeholder="Width"
              className={styles.inputField}
              value={imageWidth}
              onChange={handleWidthChange}
            />
            <span className={styles.sizeSeparator}>x</span>
            <input
              type="number"
              placeholder="Height"
              className={styles.inputField}
              value={imageHeight}
              onChange={handleHeightChange}
            />
          </div>
        </div>
      </div>

      <div className={styles.inputRow}>
        <div className={styles.inputColumn}>
          <label className={styles.label}>Upload Image</label>
          <input
            type="file"
            className={styles.inputField}
            onChange={handleImageUpload}
          />
        </div>
      </div>

      <div className={styles.tagContainer}>
  <span className={`${styles.tag} ${styleType === 'default' ? styles.selectedTag : ''}`} onClick={() => handleStyleTypeChange('default')}>Default</span>
  <span className={`${styles.tag} ${styleType === 'architecture_drawing' ? styles.selectedTag : ''}`} onClick={() => handleStyleTypeChange('architecture_drawing')}>Architecture Drawing</span>
  <span className={`${styles.tag} ${styleType === 'exterior_fantasy' ? styles.selectedTag : ''}`} onClick={() => handleStyleTypeChange('exterior_fantasy')}>Exterior Fantasy</span>
  <span className={`${styles.tag} ${styleType === 'exterior_modern' ? styles.selectedTag : ''}`} onClick={() => handleStyleTypeChange('exterior_modern')}>Exterior Modern</span>
  <span className={`${styles.tag} ${styleType === 'garden' ? styles.selectedTag : ''}`} onClick={() => handleStyleTypeChange('garden')}>Garden</span>
  <span className={`${styles.tag} ${styleType === 'floor_plan' ? styles.selectedTag : ''}`} onClick={() => handleStyleTypeChange('floor_plan')}>Floor Plan</span>
  <span className={`${styles.tag} ${styleType === 'interior_cosy' ? styles.selectedTag : ''}`} onClick={() => handleStyleTypeChange('interior_cosy')}>Interior Cosy</span>
  <span className={`${styles.tag} ${styleType === 'interior_modern' ? styles.selectedTag : ''}`} onClick={() => handleStyleTypeChange('interior_modern')}>Interior Modern</span>
  <span className={`${styles.tag} ${styleType === 'interior_painted' ? styles.selectedTag : ''}`} onClick={() => handleStyleTypeChange('interior_painted')}>Interior Painted</span>
  <span className={`${styles.tag} ${styleType === 'marker_sketch' ? styles.selectedTag : ''}`} onClick={() => handleStyleTypeChange('marker_sketch')}>Marker Sketch</span>
  <span className={`${styles.tag} ${styleType === 'technical_drawing' ? styles.selectedTag : ''}`} onClick={() => handleStyleTypeChange('technical_drawing')}>Technical Drawing</span>
</div>


      <div className={styles.buttonRow}>
        <button className={styles.generateButton} onClick={handleGenerateClick} disabled={isLoading || !isFormValid}>
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      <div className={styles.limitInfo}>
        Limits per hour: 80 images for all visitors and up to 2 requests from a single visitor. Used: 0 images, 0 requests.
      </div>

      {generatedImages.length > 0 && (
        <div className={styles.generatedImagesContainer}>
          <h2>Generated Images</h2>
          {generatedImages.map((imageUrl, index) => (
            imageUrl.includes('data:image') ? (
              <img
                key={index}
                className={styles.generatedImage}
                src={imageUrl}
                alt={`Generated Image ${index + 1}`}
              />
            ) : (
              <p key={index}>Image not found or invalid.</p>
            )
          ))}
        </div>
      )}
{/* 
      <div className={styles.imageLibraryContainer}>
        {isLoading2 ? (
          <div className={styles.loadingIndicator}>Loading...</div>
        ) : (
          <div className={styles.imageGrid}>
            {images.map((image, index) => (
              <div className={styles.imageItem} key={index}>
                <img
                  src={image}
                  alt={`Generated Image ${index}`}
                  onClick={() => openPreview(image)}
                />
                <div className={styles.imageOverlay}>
                  <button
                    className={styles.downloadButton}
                    onClick={() => downloadImage(image, `Generated_Image_${index}.jpeg`)}
                  >
                    Download
                  </button>
                  <button
                    className={styles.previewButton}
                    onClick={() => openPreview(image)}
                  >
                    Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {selectedImage && (
          <div className={styles.previewModal} onClick={closePreview}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <span className={styles.close} onClick={closePreview}>&times;</span>
              <img src={selectedImage} alt="Preview" />
            </div>
          </div>
        )}
      </div> */}
    </div>
  );
}

export default ImageGenerator;
