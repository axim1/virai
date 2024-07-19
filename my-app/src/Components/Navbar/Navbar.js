import React, { useState, useEffect } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [navBackground, setNavBackground] = useState(false);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleScroll = () => {
    if (window.scrollY >= 50) {
      setNavBackground(true);
    } else {
      setNavBackground(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className={`navbar ${navBackground ? 'navbarSolid' : 'navbarTransparent'}`}>
      <div className="navbar-left">
        <div className="navbar-logo">VirtuartAI</div>
        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <ScrollLink to="home-section" smooth={true} duration={500} className="nav-item">Home</ScrollLink>
          <ScrollLink to="gallery-section" smooth={true} duration={500} className="nav-item">Gallery</ScrollLink>
          <ScrollLink to="pricing-section" smooth={true} duration={500} className="nav-item">Pricing</ScrollLink>
          <ScrollLink to="faq-section" smooth={true} duration={500} className="nav-item">FAQ</ScrollLink>
        </div>
        <div className="mobile-menu-icon" onClick={toggleMenu}>
          &#9776;
        </div>
      </div>
      <div className="navbar-right">
        {user ? (
          <div className="nav-item username">Hello, {user.fname}</div>
        ) : (
          <RouterLink to="/login" className="nav-item login-signup">Log in / Sign up</RouterLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
