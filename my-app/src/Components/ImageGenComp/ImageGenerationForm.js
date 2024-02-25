import React, { useState } from "react";
import axios from "axios";
import StyleSelection from "./StyleSelection";
import "./ImageGenerationForm.css";
const apiUrl = process.env.REACT_APP_API_URL;

const ImageGenerationForm = ({ username, onGenerateImage }) => {
  const [generatorType, setGeneratorType] = useState("");
  const [promptText, setPromptText] = useState("");
  const [negativePromptText, setNegativePromptText] = useState("");
  const [styleType, setStyleType] = useState("");
  const [aspectRatio, setAspectRatio] = useState("");
  const [scale, setScale] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false); // New state to track form submission

  const [generatedImages, setGeneratedImages] = useState([]); // State to store generated images
  console.log("inside generator",username._id);

  const handleGeneratorSelect = (generatorType) => {
    setGeneratorType(generatorType);
  };

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

  const handleGenerateImage = async () => {

    setFormSubmitted(true)

    if (!isFormValid) {return}
    try {
      // Make a POST request to the image generation API
   

      const response = await axios.post(`${apiUrl}generate-image`, {
        generatorType,
        promptText,
        negativePromptText,
        styleType,
        aspectRatio,
        scale,
        userId: username._id,
      });

      // Log the generated image URLs
      console.log("Generated Image URLs:", response.data.imageUrls);

      // Update the state with the generated images
      setGeneratedImages(response.data.imageUrls);

      // Call the callback function for further actions (e.g., displaying the images)
      onGenerateImage(response.data.imageUrls);
    } catch (error) {
      console.error("Error generating image:", error);
    }

    // Reset form state
    // setGeneratorType("");
    // setPromptText("");
    // setNegativePromptText("");
    // setStyleType("");
    // setAspectRatio("");
    // setScale("");
  };
  const isFormValid = promptText.trim() !== ''; // Checks if promptText is not just empty spaces

  return (
    <div className="form-container">
      <h1>Image Generation Form</h1>
  
      {/* Generator Selection */}
      <div className="button-container">
        <button className="button-2d" onClick={() => handleGeneratorSelect("2D")}>
          2D
        </button>
        <button className="button-3d" onClick={() => handleGeneratorSelect("3D")}>
          3D
        </button>
      </div>
  
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
      <StyleSelection onSelectStyle={setStyleType} />
  
      {/* Additional input fields for aspect ratio and scale */}
      <div className="button-container">
        <button className="button" onClick={handleGenerateImage}             disabled={!isFormValid}  // Button is disabled if form is not valid
>
          Generate Image
        </button>

      </div>
  
      {/* Display generated images below the form */}
      {generatedImages.length > 0 && (
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
      )}
    </div>
  );
};

export default ImageGenerationForm;
