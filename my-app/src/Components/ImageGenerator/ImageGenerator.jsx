import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './ImageGenerator.module.css';
import { useNavigate, useLocation } from "react-router-dom";
import wsImage1 from '../../assets/House_sketch-to-image_web.jpg'; // Replace with your image path
import DropdownPortal from './DropdownPortal.js';
import CanvasInpainting from './canvas.js';
import ModelViewer from './ModelViewer.js';
import { saveAs } from 'file-saver';


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
const userId = '672f8fa5d0f99f32389f2ac0';

function ImageGenerator({ onGenerateImage }) {
  const navigate = useNavigate();
  const location = useLocation(); // Use useLocation to retrieve passed state

  const queryParams = new URLSearchParams(location.search);
  const initialApiType = queryParams.get("apiType") || "sketch-to-image"; // Default to "sketch-to-image"
  const [apiType, setApiType] = useState(initialApiType);

  useEffect(() => {
    setGeneratedImages([]);
    setGeneratedModelUrl(null);
    setGeneratedVideoUrl(null);
  }, [apiType]);

  // const location = useLocation(); // Use useLocation to retrieve passed state

  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedNumImages, setSelectedNumImages] = useState(1);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [generatedModelUrl, setGeneratedModelUrl] = useState(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState(null);
  // const [enhancedImage, setEnhancedImage] = useState(null);



  // const [apiType, setApiType] = useState(location.state?.apiType || 'text-to-image'); 
  const canvasRef = useRef(null);
  const [generatorType, setGeneratorType] = useState('');
  const [promptText, setPromptText] = useState('');
  const [negativePromptText, setNegativePromptText] = useState('');
  const [styleType, setStyleType] = useState('default');
  const [isRetrieving, setIsRetrieving] = useState(false);
  const retrieveTimeoutRef = useRef(null); // <--- ADD THIS
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [scale, setScale] = useState(7);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageWidth, setImageWidth] = useState(512);
  const [imageHeight, setImageHeight] = useState(512);
  const [strength, setStrength] = useState(0.75);
  const [ModOrRep,setModOrRep] = useState('Replace') // state for image enhancement to check if image is to be modified or replaced
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  

  useEffect(() => {
    // Automatically update size when aspect ratio changes
    if (imageHeight === 512) {
      handleImageSizeChange('small');
    } else if (imageHeight === 1024) {
      handleImageSizeChange('medium');
    } else if (imageHeight === 1444) {
      handleImageSizeChange('large');
    }
  }, [aspectRatio]);
  

  const numberOfImages = [1, 2, 4]; // Array of numbers

  const handleDownloadAll = async () => {
    try {
      if (apiType === 'object-creation' && generatedModelUrl) {
        const response = await fetch(generatedModelUrl);
        const blob = await response.blob();
        saveAs(blob, 'generated_model.glb');
      } else if (generatedImages.length > 0) {
        for (let i = 0; i < generatedImages.length; i++) {
          const response = await fetch(generatedImages[i]);
          const blob = await response.blob();
          saveAs(blob, `generated_image_${i + 1}.png`);
        }
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };


  const handleRunpod3DGeneration = async (formData) => {
    try {
      // Step 1: Submit job
      const initRes = await axios.post(`${apiUrl}api/serverless/generate-3d-model`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
  
      const jobId = initRes.data.job_id;
      if (!jobId) throw new Error('No job ID received from server');
  
      const endTime = Date.now() + 240000; // 4-minute timeout
  
      // Step 2: Poll job status
      const pollForResult = async () => {
        return new Promise((resolve, reject) => {
          const interval = setInterval(async () => {
            if (Date.now() > endTime) {
              clearInterval(interval);
              reject(new Error('GLB generation timed out'));
              return;
            }
  
            try {
              const statusRes = await axios.get(`${apiUrl}api/serverless/3d-model-status/${jobId}`);
  
              if (statusRes.status === 202) return;
  
              if (statusRes.status === 200 && statusRes.data.glb_base64) {
                clearInterval(interval);
                resolve(statusRes.data.glb_base64);
              }
            } catch (err) {
              if (err.response?.status === 202) return;
              clearInterval(interval);
              reject(err);
            }
          }, 3000); // poll every 3s
        });
      };
  
      const glbBase64 = await pollForResult();
      const blob = base64ToBlob(glbBase64, 'model/gltf-binary');
      const url = URL.createObjectURL(blob);
      setGeneratedModelUrl(url);
    } catch (err) {
      console.error('RunPod 3D generation failed:', err);
      throw err;
    } finally {
      clearTimeout(retrieveTimeoutRef.current);
      setIsRetrieving(false);
      setIsLoading(false);
    }
  };
  
// New handler for sketch-to-image (RunPod serverless)
const handleSketchToImageServerless = async (formData) => {
  try {
    // Step 1: Submit the sketch image
    const initRes = await axios.post(`${apiUrl}api/serverless/sketch-to-image-serverless`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    const jobId = initRes.data.job_id;
    if (!jobId) throw new Error('No job_id received from server');

    const endTime = Date.now() + 100000; // 100 sec timeout

    // Step 2: Polling logic
    const pollResult = async () => {
      return new Promise((resolve, reject) => {
        const intervalId = setInterval(async () => {
          if (Date.now() > endTime) {
            clearInterval(intervalId);
            return reject(new Error('Timeout while waiting for sketch-to-image result'));
          }

          try {
            const pollRes = await axios.get(`${apiUrl}api/serverless/sketch-to-image-status/${jobId}`, {
              params: { userId }
            });

            if (pollRes.status === 202) return; // still processing

            if (pollRes.status === 200 && pollRes.data.imageUrls) {
              clearInterval(intervalId);
              resolve(pollRes.data.imageUrls);
            }
            
          } catch (err) {
            if (err.response && err.response.status === 202) return;
            clearInterval(intervalId);
            reject(err);
          }
        }, 3000);
      });
    };

    const imageUrls = await pollResult();
    setGeneratedImages(imageUrls);
    onGenerateImage(imageUrls);
  } catch (err) {
    console.error('Sketch-to-image (serverless) error:', err);
    throw err;
  }
};

const handleTextToImageServerless = async () => {
  try {
    const payload = {
      userId,
      prompt: promptText,
      negative_prompt: negativePromptText,
      width: imageWidth,
      height: imageHeight,
      num_images: selectedNumImages,
      steps: 25,
      guidance_scale: scale,
      seed: Math.floor(Math.random() * 1000000000),
      scheduler: 'normal',
      clip_skip: 0,
      style: styleType,
      safetensor: false,
      model_xl: false,
      revert_extra: null
    };

    const initRes = await axios.post(`${apiUrl}api/serverless/text-to-image-serverless`, payload);
    const jobId = initRes.data?.job_id;
    if (!jobId) throw new Error('No job_id returned from server');

    const endTime = Date.now() + 240000; // 4 min timeout

    const pollResult = async () => {
      return new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
          if (Date.now() > endTime) {
            clearInterval(interval);
            return reject(new Error('Timeout while waiting for text-to-image result'));
          }

          try {
            const pollRes = await axios.get(`${apiUrl}api/serverless/text-to-image-status/${jobId}`);
            if (pollRes.status === 202) return;

            if (pollRes.status === 200 && pollRes.data.imageUrls) {
              clearInterval(interval);
              resolve(pollRes.data.imageUrls);
            }
          } catch (err) {
            if (err.response && err.response.status === 202) return;
            clearInterval(interval);
            reject(err);
          }
        }, 3000);
      });
    };

    const imageUrls = await pollResult();
    setGeneratedImages(imageUrls);
    onGenerateImage(imageUrls);
  } catch (err) {
    console.error('Text-to-image (serverless) error:', err);
    throw err;
  } finally {
    clearTimeout(retrieveTimeoutRef.current);
    setIsRetrieving(false);
    setIsLoading(false);
  }
};


  function base64ToBlob(base64, mime) {
    const byteCharacters = atob(base64);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
  
    return new Blob(byteArrays, { type: mime });
  }
  



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
    setIsRetrieving(false);

// Start 40 seconds timer
retrieveTimeoutRef.current = setTimeout(() => {
  setIsRetrieving(true);
}, 40000);
    if (!userId) {
      navigate('/login');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('generatorType', generatorType);
      formData.append('num_images', selectedNumImages);
      formData.append('prompt', promptText);
      formData.append('negativePromptText', negativePromptText);
      formData.append('styleType', styleType);
      formData.append('aspectRatio', aspectRatio);
      formData.append('scale', scale);
      formData.append('userId', userId);
      formData.append('width', imageWidth);
      formData.append('height', imageHeight);
      formData.append('strength', strength);
      formData.append('denoise',ModOrRep == 'Replace'? 1:0.8)
  
      // Handle image enhancement with masked image
      if (apiType === 'image-enhancement' && canvasRef.current) {
        try {
          const maskedImageBlob = await canvasRef.current.getMaskedImageBlob();
      
          // Append both masked and original image
          formData.append('masked_image', maskedImageBlob, 'masked_image.png');
      
          if (uploadedImage instanceof File) {
            formData.append('original_image', uploadedImage); // raw File upload
          } else {
            // uploadedImage is an <img> element (from enhancement response), convert to Blob
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = uploadedImage.width;
            tempCanvas.height = uploadedImage.height;
            const ctx = tempCanvas.getContext('2d');
            ctx.drawImage(uploadedImage, 0, 0);
      
            const blob = await new Promise((resolve) => {
              tempCanvas.toBlob((b) => resolve(b), 'image/png');
            });
      
            formData.append('original_image', blob, 'original_image.png');
          }
        } catch (error) {
          console.error('Error getting masked image:', error);
          clearTimeout(retrieveTimeoutRef.current);
          setIsRetrieving(false);
          setIsLoading(false);
          return;
        }
      }
      
  
      // Handle sketch-to-image or regular image upload
      if (apiType === 'sketch-to-image' && uploadedImage) {
        formData.append('sketch_image', uploadedImage);
      } else if (uploadedImage) {
        formData.append('image', uploadedImage);
      }
  
      // Handle different API types
      if (apiType === 'video-generation') {
        await handleVideoGeneration(formData);
      } else if (apiType === 'object-creation') {
        await handleRunpod3DGeneration(formData);
      } else if (apiType === 'image-enhancement') {
        await handleImageEnhancement(formData);
      } else if (apiType === 'sketch-to-image') {
        await handleSketchToImageServerless(formData);

      } 
     else if (apiType === 'text-to-image') {
      await handleTextToImageServerless();  // <-- ADD THIS
    }else {
        // Handle other image generation types
        const response = await axios.post(`${apiUrl}${apiType}`, formData, {
      
          headers: { 'Content-Type': 'multipart/form-data' },
          responseType: 'json'
        });
        const imageUrls = Array.isArray(response.data.imageUrls)
          ? response.data.imageUrls
          : [response.data.imageUrls];
        
        setGeneratedImages(imageUrls);
        onGenerateImage(imageUrls);
      }
    } catch (error) {
      console.error('Error generating image:', error);
    }
    if (apiType != 'video-generation' && apiType != 'object-creation'){
      clearTimeout(retrieveTimeoutRef.current);
setIsRetrieving(false);
    setIsLoading(false);
    }
   
  };
  
  // New function for handling image enhancement with polling
  const handleImageEnhancement = async (formData) => {
    try {
      // Step 1: Submit the initial request
      const initResponse = await axios.post(`${apiUrl}api/sl/image-enhancement`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log(initResponse)
      if (!initResponse.data.uuid) {
        throw new Error('No UUID received from server');
      }
      
      const imageUuid = initResponse.data.uuid;
      
      // Step 2: Poll for results
      const endTime = Date.now() + 100000; // 100 seconds timeout
      
      // Create a polling function that returns a promise
      const pollForResult = () => {
        return new Promise((resolve, reject) => {
          const intervalId = setInterval(async () => {
            if (Date.now() >= endTime) {
              clearInterval(intervalId);
              reject(new Error('Request Timeout: Image could not be retrieved in time.'));
              return;
            }
            
            try {
              const response = await axios.get(`${apiUrl}check-image/${imageUuid}`, {
                params: { userId: userId }
              });
              
              // If status is 200, image is ready
              if (response.status === 200) {
                clearInterval(intervalId);
                
                const imageUrls = Array.isArray(response.data.imageUrls)
                  ? response.data.imageUrls
                  : [response.data.imageUrls];
                
                resolve(imageUrls);
              }
              // If status is 202, image is still processing, continue polling
            } catch (error) {
              if (error.response && error.response.status === 202) {
                // Still processing, continue polling
                return;
              }
              
              clearInterval(intervalId);
              reject(error);
            }
          }, 3000);
        });
      };
      
      // Start polling and wait for results
      const imageUrls = await pollForResult();
      console.log(imageUrls[0])
      const base64Data = imageUrls[0].replace(/^data:image\/\w+;base64,/, '');
const mimeType = imageUrls[0].match(/^data:(image\/\w+);base64/)[1];
const byteCharacters = atob(base64Data);
const byteNumbers = new Array(byteCharacters.length);
for (let i = 0; i < byteCharacters.length; i++) {
  byteNumbers[i] = byteCharacters.charCodeAt(i);
}
const byteArray = new Uint8Array(byteNumbers);
const blob = new Blob([byteArray], { type: mimeType });

// Create a fully loaded Image object from the blob
const imageObjectUrl = URL.createObjectURL(blob);
const img = new Image();
img.onload = () => {
  setUploadedImage(img);
};
img.src = imageObjectUrl; // just take first if array
      
    } catch (error) {
      console.error('Error during image enhancement:', error);
      throw error;
    }
  };
  
  // Existing video generation handler (kept for reference)
  const handleVideoGeneration = async (formData) => {
    try {
      const res = await axios.post(`${apiUrl}generate-video`, formData);
      const videoUuid = res.data.uuid;
  
      const endTime = Date.now() + 240000;
  
      const pollInterval = setInterval(async () => {
        if (Date.now() > endTime) {
          clearInterval(pollInterval);
          clearTimeout(retrieveTimeoutRef.current);
setIsRetrieving(false);
          setIsLoading(false);
          alert('Video generation timed out');
          return;
        }
  
        const statusRes = await axios.get(`${apiUrl}check-video/${videoUuid}`);
  
        if (statusRes.status === 202) return;
  
        if (statusRes.status === 200) {
          clearInterval(pollInterval);
          const downloadUrl = statusRes.data.downloadUrl;
          setGeneratedVideoUrl(downloadUrl);
          clearTimeout(retrieveTimeoutRef.current);
setIsRetrieving(false);
          setIsLoading(false);
        }
      }, 3000);
    } catch (error) {
      console.error('Error generating video:', error);
      throw error;
    }
  };
  
  // Existing object creation handler (kept for reference)
  const handleObjectCreation = async (formData) => {
    try {
      const res = await axios.post(`${apiUrl}object-creation`, formData);
      const imageUuid = res.data.uuid;
      const endTime = Date.now() + 240000; // 4 minutes
    
      const pollInterval = setInterval(async () => {
        if (Date.now() > endTime) {
          clearInterval(pollInterval);
          clearTimeout(retrieveTimeoutRef.current);
setIsRetrieving(false);
          setIsLoading(false);
          alert('GLB generation timed out');
          return;
        }
    
        const statusRes = await axios.get(`${apiUrl}check-object/${imageUuid}`);
        if (statusRes.status === 202) return; // Still generating
    
        if (statusRes.status === 200) {
          clearInterval(pollInterval);
          const { glb_data } = statusRes.data;
          const blob = base64ToBlob(glb_data, 'model/gltf-binary');
          const url = URL.createObjectURL(blob);
          setGeneratedModelUrl(url);
          clearTimeout(retrieveTimeoutRef.current);
setIsRetrieving(false);
          setIsLoading(false);
        }
      }, 3000);
    } catch (error) {
      console.error('Error generating 3D object:', error);
      throw error;
    }
  };

  const handleApiTypeChange = (value) => {
    setApiType(value);
    setSelectedNumImages(1);
    console.log("API CHANGEDD")
    setUploadedImage(null);
    setGeneratedImages([]);
    setGeneratedModelUrl(null);   // Reset model URL if applicable
    setGeneratedVideoUrl(null);   // Reset video URL if applicable
  };

  const handleStyleTypeChange = (style) => {
    setStyleType(style);
  };

  const handleAspectRatioChange = (event) => {
    setAspectRatio(event.target.value);
  };
  const handleImageSizeChange = (sizeLabel) => {
    let baseHeight;
    if (sizeLabel === 'small') baseHeight = 512;
    else if (sizeLabel === 'medium') baseHeight = 1024;
    else if (sizeLabel === 'large') baseHeight = 1444;
  
    let widthRatio = 1;
    let heightRatio = 1;
  
    const [w, h] = aspectRatio.split(':').map(Number);
    if (!isNaN(w) && !isNaN(h)) {
      widthRatio = w;
      heightRatio = h;
    }
  
    const calculatedWidth = Math.round((baseHeight * widthRatio) / heightRatio);
  
    setImageHeight(baseHeight);
    setImageWidth(calculatedWidth);
  };
  
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (apiType === 'image-enhancement') {
        const img = new Image();
        img.onload = () => {
          setUploadedImage(img);
        };
        img.src = previewUrl;
      } else {
        setUploadedImage(file);
      }
    }
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
    "video-generation",
    "inpainting",
    "object-creation"
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
            {(apiType === 'sketch-to-image' || apiType === 'object-creation' || apiType === 'video-generation' || apiType === 'image-enhancement') &&
            
              <div className={styles.inputRow}>
                <div className={styles.inputColumn}>
                  <p className={styles.label_l} style={{ marginBottom: '10px' }}>Upload Image</p>
                  <label className={styles.uploadLabel}>
                    <input
                      type="file"
                      className={styles.uploadInput}
                      onChange={handleImageUpload}
                      accept="image/*"
                    />
                    {uploadedImage ? (
                      <img 
                        src={uploadedImage instanceof File ? URL.createObjectURL(uploadedImage) : uploadedImage.src} 
                        alt="Preview" 
                        className={styles.uploadPreview}
                      />
                    ) : (
                      <span className={styles.uploadPlaceholder}>UPLOAD IMAGE</span>
                    )}
                  </label>
                </div>
              </div>
            }
            {(apiType === 'image-enhancement') &&
            <div style={{ display: 'flex', gap: '10px',marginBottom:'30px' }}>
  <button
    className={`${styles.numButton} ${ModOrRep === 'Replace' ? styles.activeButton : ''}`}
    onClick={() => setModOrRep('Replace')}
  >
    Replace    
  </button>
  <button
    className={`${styles.numButton} ${ModOrRep === 'Modify' ? styles.activeButton : ''}`}
    onClick={() => setModOrRep('Modify')}
  >
    Modify    
  </button>
</div>}

<div style={{width:250}}></div>
            {/* Prompt input */}
            {apiType !== 'object-creation'  && 
            
            <div className={styles.inputRow}>
              <div className={styles.inputColumn} style={{ margin: '0px' }}>

                <div className={styles.promptLabel}>            
                    <p className={styles.label_l} style={{ margin: '0px' }}>Describe Your Image</p>
  
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
            </div>}
            

      




            {<p className={styles.label_l} style={{ margin: '0px' }}>Advanced Settings</p>}

            <br />





            {apiType !== 'object-creation' && apiType !== 'image-enhancement' && apiType !== 'video-generation' && apiType !== 'sketch-to-image' && 
            <div className={styles.inputColumn}>

            <div className={styles.numButtonCont}>

              <p className={styles.label} >Images Number</p>

              <div className={styles.numberButtons}>
              {numberOfImages.map((number) => (
  <button
    key={number}
    className={`${styles.numButton} ${selectedNumImages === number ? styles.activeButton : ''}`}
    onClick={() => setSelectedNumImages(number)}
  >
    {number}
  </button>
))}

              </div>
              </div>
              </div>}
           



{apiType !== 'object-creation' && apiType !== 'image-enhancement' && apiType !== 'video-generation' && (
  <div className={styles.inputColumn}>
    <p className={styles.label}>Aspect Ratio</p>
    <div className={styles.aspectRatioButtons}>
      <button
        className={`${styles.aspectButton} ${aspectRatio === '16:9' ? styles.activeButton : ''}`}
        onClick={() => setAspectRatio('16:9')}
      >
        16:9
      </button>
      <button
        className={`${styles.aspectButton} ${aspectRatio === '3:2' ? styles.activeButton : ''}`}
        onClick={() => setAspectRatio('3:2')}
      >
        3:2
      </button>
      <button
        className={`${styles.aspectButton} ${aspectRatio === '4:3' ? styles.activeButton : ''}`}
        onClick={() => setAspectRatio('4:3')}
      >
        4:3
      </button>
      <button
        className={`${styles.aspectButton} ${aspectRatio === '1:1' ? styles.activeButton : ''}`}
        onClick={() => setAspectRatio('1:1')}
      >
        1:1
      </button>
      <button
        className={`${styles.aspectButton} ${aspectRatio === '2:3' ? styles.activeButton : ''}`}
        onClick={() => setAspectRatio('2:3')}
      >
        2:3
      </button>
    </div>
  </div>
)}

            




            {/* Image Size */}
            {apiType !== 'object-creation' && apiType !== 'image-enhancement' && apiType !== 'video-generation' && 
            
            <div className={styles.inputColumn}>
            <p className={styles.label} style={{ margin: '0px', alignItems: 'center', justifyContent: 'center' }}>Image Size (px)</p>
            <div className={styles.sizeButtons}>

              <button
                className={`${styles.aspectButton} ${imageHeight === 512 ? styles.activeButton : ''}`}
                onClick={() => handleImageSizeChange('small')}
              // style={{ height: 'calc(70px / (2 / 3))' }} 
              >
                Small
              </button>
              <button
                className={`${styles.aspectButton} ${imageHeight === 1024 ? styles.activeButton : ''}`}
                onClick={() => handleImageSizeChange('medium')}
              // style={{ height: 'calc(70px / (2 / 3))' }} 
              >
                Normal
              </button>
              <button
                className={`${styles.aspectButton} ${imageHeight === 1444 ? styles.activeButton : ''}`}
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

          </div>}
           



{/* Guidance Scale Slider */}
<div className={styles.inputColumn}>
  <p className={styles.label} style={{ margin: '0px' }}>Guidance Scale: {scale}</p>
  <input
    type="range"
    min="1"
    max="20"
    step="0.1"
    value={scale}
    onChange={(e) => setScale(parseFloat(e.target.value))}
    className={styles.slider}
  />
</div>

{/* Strength Slider */}
<div className={styles.inputColumn}>
  <p className={styles.label} style={{ margin: '0px'}}>Strength: {strength}</p>
  <input
    type="range"
    style={{color:'#3b7d23'}}
    min="0"
    max="1"
    step="0.01"
    value={strength}
    onChange={(e) => setStrength(parseFloat(e.target.value))}
    className={styles.slider}
  />
</div>

            {/* Negative prompt */}


            {<div className={styles.inputRow}>
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
            </div>}
            














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

              {isLoading ? (isRetrieving ? 'Retrieving...' : 'Generating...') : 'Generate'}

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
                      onClick={() => {
                        switch(index) {
                          case 0: // Crop
                            // Add crop functionality
                            break;
                          case 1: // Edit
                            // Add edit functionality
                            break;
                          case 2: // Resize
                            // Add resize functionality
                            break;
                          case 3: // Share
                            // Add share functionality
                            break;
                          case 4: // Download
                            handleDownloadAll();
                            break;
                          case 5: // Delete
                            if (apiType === 'image-enhancement' && canvasRef.current) {
                              canvasRef.current.clearMask();
                            }
                            break;
                          default:
                            break;
                        }
                      }}
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
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.imageContainer}>
            {apiType === 'image-enhancement' && uploadedImage ? (
              <CanvasInpainting 
                uploadedImage={uploadedImage}
                key={uploadedImage?.src || Date.now()}
                canvasRef={canvasRef}
              />
            ) : (
              <>
                {apiType === 'object-creation' && generatedModelUrl && (
                  <ModelViewer modelPath={generatedModelUrl} />
                )}

                {apiType === 'video-generation' && generatedVideoUrl && (
                  <div className={styles.generatedVideoContainer}>
                    <video controls className={styles.generatedVideo}>
                      <source src={generatedVideoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

{apiType !== 'object-creation' && apiType !== 'video-generation' && (
  <>
    {generatedImages.length > 0 ? (
      <div className={`${styles.generatedImagesGrid} ${styles['grid-' + selectedNumImages]}`}>
        {generatedImages.slice(0, selectedNumImages).map((url, index) => (
          <img key={index} src={url} alt={`Generated ${index}`} />
        ))}
      </div>
    ) : (
      <div className={styles.emptyState}>
        <h2>✨ Get Started</h2>
        <p>Upload an image or write a prompt to generate visuals with AI.</p>
      </div>
    )}
  </>
)}

              </>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default ImageGenerator;
