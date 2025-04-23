import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './ImageGenerator.module.css';
import { useNavigate, useLocation } from "react-router-dom";
import wsImage1 from '../../assets/House_sketch-to-image_web.jpg'; // Replace with your image path
import DropdownPortal from './DropdownPortal.js';


import genIcon from '../../assets/vector_icons/AI Replacement-01.svg';


import icon1 from '../../assets/vector_icons/Text to image generation-01.svg';
import icon2 from '../../assets/vector_icons/Image to sketch-01.svg';
import icon3 from '../../assets/vector_icons/Sketch to image-01.svg';

import icon4 from '../../assets/vector_icons/Image expansion-01.svg'
import icon5 from '../../assets/vector_icons/Image enhancement-01.svg';
import icon6 from '../../assets/vector_icons/Video generation-01.svg';
import icon7 from '../../assets/vector_icons/3D object generation-01.svg';

import icon8 from '../../assets/vector_icons/pricing-01.svg';
import icon9 from '../../assets/vector_icons/faq-01.svg';
import icon10 from '../../assets/vector_icons/support-01.svg';

import tticon1 from '../../assets/vector_icons/crop-01 1.svg'
import tticon2 from '../../assets/vector_icons/edit-01 1.svg'
import tticon3 from '../../assets/vector_icons/resize-01 1.svg'
import tticon4 from '../../assets/vector_icons/share-01 1.svg'
import tticon5 from '../../assets/vector_icons/download-01 1.svg'
import tticon6 from '../../assets/vector_icons/delete-01 1.svg'
import resetIcon from '../../assets/vector_icons/reset-01 1.svg'
import AiRepIcon from'../../assets/vector_icons/AI Replacement-01 1.svg'
import Dropdown from './Dropdown.js';

const apiUrl = process.env.REACT_APP_API_URL;
const username = JSON.parse(localStorage.getItem('user')) || {};
const userId = username._id;

function ImageGenerator({ onGenerateImage }) {
  const navigate = useNavigate();
  const location = useLocation(); // Use useLocation to retrieve passed state

  const queryParams = new URLSearchParams(location.search);
  const initialApiType = queryParams.get("apiType") || "sketch-to-image"; // Default to "sketch-to-image"
  const [apiType, setApiType] = useState(initialApiType);

  useEffect(() => {
    console.log("Current API Type:", apiType); // Debugging
  }, [apiType]);

  // const location = useLocation(); // Use useLocation to retrieve passed state

  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [generatedImages, setGeneratedImages] = useState([]);
  // const [apiType, setApiType] = useState(location.state?.apiType || 'text-to-image'); 
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

  const numberOfImages = [1, 2, 4, 6, 12]; // Array of numbers





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

    // console.log(`Generating image using API type: ${location.state.apiType}`);

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

      if (apiType === 'sketch-to-image' && uploadedImage) {
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

  };

  const handleStyleTypeChange = (style) => {
    setStyleType(style);
  };

  const handleAspectRatioChange = (event) => {
    setAspectRatio(event.target.value);
  };
  const handleImageSizeChange = (value) => {
    if (value == 'small') {
      setImageHeight('512')
      setImageHeight('512')
    }
    if (value == 'medium') {
      setImageHeight('1024')
      setImageHeight('1024')
    }
    if (value == 'large') {
      setImageHeight('1444')
      setImageHeight('1444')
    }

  }
  const handleImageUpload = (event) => {
    setUploadedImage(event.target.files[0]);
  };
  const formatApiType = (apiType) => {
    return apiType
      .split('-') // Split the string by hyphens
      .map((word, index) =>
        index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word
      ) // Capitalize the first letter of the first word
      .join(' '); // Join the words back with spaces
  }
  const isMobile = window.innerWidth <= 1024;

  const icons = isMobile? [icon1, icon2, icon3, icon4, icon5, icon6,icon7,icon8, icon9,icon10]:[icon1, icon2, icon3, icon4, icon5, icon6,icon7];
  const iconsbottom = isMobile?[]:[ icon8, icon9,icon10];
  const tticons = [tticon1, tticon2, tticon3, tticon4, tticon5, tticon6];

  const apiTypes = [
    "text-to-image",
    "image-to-sketch",
    "sketch-to-image",
    "image-enhancement",
    "image-expansion",
    "video-generation",
    "3D-object-generation",
    "",
    "",
"",
  ];

  return (
    <>
      {/* <Navbar user={user}  /> */}

      <div className={styles.generatorContainer}>

        <div className={styles.leftToolBar}>
          <div className={styles.leftToolBarTop}>
            {icons.map((iconUrl, index) => (
              <div key={index} style={{ width: "100%" }}>
                <button
                  onClick={() => handleApiTypeChange(apiTypes[index])} // Set API Type
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  <img
                    src={iconUrl}
                    alt={`icon-${index}`}
                    className={styles.toolBarIcon}
                    style={{
                      filter: apiType === apiTypes[index] ? "brightness(0) saturate(100%) invert(32%) sepia(49%) saturate(433%) hue-rotate(97deg) brightness(95%) contrast(92%)" : "brightness(0) saturate(100%) invert(60%)", // Highlight active icon
                    }}
                  />
                </button>
                {index !== icons.length - 1 && <div className={styles.divider} />}
              </div>
            ))}
          </div>


          <div className={styles.leftToolBarBottom}>
            {iconsbottom.map((iconUrl, index) => (
              <div key={index} style={{ width: '100%' }}>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                  }}
                >
                  <img src={iconUrl} alt={`icon-bottom-${index}`} className={styles.toolBarIcon} />
                </button>
                {index !== iconsbottom.length - 1 && <div className={styles.divider} />} {/* Divider */}
              </div>
            ))}
          </div>
        </div>



        {/* <div className={styles.leftToolBar}>
          <div className={styles.leftToolBarTop}>

            {icons.map((iconUrl, index) => (
              <div style={{
                // display: 'flex', 
                // gap: '10px', 
                // paddingBottom: '10px', 
                borderBottom: '1px solid #ccc'
              }}>
                <button
                  key={index}
                  // onClick={() => handleIconClick(index)} 
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    // padding: '5px'
                  }}
                >
                  <img key={index} src={iconUrl} alt={`icon-${index}`} className={styles.toolBarIcon} />

                </button> </div>
            ))}



  
          </div>
          <div className={styles.leftToolBarBottom}>
            {iconsbottom.map((iconUrl, index) => (
              <div style={{
                // display: 'flex', 
                // gap: '10px', 
                // paddingBottom: '10px',
                height:'40px', 
                borderBottom: '1px solid #ccc'
              }}>
                <button
                  key={index}
                  // onClick={() => handleIconClick(index)} 
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    // padding: '5px'
                  }}
                >
                  <img key={index} src={iconUrl} alt={`icon-${index}`} className={styles.toolBarIcon} />

                </button> </div>
            ))}
          </div>
        </div> */}
        <div className={styles.topInputContainer}>






          <div className={styles.inputContainer}>



            {/* Upload Image */}
            {apiType == 'sketch-to-image' &&
              <div className={styles.inputRow}>
                <div className={styles.inputColumn}>
                  <p className={styles.label_l}>Upload Image</p>
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



            {/* Prompt input */}
            <div className={styles.inputRow}>
              <div className={styles.inputColumn} style={{ margin: '0px' }}>

                <div className={styles.promptLabel}>            
                    <p className={styles.label_l} style={{ margin: '0px' }}>Describe Your Image</p>
                  {/* <button className={styles.magicButton}>
                    Magic Prompt
                  </button> */}
                    <img 
    src={resetIcon}
    alt="Rest Button"
    className={styles.resetButton} 
    onClick={(e) => setPromptText('')}
  />
                </div>

                <div className={styles.promptInputContainer}>
  <textarea
    className={styles.inputField}
    value={promptText}
    onChange={(e) => setPromptText(e.target.value)}
    placeholder="Describe your image or hit the Magic button..."
  />
  <img 
    src={AiRepIcon}
    alt="Magic Button"
    className={styles.iconButton} 
    // onClick={handleMagicClick} 
  />
</div>

{/* 
                <textarea
                  className={styles.inputField}
                  value={promptText}
                  // style={{
                  //   height: "50px", 
                  //   // minHeight: "10px", 
                  //   resize: "none", // Prevent manual resizing
                  // }}
                  onChange={(e) => setPromptText(e.target.value)}
                  // onInput={(e) => {
                  //   e.target.style.height = "auto"; 
                  //   e.target.style.height = `${e.target.scrollHeight}px`; // Adjust height based on content
                  // }}
                  placeholder="Describe your image or hit the Magic button..."
                /> */}



              </div>
            </div>

            <br />




            <p className={styles.label_l} style={{ margin: '0px' }}>Advanced Settings</p>

            <br />






            {/* image number  */}
            {/* <div className={styles.inputRow}> */}
            <div className={styles.numButtonCont}>

              <p className={styles.label} >Images Number</p>

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
            {/* <div className={styles.inputRow}> */}
            <div className={styles.inputColumn}>
              <p className={styles.label}>Aspect Ratio</p>
              <div className={styles.aspectRatioButtons}>
                <button
                  className={`${styles.aspectButton} ${aspectRatio === '16:9' ? styles.activeButton : ''}`}
                  onClick={() => setAspectRatio('16:9')}
                // style={{ height: 'calc(70px / (16 / 9))' }} 
                >
                  16:9
                </button>
                <button
                  className={`${styles.aspectButton} ${aspectRatio === '3:2' ? styles.activeButton : ''}`}
                  onClick={() => setAspectRatio('3:2')}
                // style={{ height: 'calc(70px / (3 / 2))' }} 
                >
                  3:2
                </button>
                <button
                  className={`${styles.aspectButton} ${aspectRatio === '4:3' ? styles.activeButton : ''}`}
                  onClick={() => setAspectRatio('4:3')}
                // style={{ height: 'calc(70px / (4 / 3))' }} 
                >
                  4:3
                </button>
                <button
                  className={`${styles.aspectButton} ${aspectRatio === '1:1' ? styles.activeButton : ''}`}
                  onClick={() => setAspectRatio('1:1')}
                // style={{ height: '70px' }} 
                >
                  1:1
                </button>
                <button
                  className={`${styles.aspectButton} ${aspectRatio === '2:3' ? styles.activeButton : ''}`}
                  onClick={() => setAspectRatio('2:3')}
                // style={{ height: 'calc(70px / (2 / 3))' }} 
                >
                  2:3
                </button>




              </div>
            </div>
            {/* </div> */}




            {/* Image Size */}
            <div className={styles.inputColumn}>
              <p className={styles.label} style={{ margin: '0px', alignItems: 'center', justifyContent: 'center' }}>Image Size (px)</p>
              <div className={styles.sizeButtons}>

                <button
                  className={`${styles.aspectButton} ${imageHeight === '512' ? styles.activeButton : ''}`}
                  onClick={() => handleImageSizeChange('small')}
                // style={{ height: 'calc(70px / (2 / 3))' }} 
                >
                  Small
                </button>
                <button
                  className={`${styles.aspectButton} ${imageHeight === '1024' ? styles.activeButton : ''}`}
                  onClick={() => handleImageSizeChange('medium')}
                // style={{ height: 'calc(70px / (2 / 3))' }} 
                >
                  Normal
                </button>
                <button
                  className={`${styles.aspectButton} ${imageHeight === '1444' ? styles.activeButton : ''}`}
                  onClick={() => handleImageSizeChange('large')}
                // style={{ height: 'calc(70px / (2 / 3))' }} 
                >
                  Large
                </button>

                {/* <input
                  type="number"
                  className={styles.inputWidthHeight}
                  placeholder="Width"
                  value={imageWidth}
                  onChange={(e) => setImageWidth(e.target.value)}
                /> */}
                {/* <input
                  type="number"
                  className={styles.inputWidthHeight}
                  placeholder="Height"
                  value={imageHeight}
                  onChange={(e) => setImageHeight(e.target.value)}
                /> */}
              </div>

            </div>





            {/* Negative prompt */}
            <div className={styles.inputRow}>
              <div className={styles.inputColumn}>
                <p className={styles.label}>Negative Prompt</p>
                <textarea
                  // type="text"
                  className={styles.inputField}

                  value={negativePromptText}
                  // style={{
                  //   height: "50px", 
                  //   // minHeight: "10px", 
                  //   resize: "none", // Prevent manual resizing
                  // }}
                  // onInput={(e) => {
                  //   e.target.style.height = "auto"; // Reset the height to auto to recalculate
                  //   e.target.style.height = `${e.target.scrollHeight}px`; // Adjust height based on content
                  // }}
                  onChange={(e) => setNegativePromptText(e.target.value)}
                  placeholder='Add negative prompts, e.g. "blurry image"'
                />
              </div>
            </div>













            {/* Strength */}
            {/* <div className={styles.strengthInputColumn} style={{ width: '272px' }}>
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
            </div> */}

          </div>

          <div className={styles.generateButtonCont}>
            <button
              className={styles.generateButton}
              onClick={handleGenerateClick}
              disabled={isLoading}
            >
              <img src={genIcon} alt="" className={styles.genIcon} />

              {isLoading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>

        <div className={styles.rightSection}>
        {/* <div className='dropdown-mobile'> */}
            <Dropdown 
        apiType={formatApiType(apiType)}
        apiTypes={apiTypes} 
        icons={icons} 
        iconsbottom={iconsbottom} 
        handleApiTypeChange={handleApiTypeChange} 
        
      />
        {/* </div> */}
          <div className={styles.topToolBar}>
            <div style={{}}>{formatApiType(apiType)}</div>

            <div>
              <div className={styles.topToolBarIcons}>
                {tticons.map((iconUrl, index) => (
                  <div key={index} style={{ width: "100%" }}>
                    <button
                      // onClick={() => handleApiTypeChange(apiTypes[index])} // Set API Type
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        borderLeft:'1px solid #000'
                      }}
                    >
                      <img
                        src={iconUrl}
                        alt={`icon-${index}`}
                        className={styles.toolBarIcon}
                        style={{
                          // filter: "brightness(0) saturate(100%) invert(32%) sepia(49%) saturate(433%) hue-rotate(97deg) brightness(95%) contrast(92%)" : "brightness(0) saturate(100%) invert(60%)", // Highlight active icon
                        }}
                      />
                    </button>
                    {/* {index !== icons.length - 1 && <div className={styles.dividerHorizontal} />} */}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.imageContainer}>
            {generatedImages.length > 0 && (
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
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ImageGenerator;
