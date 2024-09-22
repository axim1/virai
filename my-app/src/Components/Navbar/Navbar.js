import React, { useState, useEffect } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import './Navbar.css';
import { scroller } from 'react-scroll';

const Navbar = ({loggedIn,setLoggedIn,onAIToolsClick, onHomeClick }) => {
  const [navBackground, setNavBackground] = useState(false);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  // const [loggedIn, setLoggedIn] = useState(false); 
  const [activeLink, setActiveLink] = useState('home'); // State for active link
  const [dropdownOpen, setDropdownOpen] = useState(false); // State for the dropdown

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

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setLoggedIn(true);
    }
  }, [loggedIn]);
// [loggedIn, user]
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null); // Clear user state
    setLoggedIn(false); // Update the loggedIn state
  };
  const handleAIToolsClick = async () => {
    onHomeClick();
    await delay(500); // Delay the API call by 2 seconds

    onAIToolsClick(); // Trigger the hero shrinking effect
    setActiveLink('ai-tools'); // Set active link to "AI Tools"
  

  };
  
  const handleHomeClick = () => {
    onHomeClick(); // Reset everything to the original state when "Home" is clicked
    setActiveLink('home'); // Set active link to "Home"
  };

  const handleSectionLinkClick = (section) => {
    setActiveLink(section); // Set active link based on the section
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className={`navbar ${navBackground ? 'navbarSolid' : 'navbarTransparent'}`}>
      <div className="navbar-left">
        <div className="navbar-logo">VirtuartAI</div>
        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {/* <ScrollLink
            to="home-section"
            smooth={true}
            duration={50}
            className={`nav-item ${activeLink === 'home' ? 'active' : ''}`} // Apply active class if "Home" is active
            onClick={handleHomeClick} // Trigger reset when "Home" is clicked
          >
            Home
          </ScrollLink> */}
                    <RouterLink to="/" onClick={handleHomeClick}
                                className={`nav-item ${activeLink === 'home' ? 'active' : ''}`} // Add active class if the link is active
                    >
            Home
          </RouterLink>
          <ScrollLink
            to="tools-section"
            smooth={true}
            duration={50}
            className={`nav-item ${activeLink === 'ai-tools' ? 'active' : ''}`} // Apply active class if "AI Tools" is active
            onClick={handleAIToolsClick} // Trigger the shrinking effect when "AI Tools" is clicked
            offset={-100} // Adjust this value to scroll higher and show the hero section as well

          >
            AI Tools
          </ScrollLink>          
          {/* Compo link using RouterLink */}
          <RouterLink
            to="/gen"
            className={`nav-item ${activeLink === 'compo' ? 'active' : ''}`} // Add active class if the link is active
            onClick={() => setActiveLink('compo')}
          >
            Creation
          </RouterLink>
                    <ScrollLink
            to="gallery-section"
            smooth={true}
            duration={50}
            className="nav-item"
            activeClass="active"
            spy={true}
            offset={-150}
            onSetActive={() => handleSectionLinkClick('gallery')}
          >
            Gallery
          </ScrollLink>
          <ScrollLink
            to="pricing-section"
            smooth={true}
            duration={50}
            className="nav-item"
            activeClass="active"
            spy={true}
            offset={-150}
            onSetActive={() => handleSectionLinkClick('pricing')}
          >
            Pricing
          </ScrollLink>
          <ScrollLink
            to="faq-section"
            smooth={true}
            duration={50}
            className="nav-item"
            activeClass="active"
            spy={true}
            offset={-150}
            onSetActive={() => handleSectionLinkClick('faq')}
          >
            FAQ
          </ScrollLink>
        </div>
        <div className="mobile-menu-icon" onClick={toggleMenu}>
          &#9776;
        </div>
      </div>
      <div className="navbar-right">
        {user ? (
          <>
            <div className="username-container" onClick={toggleDropdown}>
              <div className="username">Hello, {user.fname}</div>
              {dropdownOpen && (
                <div className="user-dropdown">
                  <div><strong>{user.fname} {user.lname}</strong></div>
                  <div><strong>Email:</strong> {user.email}</div>
                  <div><strong>Images Left:</strong> {user.no_of_images_left}</div>
                </div>
              )}
            </div>
            <button onClick={handleLogout} className="nav-item logout-button">Logout</button>
          </>
        ) : (
          <RouterLink to="/login" className="nav-item login-signup">Log in / Sign up</RouterLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
