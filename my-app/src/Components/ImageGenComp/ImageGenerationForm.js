import React, { useState } from "react";
import axios from "axios";
import "./ImageGenerationForm.css";
const apiUrl = process.env.REACT_APP_API_URL;

const ImageGenerationForm = ({ username, onGenerateImage }) => {
  // const [promptText, setPromptText] = useState("");
  // const [negativePromptText, setNegativePromptText] = useState("");
  // const [styleType, setStyleType] = useState("");
  // const [aspectRatio, setAspectRatio] = useState("");
  // const [scale, setScale] = useState("");
  // const [formSubmitted, setFormSubmitted] = useState(false); // New state to track form submission

  // const [generatedImages, setGeneratedImages] = useState([]); // State to store generated images
 
 
  const [apiType, setApiType] = useState("generate-image"); // State to track selected API type
  const [generatorType, setGeneratorType] = useState("");
  const [promptText, setPromptText] = useState("");
  const [negativePromptText, setNegativePromptText] = useState("");
  const [styleType, setStyleType] = useState("");
  const [aspectRatio, setAspectRatio] = useState("");
  const [scale, setScale] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null); // State for uploaded sketch image
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const handleApiTypeChange = (event) => {
    setApiType(event.target.value);
    // Reset uploaded image when changing API type
    setUploadedImage(null);
  };




  const handleImageUpload = (event) => {
    setUploadedImage(event.target.files[0]);
  };

  const handleGenerateImage = async () => {
    setFormSubmitted(true);

    if (!isFormValid) return;

    try {
      const formData = new FormData();
      formData.append("generatorType", generatorType);
      console.log("Prompt text before appending:", promptText); // Add this line for debugging
      formData.append("prompt", promptText);
      
      formData.append("negativePromptText", negativePromptText);
      formData.append("styleType", styleType);
      formData.append("aspectRatio", aspectRatio);
      formData.append("scale", scale);
      formData.append("userId", username._id);

      if (apiType === "sketch-to-image" && uploadedImage) {
        formData.append("sketch_image", uploadedImage);
        formData.append("sketch_image_uuid", 1234); // Ensure you have a UUID to append

      }
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      
console.log("Form data: ", formData)
      const response = await axios.post(`${apiUrl}${apiType}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const imageUrls = Array.isArray(response.data.imageUrls) ? response.data.imageUrls : [response.data.imageUrls];
      console.log("Generated Image URLs:", imageUrls);
      setGeneratedImages(imageUrls);
      onGenerateImage(imageUrls);
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  const isFormValid = promptText.trim() !== '' || apiType === "sketch-to-image";

 
 
  // console.log("inside generator",username._id);


  const handleTextChange = (label, value) => {
    switch (label) {
      case "Text for prompts":
        setPromptText(value);
        break;
      case "Text for negative prompts":
        setNegativePromptText(value);
        break;
      // Add more cases for other TextBars if needed
      default:
        break;
    }
  };

  // const handleGenerateImage = async () => {

  //   setFormSubmitted(true)

  //   if (!isFormValid) {return}
  //   try {
  //     // Make a POST request to the image generation API
   

  //     const response = await axios.post(`${apiUrl}generate-image`, {
  //       promptText,
  //       negativePromptText,
  //       styleType,
  //       aspectRatio,
  //       scale,
  //       userId: username._id,
  //     });

  //     // Log the generated image URLs
  //     console.log("Generated Image URLs:", response.data.imageUrls);

  //     // Update the state with the generated images
  //     setGeneratedImages(response.data.imageUrls);

  //     // Call the callback function for further actions (e.g., displaying the images)
  //     onGenerateImage(response.data.imageUrls);
  //   } catch (error) {
  //     console.error("Error generating image:", error);
  //   }

  //   // Reset form state
  //   // setGeneratorType("");
  //   // setPromptText("");
  //   // setNegativePromptText("");
  //   // setStyleType("");
  //   // setAspectRatio("");
  //   // setScale("");
  // };
  // const isFormValid = promptText.trim() !== ''; // Checks if promptText is not just empty spaces

  return (
    <div className="form-container">
      <h1>Image Generation Form</h1>
  
      {/* Generator Selection */}
      {/* <div className="button-container">
        <button className="button-2d" onClick={() => handleGeneratorSelect("2D")}>
          2D
        </button>
        <button className="button-3d" onClick={() => handleGeneratorSelect("3D")}>
          3D
        </button>
      </div>
   */}
         <div>
        <label>Choose API Type:</label>
        <select value={apiType} onChange={handleApiTypeChange}>
          <option value="generate-image">Generate Image</option>
          <option value="sketch-to-image">Sketch to Image</option>
        </select>
      </div>



      {apiType === "sketch-to-image" && (
        <div>
          <label>Upload Sketch:</label>
          <input type="file" name="sketch_image" onChange={handleImageUpload} />
        </div>
      )}


      {/* TextBar for prompts */}
      <div>
        <label>Text for prompts</label>
        <input
          className="input-field"
          type="text"
          value={promptText}
          onChange={(e) => handleTextChange("Text for prompts", e.target.value)}
        />
      </div>
      {formSubmitted && !isFormValid && (
          <p className="error-message">This field is mandatory</p>
        )}
      {/* TextBar for negative prompts */}
      <div>
        <label>Text for negative prompts</label>
        <input
          className="input-field"
          type="text"
          value={negativePromptText}
          onChange={(e) => handleTextChange("Text for negative prompts", e.target.value)}
        />
      </div>
  
      {/* Style Selection */}
  
      {/* Additional input fields for aspect ratio and scale */}
      <div className="button-container">
        <button className="button" onClick={handleGenerateImage}             disabled={!isFormValid}  // Button is disabled if form is not valid
>
          Generate Image
        </button>

      </div>
  
      {/* Display generated images below the form */}
      {/* {generatedImages.length > 0 && (
        <div className="generated-images-container">
          <h2>Generated Images</h2>
          {generatedImages.map((imageUrl, index) => (
            <img
              key={index}
              className="generated-image"
              src={imageUrl}
              alt={`Generated Image ${index + 1}`}
            />
          ))}
        </div>
      )} */}
      {generatedImages && generatedImages.length > 0 && (
  <div className="generated-images-container">
    <h2>Generated Images</h2>
    {generatedImages.map((imageUrl, index) => (
      imageUrl.includes("data:image") ? (
        <img
          key={index}
          className="generated-image"
          src={imageUrl}
          alt={`Generated Image ${index + 1}`}
        />
      ) : (
        <p key={index}>Image not found or invalid.</p>
      )
    ))}
  </div>
)}

    </div>
  );
};

export default ImageGenerationForm;
