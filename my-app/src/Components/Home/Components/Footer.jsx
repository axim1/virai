import React, { useState, useEffect } from 'react';

import styles from "./Footer.module.css";
import iconsApps from '../../../assets/vector_icons/downloadapp 1.png';
import virai_log from '../../../assets/vector_icons/virai-logo.svg';
import { useNavigate, NavLink } from "react-router-dom";

// my-app/src/assets/vector_icons/virai-logo.svg
const Footer = ({loggedIn,setLoggedIn = () => {}}) => {
    const navigate = useNavigate();
    const supportBase = "mailto:support@virtuartai.com";
  
    const [user, setUser] = useState(null);
    useEffect(() => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {  
        setUser(JSON.parse(storedUser));
        setLoggedIn(true);
      } else {
        setUser(null);
        setLoggedIn(false);
      }
    }, [loggedIn, setLoggedIn]);
    const handleLogout = () => {
      localStorage.removeItem('user');
      setUser(null);
      setLoggedIn(false);
      navigate("/", { replace: true });
  
    };
  return (
    <footer className={styles.footer}>
        <div className={styles.divider} />
      <div className={styles.container}>
        {/* Branding and App Links */}
        <div className={styles.branding}>
        <img src={virai_log} alt="App Store" className={styles.virai_logo} />
        <div className={styles.appLinks}>
            <a href="https://virtuartai.com/" target="_blank" rel="noreferrer">
              <img src={iconsApps} alt="App Store" className={styles.appIcon} />
            </a>
            {/* <img src="/google-play.png" alt="Google Play" className={styles.appIcon} />
            <img src="/microsoft.png" alt="Microsoft Store" className={styles.appIcon} /> */}
          </div>
          <p className={styles.copyright}>© 2025 VirtuartAI</p>
        </div>

        {/* Quick Links */}
        <div className={styles.links}>
          <h3 className={styles.heading}>Quick Links</h3>
          <div className={styles.divider_sml} />

          <ul className={styles.linkList}>
            <li><NavLink to="/" className={styles.link}>Home</NavLink></li>
            <li><NavLink to="/gallery" className={styles.link}>Gallery</NavLink></li>
            <li><NavLink to="/" state={{ scrollToSection: 'pricing-section' }} className={styles.link}>Pricing</NavLink></li>
            <li>
            {user ? (<button type="button" onClick={handleLogout} className={styles.link} style={{ background: 'none', border: 'none', padding: 0 }}>Log Out</button>):(
              <NavLink to="/login" className={styles.link}>Log In</NavLink>
            )}
            </li>
          </ul>
        </div>

        {/* Terms & Conditions */}
        <div className={styles.links}>
          <h3 className={styles.heading}>Terms & Conditions</h3>
          <div className={styles.divider_sml} />

          <ul className={styles.linkList}>
            <li><NavLink to="/terms-of-service" className={styles.link}>Terms Of Service</NavLink></li>
            <li><NavLink to="/terms-of-service" className={styles.link}>Refund Policy</NavLink></li>
            <li><NavLink to="/terms-of-service" className={styles.link}>Privacy Policy</NavLink></li>
            <li><NavLink to="/terms-of-service" className={styles.link}>Cookie Policy</NavLink></li>
          </ul>
        </div>

        {/* Work With Us & Blog */}
        <div className={styles.links}>
          <h3 className={styles.heading}>Work With Us</h3>
          <div className={styles.divider_sml} />

          <ul className={styles.linkList}>
            <li><a href={`${supportBase}?subject=Affiliate%20Program`} className={styles.link}>Affiliate Program</a></li>
            <li><a href={`${supportBase}?subject=Whitelabel%20Program`} className={styles.link}>Whitelabel Program</a></li>
            <li><a href={`${supportBase}?subject=API%20Access`} className={styles.link}>API Access</a></li>
            <li><a href={`${supportBase}?subject=MLS%20Partnership`} className={styles.link}>MLS Partnership</a></li>
          </ul></div>
        <div className={styles.links}>
          <h3 className={styles.heading}>Blog</h3>
          <div className={styles.divider_sml} />

          <ul className={styles.linkList}>
            <li><a href="https://virtuartai.com/" className={styles.link} target="_blank" rel="noreferrer">How To Do VirtuartAI</a></li>
            <li><a href="https://virtuartai.com/" className={styles.link} target="_blank" rel="noreferrer">VirtuartAI Pricing</a></li>
            <li><a href="https://virtuartai.com/" className={styles.link} target="_blank" rel="noreferrer">VirtuartAI</a></li>
            <li><a href="https://virtuartai.com/" className={styles.link} target="_blank" rel="noreferrer">VirtuartAI Competitors</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
