import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";

import './Home.css'; // Your CSS file for styling
import { Link } from 'react-router-dom'; // Ensure you are using react-router-dom for navigation

import wsImage from '../../assets/House_sketch to image.jpg'; // Replace with your image path
import wsImage1 from '../../assets/House_sketch-to-image_web.jpg'; // Replace with your image path
import wsImage2 from '../../assets/Organic shapes mansion on a cliff.jpg'; // Replace with your image path
import wsImage3 from '../../assets/3D object chair.jpg'; // Replace with your image path
import wsImage4 from '../../assets/3D object chair 02.jpg'; // Replace with your image path
import wsImage5 from '../../assets/House_sketch-to-image_web.jpg'; // Replace with your image path
import './Switcher.css';
import Navbar from '../Navbar/Navbar';
import ImageSlider from './Components/ImageSlider';
import FeaturesSection from './Components/FeaturesSection';
import Gallery from './Components/Gallery';
import TestimonialCarousel from './Components/TestimonialCarousel';
import ImageLibrary from '../ImageGenComp-legacy/ImageLibrary';
import PricingSection from './Components/PricingSection';
import FAQ from '../FAQ/faq';
import AITools from './Components/AITools';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComputerMouse } from '@fortawesome/free-solid-svg-icons';
import Footer from './Components/Footer';

const username = JSON.parse(localStorage.getItem('user')) || {};
const userId = username._id;

function Home({ triggerShrink }) {
  const [generatedImages, setGeneratedImages] = useState([]); // State to store generated images
  const [scrollY, setScrollY] = useState(0);
//   const [triggerShrink, setLocalTriggerShrink] = useState(triggerShrink);
const location = useLocation();

useEffect(() => {
  const queryParams = new URLSearchParams(location.search);
  const status = queryParams.get("status");
  const userId = queryParams.get("user");

  if (status === "success" && userId) {
    // Fetch updated user data from the backend
    fetch(`http://localhost:8000/api/user/${userId}`)
      .then((response) => response.json())
      .then((data) => {
        // Update localStorage with the new user data
        localStorage.setItem("user", JSON.stringify(data.user));
        window.alert("User updated successfully!");
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  } else if (status === "failed") {
    window.alert("Payment failed. Please try again.");
  }
}, [location.search]);



  useEffect(() => {
    const handleScroll = () => {
      if (!triggerShrink) {
        setScrollY(window.scrollY);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [triggerShrink]);

  useEffect(() => {
    if (triggerShrink) {
      // Trigger the "scrolled" effect for the hero and AI tools section
      setScrollY(200);
    }
  }, [triggerShrink]);

  const heroHeight = triggerShrink ? 50 : Math.max(50, 100 - scrollY * 0.5); // Shrinks the hero section on scroll or when triggered
  const heroStyle = {

    height: `${heroHeight}vh`,
    transition: 'height 0.3s ease',
  };

  const toolsStyle = {
    opacity: triggerShrink || scrollY > 50 ? 1 : 0, // AI tools appear either on scroll or on trigger
    transform: `translateY(${triggerShrink || scrollY > 50 ? 0 : 20}px)`, // Controls smooth sliding effect
    transition: 'opacity 0.5s ease, transform 0.5s ease',
  };

//   const handleAIToolsClick = () => {
//     setLocalTriggerShrink(true);
//   };

//   const handleHomeClick = () => {
//     // Reset everything to the original state when "Home" is clicked
//     setLocalTriggerShrink(false);
//     setScrollY(0);
//     window.scrollTo(0, 0); // Scroll back to the top
//   };

  const toolsHeaderStyle = {
    position: scrollY > 1 ? 'relative' : 'fixed',
    bottom: scrollY > 30 ? 'auto' : '80px',
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: 10,
    transform: `translateY(${triggerShrink || scrollY > 50 ? 0 : 20}px)`, // Controls smooth sliding effect
    opacity: triggerShrink || scrollY > 50 || scrollY < 1 ? 1 : scrollY * 0.01, // AI tools appear either on scroll or on trigger
    transition: 'transform 0.7s ease, position 0.7s ease, bottom 0.7s ease, opacity 0.7s ease',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const mouseIconStyle = {
    position: 'relative',
    bottom: 'auto',
    zIndex: 10,
    transform: `translateY(${scrollY > 50 ? 20 : 0}px)`, // Controls smooth sliding effect
    opacity: scrollY < 20 ? 1 - scrollY / 20 : 0, // Gradually fades out as you scroll
    transition: 'opacity 0.7s ease, transform 0.7s ease',
    color: '#fff',
    display: scrollY < 20 ? 'flex' : 'none', // Completely hide after fading out
    flexDirection: 'column',
    alignItems: 'center',
  };

  return (
    <div style={{ backgroundColor: "#13181d" }}>
      {/* Pass down onAIToolsClick and onHomeClick props */}
      {/* <Navbar onAIToolsClick={handleAIToolsClick} onHomeClick={handleHomeClick} /> */}

      {/* Hero Section */}
      <div className="herosection" style={heroStyle}>
        <div className="content-herosection">
          <h1 className="firstheading" >You Don‘t Need Eyes To See</h1>
          <h1 className="secheading"  >YOU NEED VISION</h1>
          <h1 className="thirdheading"  >Create beautiful art with Artificial Intelligence</h1>
          <p>Your Vision Becomes Reality. Experience the breathtaking AI tools while creating your digital art. Create stunning inspirations in architecture. Unleash your imagination and transform it into reality.</p>
        </div>
      </div>

      {/* AI Tools Header */}
      <div style={toolsHeaderStyle}>
        <p style={{ fontSize: "25px", fontWeight: "lighter" }}>AI TOOLS</p>
        <FontAwesomeIcon className='mouseIcon' icon={faComputerMouse} style={mouseIconStyle} size="2x" />
      </div>

      {/* AI Tools Section */}
      <div className="scroll-trigger" style={toolsStyle}>
        <AITools />
      </div>

      {/* Image Library Section */}
      {/* {userId && (
        <div className="scrollableContainer" id="gallery-section">
          <ImageLibrary userId={userId} />
        </div>
      )} */}

      {/* Image Slider Section */}
      <ImageSlider slides={[{ image: wsImage }, { image: wsImage1 }, { image: wsImage1 }]} />

      {/* Huge Collection Section */}
      <div className="huge-collection-section">
        <div className="content-container">
          <div className="text-block">
            <p className="subtitle">HUGE COLLECTION</p>
            <h2 className="title">More algorithms than anywhere else.</h2>
          </div>
          <div className="description-block">
            <p className="description">Adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.</p>
            <p className="description">Adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</p>
          </div>
        </div>
      </div>

      {/* Other Sections */}
      <FeaturesSection />
      <div style={{ width: "100%", padding: "50px 20%" }}>
        <Gallery />
      </div>
      <div style={{ width: "100%", padding: "50px 20%" }}>
        <TestimonialCarousel />
      </div>

      {/* More AI Tools Section */}
      <div className="tools-section-2">
        <div className="content-tools-section-2">
          <h1>Try out the most amazing AI tools.</h1>
          <p>Are you looking for inspirations in art, architecture, or design? Using our AI tools you can generate high-quality images, videos or 3D objects. Trust VirtuartAI to bring your digital vision to life.</p>
        </div>
        <div className="grid-tools-section-2">
          <div className="items-grid-tools-section-2">
            <img src={wsImage} alt="Descriptive text" className="my-image-class" />
            <h2>Text to Image generator</h2>
            <p>Convert your textual ideas into stunning images. Create art, architectural renderings or any other imagination.</p>
          </div>
          <div className="items-grid-tools-section-2">
            <img src={wsImage2} alt="Descriptive text" className="my-image-class" />
            <h2>Video generator</h2>
            <p>Generate videos from your images or text prompts. Use realistic virtual human avatars, or create your own custom character.</p>
          </div>
          <div className="items-grid-tools-section-2">
            <img src={wsImage1} alt="Descriptive text" className="my-image-class" />
            <h2>3D Object generator</h2>
            <p>Using text prompts create 3D objects or interiors, download them and insert them into your project.</p>
          </div>
          <div className="items-grid-tools-section-2">
            <img src={wsImage3} alt="Descriptive text" className="my-image-class" />
            <h2>Image to sketch generator</h2>
            <p>Upload images, photographs, portraits and transform them into beautiful pencil drawings, colored sketches or artistic paintings.</p>
          </div>
          <div className="items-grid-tools-section-2">
            <img src={wsImage4} alt="Descriptive text" className="my-image-class" />
            <h2>Sketch to image generator</h2>
            <p>Upload sketches and transform them into beautiful renderings, photographs, colored drawings or artistic idea.</p>
          </div>
          <div className="items-grid-tools-section-2">
            <img src={wsImage5} alt="Descriptive text" className="my-image-class" />
            <h2>Image variation</h2>
            <p>Add variation to your images, improve colors, extend images, replace marked areas or remove background or elements.</p>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <PricingSection id="pricing-section" />

      {/* FAQ Section */}
      <div id="faq-section" style={{ marginTop: "100px",marginBottom: "100px" }}>
        <FAQ />
      </div>
      {/* <Footer/> */}

      {/* Footer Section */}
      {/* <footer className="footer">
        <div className="footer-top">
          <h1 className="footer-title">VirtuartAI s.r.o.</h1>
          <div className="footer-address">
            <h1>Address</h1>
            <p>Bagarova 1 17</p>
            <p>Bratislava - 841 01,</p>
     
          </div>
          <div className="footer-contact">
            <h1>Say Hello</h1>
            <p>support@virtuartai.com</p>
            <br />
            <p>VAT: SK2024089199</p>
            <p>Registration ID: 56 477 643</p>
          </div>
          <div className="footer-social">
            <a href="#"><i className="fa fa-facebook"></i></a>
            <a href="#"><i className="fa fa-twitter"></i></a>
            <a href="#"><i className="fa fa-instagram"></i></a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>VirtuartAI © 2024. All Rights Reserved. <Link to="/terms-of-service">Terms of Service</Link></p>
        </div>
      </footer> */}
    </div>
  );
}

export default Home;
