import React, { useState, useEffect } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import styles from './Navbar.module.css'; // Import the CSS module
import virlogo from '../../assets/vector_icons/virai-logo.svg';

const Navbar = ({ loggedIn, setLoggedIn, onAIToolsClick, onHomeClick }) => {
  const [navBackground, setNavBackground] = useState(false);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('home');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setNavBackground(window.scrollY >= 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setLoggedIn(true);
    }
  }, [loggedIn]);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setLoggedIn(false);
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleAIToolsClick = async () => {
    onHomeClick();
    await delay(500);
    onAIToolsClick();
    setActiveLink('ai-tools');
  };

  const handleHomeClick = () => {
    onHomeClick();
    setActiveLink('home');
  };

  return (
    <nav className={`${styles.navbar} ${navBackground ? styles.navbarSolid : styles.navbarTransparent}`}>
      <div className={styles.navbarLeft}>
        <img src={virlogo} alt="VirtuartAI Logo" className={styles.navbarLogo} />
      </div>

      {/* Navbar Links */}
      <div className={`${styles.navbarLinks} ${menuOpen ? styles.open : ''}`}>
        <RouterLink 
          to="/" 
          onClick={handleHomeClick} 
          className={`${styles.navItem} ${activeLink === 'home' ? styles.active : ''}`}
        >
          Home
        </RouterLink>

        <ScrollLink
          to="tools-section"
          smooth={true}
          duration={50}
          className={`${styles.navItem} ${activeLink === 'ai-tools' ? styles.active : ''}`}
          onClick={handleAIToolsClick}
        >
          AI Tools
        </ScrollLink>

        <RouterLink
          to="/gen"
          className={`${styles.navItem} ${activeLink === 'compo' ? styles.active : ''}`}
          onClick={() => setActiveLink('compo')}
        >
          Creation
        </RouterLink>

        <ScrollLink to="gallery-section" smooth={true} duration={50} className={styles.navItem} offset={-150} onSetActive={() => setActiveLink('gallery')}>
          Gallery
        </ScrollLink>

        <ScrollLink to="pricing-section" smooth={true} duration={50} className={styles.navItem} offset={-150} onSetActive={() => setActiveLink('pricing')}>
          Pricing
        </ScrollLink>

        <ScrollLink to="faq-section" smooth={true} duration={50} className={styles.navItem} offset={-150} onSetActive={() => setActiveLink('faq')}>
          FAQ
        </ScrollLink>
      </div>

      {/* User & Login/Signup Section */}
      <div className={styles.navbarRight}>
        {user ? (
          <>
            <div className={styles.usernameContainer} onClick={toggleDropdown}>
              <div className={styles.username}>Hello, {user.fname}</div>
              {dropdownOpen && (
                <div className={styles.userDropdown}>
                  <div><strong>{user.fname} {user.lname}</strong></div>
                  <div><strong>Email:</strong> {user.email}</div>
                  <div><strong>Images Left:</strong> {user.no_of_images_left}</div>
                </div>
              )}
            </div>
            <button onClick={handleLogout} className={`${styles.navItem} ${styles.logoutButton}`}>Logout</button>
          </>
        ) : (
          <>
          <RouterLink to="/login" className={`${styles.navItem} ${styles.loginButton}`}>Sign in</RouterLink>
          <RouterLink to="/register" className={`${styles.navItem} ${styles.registerButton}`}>Register</RouterLink>
          </> )}
      </div>

      {/* Mobile Menu Icon */}
      <div className={styles.mobileMenuIcon} onClick={toggleMenu}>
        &#9776;
      </div>
    </nav>
  );
};

export default Navbar;
