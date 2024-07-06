import React, { useState, useEffect } from 'react';
import { Link } from 'react-scroll';
import './Navbar.css';

const Navbar = () => {
  const [navBackground, setNavBackground] = useState(false);
  const [user, setUser] = useState(null);

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

  return (
    <nav className={`navbar ${navBackground ? 'navbarSolid' : 'navbarTransparent'}`}>
      <div className="navbar-left">
        <div className="navbar-logo">VirtuartAI</div>
        <div className="navbar-links">
          <Link to="home-section" smooth={true} duration={500} className="nav-item">Home</Link>
          <Link to="gallery-section" smooth={true} duration={500} className="nav-item">Gallery</Link>
          <Link to="pricing-section" smooth={true} duration={500} className="nav-item">Pricing</Link>
          <Link to="faq-section" smooth={true} duration={500} className="nav-item">FAQ</Link>
        </div>
      </div>
      <div className="navbar-right">
        {user ? (
          <div className="nav-item username">Hello, {user.fname}</div>
        ) : (
          <Link to="login-section" smooth={true} duration={500} className="nav-item login-signup">Log in / Sign up</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
