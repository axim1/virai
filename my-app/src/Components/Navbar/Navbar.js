import React, { useState, useEffect } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import { useNavigate, NavLink } from "react-router-dom";

import styles from './Navbar.module.css'; // Import the CSS module
import virlogo from '../../assets/vector_icons/virai-logo.svg';
import coinIcon from '../../assets/vector_icons/pricing-01 1.svg'
const Navbar = ({ loggedIn,  setLoggedIn = () => {}, onHomeClick,activeLink,setActiveLink}) => {
  const navigate = useNavigate();

  const [navBackground, setNavBackground] = useState(false);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [localActiveLink, setLocalActiveLink] = useState('home');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const currentActive = activeLink || localActiveLink;

  useEffect(() => {
    const handleScroll = () => setNavBackground(window.scrollY >= 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const handleNavClick = (section) => {
    navigate('/', { state: { scrollToSection: section } });
  };
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

  const handleAIToolsClick = () => {
    setActiveLink('ai-tools');
    navigate('/', { state: { scrollToSection: 'tools-section' } });
  };
  const handlePricingClick = () => {
    setActiveLink('pricing');
    navigate('/', { state: { scrollToSection: 'pricing-section' } });
  };
  
  const handleFAQClick = () => {
    setActiveLink('faq');
    navigate('/', { state: { scrollToSection: 'faq-section' } });
  };
  

  const handleHomeClick = () => {
    onHomeClick();
    setActiveLink('home');
  };

  return (
    <nav className={`${styles.navbar} ${navBackground ? styles.navbarSolid : styles.navbarSolid}`}>
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
        <ScrollLink 
  to="pricing-section" 
  smooth={true} 
  duration={50} 
  className={`${styles.navItem} ${activeLink === 'pricing' ? styles.active : ''}`}
  offset={150} 
  // onSetActive={() => setActiveLink('pricing')}
  onClick={handlePricingClick}
>
  Pricing
</ScrollLink>

<ScrollLink 
  to="faq-section" 
  smooth={true} 
  duration={50} 
  className={`${styles.navItem} ${activeLink === 'faq' ? styles.active : ''}`}
  offset={150} 
  onClick={handleFAQClick}
>
  FAQ
</ScrollLink>


        <RouterLink
          to="/gen"
          className={`${styles.navItem} ${activeLink === 'compo' ? styles.active : ''}`}
          onClick={() => setActiveLink('compo')}
        >
          Creation
        </RouterLink>

        <RouterLink
          to="/gallery"
          className={`${styles.navItem} ${activeLink === 'gallery' ? styles.active : ''}`}
          onClick={() => setActiveLink('gallery')}
        >
          Gallery
        </RouterLink>


        {/* <ScrollLink to="gallery-section" smooth={true} duration={50} className={styles.navItem} offset={-150} onSetActive={() => setActiveLink('gallery')}>
          Gallery
        </ScrollLink> */}


<RouterLink
          to="/chat-ai"
          className={`${styles.navItem} ${activeLink === 'chat-ai' ? styles.active : ''}`}
          onClick={() => setActiveLink('chat-ai')}
        >
          Chat AI
        </RouterLink>
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
                  <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between',padding: '24px'}}>
                 <div>
                  <div><strong>{user.fname} {user.lname}</strong></div>
                  <div style={{
                    color:'#999999'
                  }}>{user.email}</div>
                 </div>
                  <div className={styles.coins} style={{width:'50px', height:'50px'}}>
                <img src={coinIcon}/>{user.no_of_images_left}
              </div>
              </div>
                  {/* <div><strong>Images Left:</strong> {user.no_of_images_left}</div> */}
                          <RouterLink to='/user' className={styles.profileButton} >Profile</RouterLink>
                  <button onClick={handleLogout} className={styles.logoutButton} >Logout</button>

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
          <RouterLink to="/signup" className={`${styles.navItem} ${styles.registerButton}`}>Register</RouterLink>
          </> )}
      </div>

      {/* Mobile Menu Icon */}
      <div className={styles.mobileMenuIcon} onClick={toggleMenu}>
        {/* &#9776; */}
        <svg width="45" height="22" viewBox="0 0 45 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="4" width="40.5" height="3.35455" rx="1.67727" fill="#999999"/>
<rect y="9" width="45" height="3.35" rx="1.675" fill="#999999"/>
<rect x="13" y="18" width="31.5" height="3.35455" rx="1.67727" fill="#999999"/>
</svg>

      </div>
    </nav>
  );
};

export default Navbar;
