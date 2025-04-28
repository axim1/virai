import React, { useState, useEffect } from 'react';
import { useLocation ,useNavigate} from "react-router-dom";
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

function Home({ triggerShrink, scrollToSection }) {
  const [scrollY, setScrollY] = useState(0);
  const [showText, setShowText] = useState(false); // Track whether to show text or logo
  const [toolsVisible, setToolsVisible] = useState(false);
  const [pricingVisible, setPricingVisible] = useState(false);
  const [faqVisible, setFaqVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const location = useLocation();
  const navigate = useNavigate();

  const scrollStage1End = 200; // Logo fades to 50%
const scrollStage2End = 400; // Logo fades out, motto moves in & scales
const scrollStage3End = 600; // Motto fades out, background zooms, tools appear

  const logoFade = scrollY < 200 ? 1 - scrollY / 400 : 0.5; // First scroll
  const logoMoveUp = scrollY >= 200 && scrollY < 500 ? (scrollY - 200) / 300 : 0;
  const mottoAppear = scrollY >= 200 && scrollY < 500 ? (scrollY - 200) / 300 : scrollY >= 500 ? 1 : 0;
  const mottoFadeOut = scrollY >= 500 && scrollY < 800 ? 1 - (scrollY - 500) / 300 : scrollY >= 800 ? 0 : 1;
  const bgImageMove = scrollY >= 500 ? Math.min((scrollY - 500) / 300, 1) : 0;
  
  const params = new URLSearchParams(window.location.search);
  const user = {
    _id: params.get('_id'),
    email: params.get('email'),
    fname: params.get('fname'),
    lname: params.get('lname'),
    no_of_images_left: params.get('no_of_images_left'),
    subscribed_monthly: params.get('subscribed_monthly') === 'true',
    subscribed_yearly: params.get('subscribed_yearly') === 'true',
  };
  if(user._id){
    localStorage.setItem('user', JSON.stringify(user));

  }
  

  const logoOpacity = scrollY < scrollStage1End
  ? 1 - (scrollY / scrollStage1End) * 0.5
  : 0.5;

const logoTranslateY = scrollY > scrollStage1End && scrollY < scrollStage2End
  ? ((scrollY - scrollStage1End) / (scrollStage2End - scrollStage1End)) * -100
  : scrollY >= scrollStage2End ? -140 : 0;

const logoFinalOpacity = scrollY > scrollStage1End && scrollY < scrollStage2End
  ? 0.5 - ((scrollY - scrollStage1End) / (scrollStage2End - scrollStage1End)) * 0.5
  : scrollY >= scrollStage2End ? 0 : logoOpacity;

const mottoOpacity = scrollY > scrollStage1End
  ? Math.min((scrollY - scrollStage1End) / (scrollStage2End - scrollStage1End), 1)
  : 0;

const mottoScale = 1 + mottoOpacity * 0.5;

const mottoTranslateY = scrollY > scrollStage2End && scrollY < scrollStage3End
  ? -((scrollY - scrollStage2End+150) / (scrollStage3End - scrollStage2End)) * 100
  : scrollY >= scrollStage3End ? -100 : 0;

const mottoFinalOpacity = scrollY > scrollStage2End
  ? Math.max(1 - ((scrollY - scrollStage2End) / (scrollStage3End - scrollStage2End)), 0)
  : mottoOpacity;

const backgroundZoom = scrollY > scrollStage2End
  ? 100 + Math.min((scrollY - scrollStage2End) / 5, 30)
  : 100;

const isPinned = scrollY < scrollStage3End;

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
    if (location.state?.scrollToSection) {
      const section = document.getElementById(location.state.scrollToSection);
      if (section) {
        setTimeout(() => {
          section.scrollIntoView({ behavior: 'smooth' });
          navigate(location.pathname, { replace: true, state: {} }); // reset state
        }, 500);
      }
    }
  }, [location, navigate]);

  useEffect(() => {
    if (scrollToSection) {
      const tryScroll = () => {
        const target = document.getElementById(scrollToSection);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });

          // Reset scroll state so it doesn’t scroll again on back
          navigate(location.pathname, { replace: true, state: {} });
        } else {
          // Retry after a short delay if element not found yet
          setTimeout(tryScroll, 200);
        }
      };

      // Delay to let layout & animations settle
      setTimeout(tryScroll, 900);
    }
  }, [scrollToSection, navigate, location]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setToolsVisible(entry.isIntersecting);
        if (entry.isIntersecting) setActiveSection('ai-tools');
      },
      { threshold: 0.3 }
    );
  
    const toolsSection = document.getElementById('tools-section');
    if (toolsSection) observer.observe(toolsSection);
  
    return () => toolsSection && observer.unobserve(toolsSection);
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
      { threshold: 0.3 }
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
    backgroundPosition: `center ${bgImageMove * -30}px`,
    backgroundSize: `${100 + bgImageMove * 50}%`,
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
    <div style={{ backgroundColor: "#000", alignItems:'center', width:'100%' }}>
      {/* <Navbar /> */}

      {/* Hero Section */}
      <div
  className="herosection"
  style={{
    position: isPinned ? 'fixed' : 'relative',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 5,
    // backgroundSize: `${backgroundZoom}%`,
    // backgroundPosition: 'center',
    // backgroundImage: `url('/your-bg.jpg')`,
    transition: 'background-size 0.3s ease, background-position 0.3s ease',
  }}
>
  <div className="content-herosection" style={{ position: 'relative', height: '100%', width: '100%' }}>
    {/* Logo */}
    <img
      src={virLogo}
      alt="Logo"
      className='virLogo'
      style={{
        opacity: logoFinalOpacity,
        transform: `translate(-50%, ${logoTranslateY}px)`,
        position: 'absolute',
        top: '30%',
        left: '50%',
        alignItems:'center',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    />
<div
      style={{
        opacity: 1,
        transform: `translate(-50%, ${mottoTranslateY}%) scale(${mottoScale})`,
        position: 'absolute',
        top: '60%',
        left: '50%',
        transformOrigin: 'center',
        transition: ' transform 0.3s ease',
        width:'100%'
        // color: '#fff',
      }}

>
    {/* Motto */}
    <h1
      className="firstheading"
      style={{
     
        // color: '#fff',
      }}
    >
      You Don’t Need Eyes To See
    </h1>
    <h1
      className="secheading"

    >
      You Need Vision
    </h1>
</div>

  </div>
</div>


      {/* AI Tools Header */}
      <div style={toolsHeaderStyle} >
      {/* <>
              <h1 className="firstheading2" style={mouseIconStyle} >You Don‘t Need Eyes To See</h1>
              <h1 className="secheading2" style={mouseIconStyle} >YOU NEED VISION</h1>
            </> */}
        <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 35 35" fill="none" style={mouseIconStyle} className='mouseIcon'>
          <circle cx="17.5" cy="17.5" r="16.5" stroke="white" strokeWidth="2" />
          <path d="M16.7929 28.707C17.1834 29.0975 17.8166 29.0975 18.2071 28.707L24.5711 22.343C24.9616 21.9525 24.9616 21.3193 24.5711 20.9288C24.1805 20.5383 23.5474 20.5383 23.1569 20.9288L17.5 26.5857L11.8431 20.9288C11.4526 20.5383 10.8195 20.5383 10.4289 20.9288C10.0384 21.3193 10.0384 21.9525 10.4289 22.343L16.7929 28.707ZM16.5 5.83322L16.5 27.9999L18.5 27.9999L18.5 5.83322L16.5 5.83322Z" fill="white" />
        </svg>
      </div>

      <div className='spacer' ></div>

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
      <div id="faq-section" className={`scroll-trigger ${faqVisible ? 'fade-in' : 'fade-out'}`} style={{display:'flex', width:'100%', marginTop: "100px", marginBottom: "100px" }}>
        <FAQ />
      </div>


      {/* Testimonials */}
      <div style={{ width: "100%", display:'flex',alignItems:'center',justifyContent:'center', padding: "50px 32px" }}>
        <TestimonialCarousel />
      </div>

      {/* Newsletter */}
      <div style={{ width: "100%", display:'flex',alignItems:'center',justifyContent:'center' }}>
        <NewsLetter />
      </div>
    </div>
  );
}

export default Home;
