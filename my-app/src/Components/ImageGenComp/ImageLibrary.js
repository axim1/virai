// ImageLibrary.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ImageLibrary.css"; // Import the stylesheet
const apiUrl = process.env.REACT_APP_API_URL;

const ImageLibrary = ({ userId }) => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // State to track loading

  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true); // Start loading

      try {
        const response = await axios.get(`${apiUrl}images/${userId}`);
        setImages(response.data.images.reverse());
      } catch (error) {
        console.error("Error fetching images:", error);
      }
      setIsLoading(false); // Start loading

    };

    fetchImages();
  }, [userId]);

  const downloadImage = (url, filename) => {
    const link = document.createElement("a");
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

  return (
    <div className="image-library-container">
      <h2>Image Library</h2>
      {isLoading ? (
        <div className="loading-indicator">Loading...</div> // Display loading indicator
      ) : (
      <div className="image-grid">
        {images.map((image, index) => (
          <div className="image-item" key={index}>
            <img
              src={image}
              alt={`Generated Image ${index}`}
              onClick={() => openPreview(image)}
            />
            <div className="image-overlay">
              <button className="download-button" onClick={() => downloadImage(image, `Generated_Image_${index}.jpeg`)}>
                Download
              </button>
              <button className="preview-button" onClick={() => openPreview(image)}>
                Preview
              </button>
            </div>
          </div>
        ))}
      </div>)}
      {selectedImage && (
      <div className="preview-modal" onClick={closePreview}> {/* Add onClick event to close the modal when the backdrop is clicked */}
        <div className="modal-content" onClick={e => e.stopPropagation()}> {/* Prevent click inside the modal from closing it */}
          <span className="close" onClick={closePreview}>&times;</span>
          <img src={selectedImage} alt="Preview" />
        </div>
      </div>
    )}
    </div>
  );
};

export default ImageLibrary;
