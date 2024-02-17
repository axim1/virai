// ImageLibrary.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ImageLibrary.css"; // Import the stylesheet

const ImageLibrary = ({ userId }) => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/images/${userId}`);
        setImages(response.data.images);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
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
      </div>

      {selectedImage && (
        <div className="preview-modal">
          <div className="modal-content">
            <span className="close" onClick={closePreview}>&times;</span>
            <img src={selectedImage} alt="Preview" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageLibrary;
