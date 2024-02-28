// Navbar.js
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css'; // Make sure to create and import your Navbar.css

const Navbar = () => {
  const [navBackground, setNavBackground] = useState(false);

  const handleScroll = () => {
    if (window.scrollY >= 50) {
      setNavBackground(true);
    } else {
      setNavBackground(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`navbar ${navBackground ? 'navbarSolid' : 'navbarTransparent'}`}>
      <div className="navbar-logo">VirtuartAI</div>
      <div className="navbar-links">
        <NavLink to="/" exact className="nav-item" activeClassName="active">HOME</NavLink>
        {/* <NavLink to="/about" className="nav-item" activeClassName="active">About</NavLink>
        <NavLink to="/services" className="nav-item" activeClassName="active">Services</NavLink>
        <NavLink to="/contact" className="nav-item" activeClassName="active">Contact</NavLink> */}
        <NavLink to="/login" className="nav-item" activeClassName="active">LOG IN</NavLink>
        <NavLink to="/signup" className="nav-item" activeClassName="active">SIGN UP</NavLink>

      </div>
    </nav>
  );
};

export default Navbar;
