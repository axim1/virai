import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from "axios";
import checkmark from '../../../assets/vector_icons/checkmark 1.svg';
import './PricingSection.css';
import sliderIcon from '../../../assets/vector_icons/Scroll Icon.svg'
const PricingSection = () => {
  const apiUrl = process.env.REACT_APP_API_URL;

  const submitForm = async (event, amount, subscription) => {
    event.preventDefault();
    const user = JSON.parse(localStorage.getItem('user')) || null;

    if (user) {
      try {
        console.log(user);
        const response = await axios.post(`${apiUrl}api/getPaymentUrl`, { email: user.email, amount, subscriptionName: subscription });
        const tatraPayPlusUrl = response.data.tatraPayPlusUrl;

        if (tatraPayPlusUrl) {
          window.location.href = tatraPayPlusUrl;
        }
      } catch (error) {
        console.error('Error fetching payment URL:', error);
        alert('There was an error processing your request.');
      }
    } else {
      window.location.href = '/login';
    }
  };

  const scrollRef = useRef(null);
  const currentIndex = useRef(0);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.children[0].offsetWidth + 32; // Card width + gap
      const maxIndex = scrollRef.current.children.length - 1;

      if (direction === "right") {
        currentIndex.current = Math.min(currentIndex.current + 1, maxIndex);
      } else {
        currentIndex.current = Math.max(currentIndex.current - 1, 0);
      }

      scrollRef.current.scrollTo({
        left: currentIndex.current * cardWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="pricing-section">
      <div style={{margin:'32px'}}>
        <p className="p1">AI-powered creative toolkit for</p>
        <p className="p2">individuals & teams.</p>
        <button className='topButton'>Start your 7-day free trial</button>
      </div>

      <div className="pricing-wrapper">
      <button className="slider-btn left" onClick={() => scroll("left")}><img src={sliderIcon}/></button>

        <div className="pricing-cards" ref={scrollRef}>
          {[
            { title: "Free", price: 0, subscription: "free", features: ["200 Generated images", "Slow generations", "10 Video generations", "Personal use only", "Images are open to public"] },
            { title: "Starter", price: 8, subscription: "starter", features: ["1200 Generated images", "Slow generations", "40 Video generations", "Personal use only", "Images are open to public"] },
            { title: "Business", price: 24, subscription: "business", features: ["4800 Generated images", "Fast generations", "160 Video generations", "Commercial license", "Images are kept private"] },
            { title: "Premium", price: 48, subscription: "premium", features: ["9600 Generated images", "Fast generations", "320 Video generations", "Commercial license", "Images are kept private"] }
          ].map((plan, index) => (
            <div key={index} className="pricing-card">
              <h2 className="card-title">{plan.title}</h2>
              <div className="card-price">
                <span className="price-currency">€</span>
                <span className="price-amount">{plan.price}</span>
                <span className="price-duration">/Mo</span>
              </div>
              <ul className="card-features">
                {plan.features.map((feature, i) => (
                  <li key={i}><img src={checkmark} alt="✔" className="price-check" /> {feature}</li>
                ))}
              </ul>
              {plan.price > 0 ? (
                <button className="card-button" onClick={(event) => submitForm(event, plan.price, plan.subscription)}>Get Now</button>
              ) : (
                <Link to="/signup"><button className="card-button">Get Now</button></Link>
              )}
            </div>
          ))}
        </div>
        <button className="slider-btn right" onClick={() => scroll("right")}><img src={sliderIcon}/></button>

      </div>

      <div className="slider-buttons">
      <button className="slider-btn-sm left" onClick={() => scroll("left")}><img src={sliderIcon}/></button>
      <button className="slider-btn-sm right" onClick={() => scroll("right")}><img src={sliderIcon}/></button>
      </div>
    </div>
  );
};

export default PricingSection;
