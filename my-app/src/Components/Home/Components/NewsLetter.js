import React from "react";
import styles from "./NewsLetter.module.css";
import { NavLink } from "react-router-dom";
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
          <NavLink to="/signup" className={styles.button}>SIGN UP</NavLink>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.title}>Social Media</h3>
        <p className={styles.subtitle}>JOIN OUR COMMUNITY</p>
        <div className={styles.icons}>
          <a href="https://www.facebook.com/" target="_blank" rel="noreferrer"><img src={fb} className={styles.icon} alt="Facebook" /></a>
          <a href="https://www.instagram.com/" target="_blank" rel="noreferrer"><img src={ins} className={styles.icon} alt="Instagram" /></a>
          <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer"><img src={ln} className={styles.icon} alt="LinkedIn" /></a>
          <a href="https://x.com/" target="_blank" rel="noreferrer"><img src={tw} className={styles.icon} alt="Twitter" /></a>
        </div>
      </div>
    </div>
  );
};

export default NewsLetter;
