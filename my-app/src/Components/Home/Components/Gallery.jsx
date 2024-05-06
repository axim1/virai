import React from 'react';
import './Gallery.css'; // Make sure to create this CSS file

// Import images - replace paths with your actual image paths
import largeImage from '../../../assets/Organic shapes mansion on a cliff.jpg';
import mediumImage1 from '../../../assets/Organic shapes mansion on a cliff.jpg';
import mediumImage2 from '../../../assets/Organic shapes mansion on a cliff.jpg';
import smallImage1 from '../../../assets/Organic shapes mansion on a cliff.jpg';
import smallImage2 from '../../../assets/Organic shapes mansion on a cliff.jpg';
import smallImage3 from '../../../assets/Organic shapes mansion on a cliff.jpg';

function Gallery() {
  return (
    <div className="gallery">
      <div className="gallery-item large">
        <img src={largeImage} alt="Large Image" />
      </div>
      <div className="gallery-item medium">
        <img src={mediumImage1} alt="Medium Image 1" />
      </div>
      <div className="gallery-item medium">
        <img src={mediumImage2} alt="Medium Image 2" />
      </div>
      <div className="gallery-item small">
        <img src={smallImage1} alt="Small Image 1" />
      </div>
      <div className="gallery-item small">
        <img src={smallImage2} alt="Small Image 2" />
      </div>
      <div className="gallery-item small">
        <img src={smallImage3} alt="Small Image 3" />
      </div>
    </div>
  );
}

export default Gallery;
