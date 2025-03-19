import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './ImageGenerator.module.css';
import { useNavigate, useLocation } from "react-router-dom";
import DropdownPortal from './DropdownPortal.js';
import CanvasInpainting from './canvas.js';
  
const apiUrl = process.env.REACT_APP_API_URL;
const username = JSON.parse(localStorage.getItem('user')) || {};
const userId = username._id;

function ImageGenerator({ onGenerateImage }) {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialApiType = queryParams.get("apiType") || "sketch-to-image"; 
  const [apiType, setApiType] = useState(initialApiType);
  const canvasRef = useRef(null); // Ref to access canvas methods

  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [generatorType, setGeneratorType] = useState('');
  const [promptText, setPromptText] = useState('');
  const [negativePromptText, setNegativePromptText] = useState('');
  const [styleType, setStyleType] = useState('default');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [scale, setScale] = useState(7);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageWidth, setImageWidth] = useState(512);
  const [imageHeight, setImageHeight] = useState(512);
  const [strength, setStrength] = useState(0.75);
  const [moreDropdownOpen, setmoreDropdownOpen] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const numberOfImages = [1, 2, 3, 4, 5, 6]; // Array of numbers

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  
  const [dropdownTop, setDropdownTop] = useState(0);
  const [dropdownLeft, setDropdownLeft] = useState(0);

  const dropdownRef = useRef(null);
  useEffect(() => {
    if (moreDropdownOpen && dropdownRef.current) {
      const buttonRect = dropdownRef.current.getBoundingClientRect();
      const dropdownHeight = 210;
      const dropdownWidth = 150;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let topPosition = buttonRect.top-80;
      let leftPosition = buttonRect.right;

      if (buttonRect.bottom + dropdownHeight > viewportHeight) {
        topPosition = buttonRect.top - dropdownHeight;
      }
      if (buttonRect.right + dropdownWidth > viewportWidth) {
        leftPosition = buttonRect.left - dropdownWidth;
      }

      setDropdownTop(topPosition);
      setDropdownLeft(leftPosition);
    }
  }, [moreDropdownOpen]);

  useEffect(() => {
    if (!userId) return;

    const fetchImages = async () => {
      try {
        const response = await axios.get(`${apiUrl}topimages/${userId}`);
        setImages(response.data.images.reverse());
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, [userId]);

  const handleGenerateClick = async () => {
    setIsLoading(true);
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
      formData.append('strength', strength);

      // Handle different image sources based on API type
      if (apiType === 'inpainting' && canvasRef.current) {
        try {
          // Get the masked image blob from the canvas component
          const maskedImageBlob = await canvasRef.current.getMaskedImageBlob();
          
          // Add the masked image to formData with the correct field name
          formData.append('image', maskedImageBlob, 'masked_image.png');
        } catch (error) {
          console.error('Error getting masked image:', error);
          setIsLoading(false);
          return;
        }
      } else if (apiType === 'sketch-to-image' && uploadedImage) {
        formData.append('sketch_image', uploadedImage);
      } else if (uploadedImage) {
        formData.append('image', uploadedImage);
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

  const handleApiTypeChange = (value) => {
    setApiType(value);
    setUploadedImage(null);
    setDropdownOpen(false);
  };

  const handleStyleTypeChange = (style) => {
    setStyleType(style);
  };

  const handleAspectRatioChange = (event) => {
    setAspectRatio(event.target.value);
  };

  const handleImageUpload = (event) => {
    if (apiType === 'inpainting') {
      const file = event.target.files[0];
      if (file) {
        const img = new Image();
        img.onload = () => {
          setUploadedImage(img); // Set the fully loaded image
        };
        img.src = URL.createObjectURL(file); // Convert to a URL
      }
    } else {
      setUploadedImage(event.target.files[0]);
    }
  };
  
  const formatApiType = (apiType) => {
    return apiType
      .split('-')
      .map((word, index) => 
        index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word
      )
      .join(' ');
  }

  return (
    <>
      <div className={styles.generatorContainer}>
        <div className={styles.topInputContainer}>
          <div className={styles.customDropdown}>
            <div className={styles.dropdownHeader} onClick={toggleDropdown}>
              <div className={styles.icon}>
                <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </div>
              {formatApiType(apiType)} 
              <span className={styles.dropdownIcon}>   </span>
            </div>
            {dropdownOpen && (
              <div className={styles.dropdownList}>
                <div
                  className={`${styles.dropdownItem} ${apiType === 'text-to-image' ? styles.activeItem : ''}`}
                  onClick={() => handleApiTypeChange('text-to-image')}
                >
                  Text to Image
                </div>
                <div
                  className={`${styles.dropdownItem} ${apiType === 'inpainting' ? styles.activeItem : ''}`}
                  onClick={() => handleApiTypeChange('inpainting')}
                >
                  Inpainting
                </div>
                <div
                  className={`${styles.dropdownItem} ${apiType === 'sketch-to-image' ? styles.activeItem : ''}`}
                  onClick={() => handleApiTypeChange('sketch-to-image')}
                >
                  Sketch to Image
                </div>
              </div>
            )}
          </div>


          <div className={styles.inputContainer}>
            {apiType === 'sketch-to-image' &&
              <div className={styles.inputRow}>
                <div className={styles.inputColumn}>
                  <p className={styles.label}>Upload Image</p>
                  <label className={styles.uploadLabel}>
                    <input
                      type="file"
                      className={styles.uploadInput}
                      onChange={handleImageUpload}
                    />
                    <span className={styles.uploadPlaceholder}>UPLOAD IMAGE</span>
                  </label>
                </div>
              </div>
            }

            {apiType === 'inpainting' &&
              <div className={styles.inputRow}>
                <div className={styles.inputColumn}>
                  <p className={styles.label}>Upload Image</p>
                  <label className={styles.uploadLabel}>
                    <input
                      type="file"
                      className={styles.uploadInput}
                      onChange={handleImageUpload}
                    />
                    <span className={styles.uploadPlaceholder}>UPLOAD INPAINTING IMAGE</span>
                  </label>
                </div>
              </div>
            }

            {/* Prompt input */}
            <div className={styles.inputRow}>
              <div className={styles.inputColumn}>
                <div className={styles.promptLabel}>              
                  <p className={styles.label} style={{ margin: '0px' }}>Prompt</p>
                  <button className={styles.magicButton}>
                    Magic Prompt
                  </button>
                </div>

                <textarea
                  className={styles.inputField}
                  value={promptText}
                  style={{
                    height: "50px", 
                    resize: "none",
                  }}
                  onChange={(e) => setPromptText(e.target.value)}
                  onInput={(e) => {
                    e.target.style.height = "auto"; 
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  placeholder="Describe your image or hit the Magic button..."
                />
              </div>
            </div>

            {/* Negative prompt */}
            <div className={styles.inputRow}>
              <div className={styles.inputColumn}>
                <p className={styles.label}>Negative Prompt</p>
                <textarea
                  className={styles.inputField}
                  value={negativePromptText}
                  style={{
                    height: "50px", 
                    resize: "none",
                  }}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  onChange={(e) => setNegativePromptText(e.target.value)}
                  placeholder='Add negative prompts, e.g. "blurry image"'
                />
              </div>
            </div>

            {/* image number */}
            <div className={styles.numButtonCont}>
              <p className={styles.label} style={{ margin: '0px' }}>Images Number</p>
              <div className={styles.numberButtons}>
                {numberOfImages.map((number) => (
                  <button
                    key={number}
                    className={`${styles.numButton} ${images === number ? styles.activeButton : ''}`}
                    onClick={() => setImages(number)}
                  >
                    {number}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Aspect Ratio */}
            {apiType !== 'inpainting' &&
            <div className={styles.inputRow}>
              <div className={styles.inputColumn}>
                <p className={styles.label}>Aspect Ratio</p>
                <div className={styles.aspectRatioButtons}>
                  <button
                    className={`${styles.aspectButton} ${aspectRatio === '16:9' ? styles.activeButton : ''}`}
                    onClick={() => setAspectRatio('16:9')}
                    style={{ height: 'calc(70px / (16 / 9))' }}
                  >
                    16:9
                  </button>
                  <button
                    className={`${styles.aspectButton} ${aspectRatio === '3:2' ? styles.activeButton : ''}`}
                    onClick={() => setAspectRatio('3:2')}
                    style={{ height: 'calc(70px / (3 / 2))' }}
                  >
                    3:2
                  </button>
                  <button
                    className={`${styles.aspectButton} ${aspectRatio === '4:3' ? styles.activeButton : ''}`}
                    onClick={() => setAspectRatio('4:3')}
                    style={{ height: 'calc(70px / (4 / 3))' }}
                  >
                    4:3
                  </button>
                  <button
                    className={`${styles.aspectButton} ${aspectRatio === '1:1' ? styles.activeButton : ''}`}
                    onClick={() => setAspectRatio('1:1')}
                    style={{ height: '70px' }}
                  >
                    1:1
                  </button>
                  <button
                    className={`${styles.aspectButton} ${aspectRatio === '2:3' ? styles.activeButton : ''}`}
                    onClick={() => setAspectRatio('2:3')}
                    style={{ height: 'calc(70px / (2 / 3))' }}
                  >
                    2:3
                  </button>
                  <div className={styles.moreButtonContainer} ref={dropdownRef}
                        onMouseEnter={() => setmoreDropdownOpen(true)}
                        onMouseLeave={() => setmoreDropdownOpen(false)}
                  >
                    <button className={styles.moreButton}>
                      More
                    </button>

                    {moreDropdownOpen && (
                      <div className={styles.dropdown} style={{ top: dropdownTop, left: dropdownLeft, position: 'fixed' }}>
                        <button
                          className={`${styles.aspectButton} ${aspectRatio === '4:5' ? styles.activeButton : ''}`}
                          onClick={() => {
                            setAspectRatio('4:5');
                          }}
                          style={{ height: 'calc(70px / (4 / 5))' }} 
                        >
                          4:5
                        </button>
                        <button
                          className={`${styles.aspectButton} ${aspectRatio === '9:16' ? styles.activeButton : ''}`}
                          onClick={() => {
                            setAspectRatio('9:16');
                          }}
                          style={{ height: 'calc(70px / (9 / 16))' }} 
                        >
                          9:16
                        </button>
                        <button
                          className={`${styles.aspectButton} ${aspectRatio === '3:4' ? styles.activeButton : ''}`}
                          onClick={() => {
                            setAspectRatio('3:4');
                          }}
                          style={{ height: 'calc(70px / (3 / 4))' }} 
                        >
                          3:4
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            }

            {/* Image Size */}
            {apiType !== 'inpainting' && 
            <div className={styles.sizeInputColumn}>
              <p className={styles.label} style={{ margin: '0px', alignItems: 'center', justifyContent: 'center' }}>Image Size (px)</p>
              <div className={styles.sizeInputRow}>
                <input
                  type="number"
                  className={styles.inputWidthHeight}
                  placeholder="Width"
                  value={imageWidth}
                  onChange={(e) => setImageWidth(e.target.value)}
                />
                <span className={styles.sizeSeparator}>x</span>
                <input
                  type="number"
                  className={styles.inputWidthHeight}
                  placeholder="Height"
                  value={imageHeight}
                  onChange={(e) => setImageHeight(e.target.value)}
                />
              </div>
            </div>
            }

            {/* Strength */}
            <div className={styles.strengthInputColumn} style={{ width: '272px' }}>
              <p className={styles.label} style={{ margin: '0px' }}>Strength</p>
              <input
                type="number"
                className={styles.inputWidthHeight}
                min="0"
                max="1"
                step="0.01"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.generateButtonCont}>
            <button
              className={styles.generateButton}
              onClick={handleGenerateClick}
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>

        <div className={styles.imageContainer}>
        {apiType !== 'inpainting' ? (
          generatedImages.length > 0 && (
            <div className={styles.generatedImagesContainer}>
              {generatedImages.map((imageUrl, index) => (
                <img
                  key={index}
                  className={styles.generatedImage}
                  src={imageUrl}
                  alt={`Generated Image ${index + 1}`}
                />
              ))}
            </div>
          )
        ) : (
          <CanvasInpainting
            className={styles.generatedImage}
            uploadedImage={uploadedImage}
            canvasRef={canvasRef}  // Pass the ref to access canvas methods
          />
        )}
        </div>
      </div>
    </>
  );
}

export default ImageGenerator;