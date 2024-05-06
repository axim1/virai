import React from 'react';
import './FeaturesSection.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain, faFaceSmile, faCamera, faGears } from '@fortawesome/free-solid-svg-icons';

function FeaturesSection() {
  return (
    <div className="features-section">
      <div className="feature-item">
        <FontAwesomeIcon icon={faBrain} size="3x" />
        <p>Natural Language</p>
      </div>
      <div className="feature-item">
        <FontAwesomeIcon icon={faFaceSmile} size="3x" />
        <p>Face Recognition</p>
      </div>
      <div className="feature-item">
        <FontAwesomeIcon icon={faCamera} size="3x" />
        <p>Computer Vision</p>
      </div>
      <div className="feature-item">
        <FontAwesomeIcon icon={faGears} size="3x" />
        <p>Automated Reasoning</p>
      </div>
    </div>
  );
}

export default FeaturesSection;
