import React, { useState, useEffect } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink, useNavigate, NavLink, useLocation } from 'react-router-dom';

import styles from './Navbar.module.css';
import virlogo from '../../assets/vector_icons/virai-logo.svg';
import coinIcon from '../../assets/vector_icons/pricing-01 1.svg';

const Navbar = ({ loggedIn, setLoggedIn = () => {}, onHomeClick = () => {}, activeLink, setActiveLink = () => {} }) => {
  const navigate = useNavigate();
  const location = useLocation();

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

  // Close mobile menu on any route/hash change
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname, location.hash]);

  // Close mobile menu if viewport grows to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1024 && menuOpen) setMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [menuOpen]);

  // Sync user from localStorage; avoid loop by removing `user` from deps
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

  const toggleMenu = () => setMenuOpen(o => !o);
  const toggleDropdown = () => setDropdownOpen(o => !o);
  const closeMenu = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setLoggedIn(false);
    navigate('/', { replace: true });
    closeMenu();
  };

  const handleNavClick = (section) => {
    // Navigates home and scrolls (your home page should handle `scrollToSection` state)
    navigate('/', { state: { scrollToSection: section } });
    closeMenu();
  };

  const handleAIToolsClick = () => {
    setActiveLink('ai-tools');
    handleNavClick('tools-section');
  };

  const handlePricingClick = () => {
    setActiveLink('pricing');
    handleNavClick('pricing-section');
  };

  const handleFAQClick = () => {
    setActiveLink('faq');
    handleNavClick('faq-section');
  };

  const handleHomeClick = () => {
    onHomeClick();
    setActiveLink('home');
    closeMenu();
  };

  return (
    <nav
      className={`${styles.navbar} ${navBackground ? styles.navbarSolid : styles.navbarSolid}`}
      role="navigation"
      aria-label="Main"
    >
      <div className={styles.navbarLeft}>
        <img
          src={virlogo}
          alt="VirtuartAI Logo"
          className={styles.navbarLogo}
          onClick={handleHomeClick}
          role="button"
          aria-label="Go to home"
        />
      </div>

      {/* Center links */}
      <div className={`${styles.navbarLinks} ${menuOpen ? styles.open : ''}`}>
        <RouterLink
          to="/"
          onClick={handleHomeClick}
          className={`${styles.navItem} ${currentActive === 'home' ? styles.active : ''}`}
        >
          Home
        </RouterLink>

        <ScrollLink
          to="tools-section"
          smooth
          duration={50}
          className={`${styles.navItem} ${currentActive === 'ai-tools' ? styles.active : ''}`}
          onClick={handleAIToolsClick}
          offset={-70}
        >
          AI Tools
        </ScrollLink>

        <ScrollLink
          to="pricing-section"
          smooth
          duration={50}
          className={`${styles.navItem} ${currentActive === 'pricing' ? styles.active : ''}`}
          offset={150}
          onClick={handlePricingClick}
        >
          Pricing
        </ScrollLink>

        <ScrollLink
          to="faq-section"
          smooth
          duration={50}
          className={`${styles.navItem} ${currentActive === 'faq' ? styles.active : ''}`}
          offset={150}
          onClick={handleFAQClick}
        >
          FAQ
        </ScrollLink>

        <NavLink
          to="/gen"
          onClick={() => { setActiveLink('compo'); closeMenu(); }}
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          Creation
        </NavLink>

        <NavLink
          to="/gallery"
          onClick={() => { setActiveLink('gallery'); closeMenu(); }}
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          Gallery
        </NavLink>

        <NavLink
          to="/chat-ai"
          onClick={() => { setActiveLink('chat-ai'); closeMenu(); }}
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          Chat AI
        </NavLink>
      </div>

      {/* Right section */}
      <div className={styles.navbarRight}>
        {user ? (
          <>
            <div className={styles.usernameContainer} onClick={toggleDropdown}>
              <div className={`${styles.navItem} ${styles.myAccountButton}`} aria-haspopup="true" aria-expanded={dropdownOpen}>
                MY ACCOUNT
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="6" viewBox="0 0 14 6" fill="none" aria-hidden="true">
                  <path d="M7 6L13.0622 0.75H0.937822L7 6Z" fill="#2E8B57"/>
                </svg>
              </div>

              {dropdownOpen && (
                <div className={styles.userDropdown}>
                  <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', padding: '14px'}}>
                    <div>
                      <div><strong>{user.fname} {user.lname}</strong></div>
                      <div style={{ color:'#999999' }}>{user.email}</div>
                    </div>

                    <div className={styles.coins} style={{maxWidth:'200px', maxHeight:'50px'}}>
                      <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'center', height:'100%', width:'100%'}}>
                        <div style={{height:'16px', width:'22px'}}><img src={coinIcon} alt="" /></div>
                        <div style={{fontSize:'14px'}}>{user.no_of_images_left}</div>
                      </div>
                      <div className={styles.subscriptionPlanText}>
                        {user.subscription?.name || 'No Plan'}
                      </div>
                    </div>
                  </div>

                  <RouterLink to="/user" className={styles.profileButton} onClick={closeMenu}>Profile</RouterLink>
                  <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
                </div>
              )}
            </div>

            <div className={styles.coins}>
              <img src={coinIcon} alt="" />{user.no_of_images_left}
            </div>
          </>
        ) : (
          <>
            <RouterLink to="/login" className={`${styles.navItem} ${styles.loginButton}`} onClick={closeMenu}>Sign in</RouterLink>
            <RouterLink to="/signup" className={`${styles.navItem} ${styles.registerButton}`} onClick={closeMenu}>Register</RouterLink>
          </>
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        className={styles.mobileMenuIcon}
        onClick={toggleMenu}
        style={{ outline: 'none' , border: 'none', background: 'transparent'}}
        aria-label="Toggle menu"
        aria-controls="mobile-nav"
        aria-expanded={menuOpen}
      >
        <svg width="45" height="22" viewBox="0 0 45 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" width="40.5" height="3.35455" rx="1.67727" fill="#999999"/>
          <rect y="9" width="45" height="3.35" rx="1.675" fill="#999999"/>
          <rect x="13" y="18" width="31.5" height="3.35455" rx="1.67727" fill="#999999"/>
        </svg>
      </button>
    </nav>
  );
};

export default Navbar;
