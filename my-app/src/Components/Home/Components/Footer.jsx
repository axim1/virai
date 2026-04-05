import React, { useState, useEffect } from 'react';

import styles from "./Footer.module.css";
import iconsApps from '../../../assets/vector_icons/downloadapp 1.png';
import virai_log from '../../../assets/vector_icons/virai-logo.svg';
import { useNavigate, Link } from "react-router-dom";

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
            <li><Link to="/" className={styles.link}>Home</Link></li>
            <li><Link to="/gallery" className={styles.link}>Gallery</Link></li>
            <li><Link to="/" state={{ scrollToSection: 'pricing-section' }} className={styles.link}>Pricing</Link></li>
            <li>
            {user ? (<button type="button" onClick={handleLogout} className={styles.link} style={{ background: 'none', border: 'none', padding: 0 }}>Log Out</button>):(
              <Link to="/login" className={styles.link}>Log In</Link>
            )}
            </li>
          </ul>
        </div>

        {/* Terms & Conditions */}
        <div className={styles.links}>
          <h3 className={styles.heading}>Terms & Conditions</h3>
          <div className={styles.divider_sml} />

          <ul className={styles.linkList}>
            <li><Link to="/terms-of-service" className={styles.link}>Terms Of Service</Link></li>
            <li><a href={`${supportBase}?subject=Refund%20Policy`} className={styles.link}>Refund Policy</a></li>
            <li><a href="/terms-of-service#privacy-policy" className={styles.link}>Privacy Policy</a></li>
            <li><a href={`${supportBase}?subject=Cookie%20Policy`} className={styles.link}>Cookie Policy</a></li>
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
            <li><Link to="/" state={{ scrollToSection: 'faq-section' }} className={styles.link}>How To Do VirtuartAI</Link></li>
            <li><Link to="/" state={{ scrollToSection: 'pricing-section' }} className={styles.link}>VirtuartAI Pricing</Link></li>
            <li><Link to="/" className={styles.link}>VirtuartAI</Link></li>
            <li><a href={`${supportBase}?subject=VirtuartAI%20Competitors`} className={styles.link}>VirtuartAI Competitors</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
