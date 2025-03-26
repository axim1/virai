import React, { useState, useEffect } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import { useNavigate, NavLink } from "react-router-dom";

import styles from './Navbar.module.css'; // Import the CSS module
import virlogo from '../../assets/vector_icons/virai-logo.svg';
import coinIcon from '../../assets/vector_icons/pricing-01 1.svg'
const Navbar = ({ loggedIn,  setLoggedIn = () => {}, onAIToolsClick, onHomeClick }) => {
  const navigate = useNavigate();

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

  // useEffect(() => {
  //   const storedUser = localStorage.getItem('user');
  //   if (storedUser && setLoggedIn) {  // ✅ Ensure setLoggedIn is defined
  //     setUser(JSON.parse(storedUser));
  //     setLoggedIn(true);
  //   }
  // }, [loggedIn]); // ✅ Correct dependency array
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {  
      setUser(JSON.parse(storedUser));
      setLoggedIn(true);
    } else {
      setUser(null);
      setLoggedIn(false);
    }
  }, [loggedIn,user]); // ✅ Add 'loggedIn' as a dependency
  
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setLoggedIn(false);
    navigate("/", { replace: true });

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
              {/* <div className={styles.username}>Hello, {user.fname}</div> */}
              <div  className={`${styles.navItem} ${styles.myAccountButton}`}>MY ACCOUNT

              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="6" viewBox="0 0 14 6" fill="none">
<path d="M7 6L13.0622 0.75H0.937822L7 6Z" fill="#2E8B57"/>
</svg>
              </div>

              {dropdownOpen && (
                <div className={styles.userDropdown}>
                  <div><strong>{user.fname} {user.lname}</strong></div>
                  <div><strong>Email:</strong> {user.email}</div>
                  <div><strong>Images Left:</strong> {user.no_of_images_left}</div>
                  <button onClick={handleLogout} className={styles.navItem}>Logout</button>

                </div>

              )}

      
            </div>
            <div className={styles.coins}>
                <img src={coinIcon}/>{user.no_of_images_left}
              </div>
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
