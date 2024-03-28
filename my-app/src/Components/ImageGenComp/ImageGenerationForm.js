import React, { useState } from "react";
import axios from "axios";
import "./ImageGenerationForm.css";
const apiUrl = process.env.REACT_APP_API_URL;

const ImageGenerationForm = ({ username, onGenerateImage }) => {

  const [isLoading, setIsLoading] = useState(false); // New loading state

 
  const [apiType, setApiType] = useState("generate-image"); // State to track selected API type
  const [generatorType, setGeneratorType] = useState("");
  const [promptText, setPromptText] = useState("");
  const [negativePromptText, setNegativePromptText] = useState("");
  const [styleType, setStyleType] = useState("default");
  const [aspectRatio, setAspectRatio] = useState("");
  const [scale, setScale] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null); // State for uploaded sketch image
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(false); // Defaults to not maintaining aspect ratio

  const [imageWidth, setImageWidth] = useState(512); // Default width
  const [imageHeight, setImageHeight] = useState(512); // Default height
  const handleWidthChange = (event) => {
    setImageWidth(Number(event.target.value) || 0); // Convert to number and ensure a fallback value
  };

  const handleHeightChange = (event) => {
    setImageHeight(Number(event.target.value) || 0); // Convert to number and ensure a fallback value
  };

  // Handler for style type change
  const handleStyleTypeChange = (event) => {
    console.log(event.target.value)
    setStyleType(event.target.value);
  };
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

    setIsLoading(true); // Start loading

    if (!isFormValid) {
      setIsLoading(false); // Stop loading if form is not valid
      return;
    }

    try {
      const formData = new FormData();
      formData.append("generatorType", generatorType);
      console.log("Prompt text before appending:", promptText); // Add this line for debugging
      formData.append("prompt", promptText);
      console.log("style type = ", styleType)
      formData.append("negativePromptText", negativePromptText);
      formData.append("styleType", styleType);
      formData.append("aspectRatio", aspectRatio);
      formData.append("scale", scale);
      formData.append("userId", username._id);
      formData.append("width", imageWidth);
      formData.append("height", imageHeight);
      formData.append("maintainAspectRatio",  maintainAspectRatio.toString());

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
      setIsLoading(false); // Stop loading after API call

    }
    setIsLoading(false); // Stop loading after API call

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


  return (
    <div className="form-container">
      <h1>Image Generation Form</h1>
  

         <div className="div-cont">
        <label>Choose API Type:</label>
        <select value={apiType} onChange={handleApiTypeChange}>
          <option value="generate-image">Generate Image</option>
          <option value="sketch-to-image">Sketch to Image</option>
        </select>
      </div>



      {apiType === "sketch-to-image" && (
        <div className="div-cont div-cont-choosefile">
          <label>Upload Sketch:</label>
          <input  className="input-field2" type="file" name="sketch_image" onChange={handleImageUpload} />
        </div>
      )}

      {/* Style Selection */}
      <div className="div-cont">
        <label>Style of Image:</label>
        <select value={styleType} onChange={handleStyleTypeChange}>
        <option value="default">Default</option>

          <option value="architecture_drawing">Architecture Drawing</option>
          <option value="exterior_fantasy">Exterior Fantasy</option>
          <option value="exterior_modern">Exterior Modern</option>
          <option value="garden">Garden</option>
          <option value="floor_plan">Floor Plan</option>
          <option value="interior_cosy">Interior Cosy</option>
          <option value="interior_modern">Interior Modern</option>
          <option value="interior_painted">Interior Painted</option>
          <option value="marker_sketch">Marker Sketch</option>
          <option value="technical_drawing">Technical Drawing</option>
        </select>
      </div>
      <div style={{display:"flex", justifyContent:"space-between", width:"100%", maxWidth:"500px"}}>
            {/* Input fields for width and height */}
            <div className="div-cont">
        <label>Width:</label>
        <input
          type="number"
          className="input-field2"
          value={imageWidth}
          onChange={handleWidthChange}
          min="1" // Optional: Set minimum value to prevent 0 or negative numbers
        />
      </div>

      <div className="div-cont">
        <label>Height:</label>
        <input
          type="number"
          className="input-field2"
          value={imageHeight}
          onChange={handleHeightChange}
          min="1" // Optional: Set minimum value to prevent 0 or negative numbers
        />
      </div>

      </div>
      {/* TextBar for prompts */}
      <div className="div-cont">
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
      <div className="div-cont">
        <label>Text for negative prompts</label>
        <input
          className="input-field"
          type="text"
          value={negativePromptText}
          onChange={(e) => handleTextChange("Text for negative prompts", e.target.value)}
        />
      </div>
      <div className="div-cont">
  <label>
    <input
      type="checkbox"
      checked={maintainAspectRatio}
      onChange={(e) => setMaintainAspectRatio(e.target.checked)}
    />
    Maintain Aspect Ratio
  </label>
</div>

      {/* Style Selection */}
  
      {/* Additional input fields for aspect ratio and scale */}
      {/* <div className="button-container ">
        <button className="button" onClick={handleGenerateImage}             disabled={!isFormValid}  // Button is disabled if form is not valid
>
          Generate Image
        </button>

      </div> */}
  
  <div className="button-container">
        <button className="button" onClick={handleGenerateImage} disabled={isLoading || !isFormValid}>
          {isLoading ? "Generating..." : "Generate Image"} {/* Change button text based on loading state */}
        </button>
        {isLoading && <div className="spinner"></div>} {/* Show spinner when loading */}
      </div>



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
