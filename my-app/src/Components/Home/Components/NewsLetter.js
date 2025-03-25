import React from "react";
import styles from "./NewsLetter.module.css";
import fb from '../../../assets/vector_icons/facebook 1.svg';
import ins from '../../../assets/vector_icons/instagram 1.svg';
import ln from '../../../assets/vector_icons/linkdin 1.svg';
import tw from '../../../assets/vector_icons/twitter 1.svg';

const NewsLetter = () => {
  return (
    <div className={styles.footer}>
      <div className={styles.section}>
        <h3 className={styles.title}>Newsletter</h3>
        <p className={styles.subtitle}>STAY CONNECTED</p>
        <div className={styles.inputContainer}>
          <input type="email" placeholder="Enter your Email" className={styles.input} />
          <button className={styles.button}>SIGN UP</button>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.title}>Social Media</h3>
        <p className={styles.subtitle}>JOIN OUR COMMUNITY</p>
        <div className={styles.icons}>
          <img src={fb} className={styles.icon} alt="Facebook" />
          <img src={ins} className={styles.icon} alt="Instagram" />
          <img src={ln} className={styles.icon} alt="LinkedIn" />
          <img src={tw} className={styles.icon} alt="Twitter" />
        </div>
      </div>
    </div>
  );
};

export default NewsLetter;
