import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import './Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComputerMouse } from '@fortawesome/free-solid-svg-icons';

import virLogo from '../../assets/vector_icons/virai-logo.svg';
import Navbar from '../Navbar/Navbar';
import PricingSection from './Components/PricingSection';
import FAQ from '../FAQ/faq';
import AITools from './Components/AITools';
import TestimonialCarousel from './Components/TestimonialCarousel';
import NewsLetter from './Components/NewsLetter';

function Home({ triggerShrink }) {
  const [scrollY, setScrollY] = useState(0);
  const [showText, setShowText] = useState(false); // Track whether to show text or logo
  const [toolsVisible, setToolsVisible] = useState(false);
  const [pricingVisible, setPricingVisible] = useState(false);
  const [faqVisible, setFaqVisible] = useState(false);

  const location = useLocation();

  // useEffect(() => {
  //   const handleScroll = () => {
  //     setScrollY(window.scrollY);
  //     setShowText(window.scrollY > 3);
  //   };

  //   window.addEventListener('scroll', handleScroll);
  //   return () => {
  //     window.removeEventListener('scroll', handleScroll);
  //   };
  // }, []);

  // useEffect(() => {
  //   if (triggerShrink) {
  //     setScrollY(200);
  //   }
  // }, [triggerShrink]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setToolsVisible(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    const toolsSection = document.getElementById('tools-section');
    if (toolsSection) observer.observe(toolsSection);

    return () => {
      if (toolsSection) observer.unobserve(toolsSection);
    };
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setFaqVisible(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    const faqSection = document.getElementById('faq-section');
    if (faqSection) observer.observe(faqSection);

    return () => {
      if (faqSection) observer.unobserve(faqSection);
    };
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setPricingVisible(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    const pricingSection = document.getElementById('pricing-section');
    if (pricingSection) observer.observe(pricingSection);

    return () => {
      if (pricingSection) observer.unobserve(pricingSection);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setShowText(window.scrollY > 3); // Replace logo with text when scrolling past 50px
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (triggerShrink) {
      setScrollY(200);
    }
  }, [triggerShrink]);

  const heroHeight = triggerShrink ? 50 : Math.max(50, 100 - scrollY * 0.5);
  const heroStyle = {
    height: `${heroHeight}vh`,
    transition: 'height 0.3s ease',
  };

  const toolsHeaderStyle = {
    position: scrollY > 1 ? 'relative' : 'fixed',
    bottom: scrollY > 30 ? 'auto' : '80px',
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: 10,
    transform: `translateY(${triggerShrink || scrollY > 50 ? 0 : 20}px)`,
    opacity: triggerShrink || scrollY > 50 || scrollY < 1 ? 1 : scrollY * 0.01,
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
    transform: `translateY(${scrollY > 50 ? 20 : 0}px)`,
    opacity: scrollY < 20 ? 1 - scrollY / 20 : 0,
    transition: 'opacity 0.1s ease, transform 0.1s ease',
    // color: '#fff',
    display: scrollY < 20 ? 'flex' : 'none',
    flexDirection: 'column',
    alignItems: 'center',
  };

  return (
    <div style={{ backgroundColor: "#000" }}>
      <Navbar />

      {/* Hero Section */}
      <div className="herosection" style={heroStyle}>
        <div className="content-herosection">
          {showText ? (
            <>
              <h1 className="firstheading">You Don‘t Need Eyes To See</h1>
              <h1 className="secheading">YOU NEED VISION</h1>
            </>
          ) : (
            <img src={virLogo} alt="Logo" className='virLogo' />
          )}
        </div>
      </div>

      {/* AI Tools Header */}
      <div style={toolsHeaderStyle} >
      <>
              <h1 className="firstheading2" style={mouseIconStyle} >You Don‘t Need Eyes To See</h1>
              <h1 className="secheading2" style={mouseIconStyle} >YOU NEED VISION</h1>
            </>
        <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 35 35" fill="none" style={mouseIconStyle} className='mouseIcon'>
          <circle cx="17.5" cy="17.5" r="16.5" stroke="white" strokeWidth="2" />
          <path d="M16.7929 28.707C17.1834 29.0975 17.8166 29.0975 18.2071 28.707L24.5711 22.343C24.9616 21.9525 24.9616 21.3193 24.5711 20.9288C24.1805 20.5383 23.5474 20.5383 23.1569 20.9288L17.5 26.5857L11.8431 20.9288C11.4526 20.5383 10.8195 20.5383 10.4289 20.9288C10.0384 21.3193 10.0384 21.9525 10.4289 22.343L16.7929 28.707ZM16.5 5.83322L16.5 27.9999L18.5 27.9999L18.5 5.83322L16.5 5.83322Z" fill="white" />
        </svg>
      </div>


      {/* AI Tools Section */}
      <div id="tools-section" className={`scroll-trigger ${toolsVisible ? 'fade-in' : 'fade-out'}`}>
        <AITools />
      </div>

      {/* Pricing Section */}
      <div id="pricing-section" className={` scroll-trigger ${pricingVisible ? 'fade-in' : 'fade-out'}`}>
        <PricingSection />
      </div>

      {/* FAQ Section */}
      {/* FAQ Section */}
      <div id="faq-section" className={`scroll-trigger ${faqVisible ? 'fade-in' : 'fade-out'}`} style={{display:'flex', maxWidth:'100%' ,marginTop: "100px", marginBottom: "100px" }}>
        <FAQ />
      </div>


      {/* Testimonials */}
      <div style={{ width: "100%", padding: "50px 32px" }}>
        <TestimonialCarousel />
      </div>

      {/* Newsletter */}
      <div>
        <NewsLetter />
      </div>
    </div>
  );
}

export default Home;
