import React from 'react';
import styles from './ImageGenerator.module.css';

function ImageGenerator() {
  const handleGenerateClick = () => {
    console.log("Generate button clicked"); // Implement your image generation logic here
  };

  return (
    <div className={styles.generatorContainer}>
        <div style={{display:"flex", backgroundColor:"#ededed", width:"100%", borderRadius:"10px"}}>
      <input type="text" placeholder="Generate business images" className={styles.inputField} />
      <button onClick={handleGenerateClick} className={styles.generateButton}>Generate</button>
      </div>
      <div className={styles.tagContainer}>
        <span className={styles.tag}>Creative</span>
        <span className={styles.tag}>Hyperreality</span>
        <span className={styles.tag}>Steampunk</span>
        <span className={styles.tag}>Animation</span>
        <span className={styles.tag}>Business</span>
      </div>
      <div className={styles.limitInfo}>
        Limits per hour: 80 images for all visitors and up to 2 requests from a single visitor. Used: 0 images, 0 requests.
      </div>
    </div>
  );
}

export default ImageGenerator;
