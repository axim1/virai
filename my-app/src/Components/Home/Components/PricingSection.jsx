import React from 'react';
import { Link } from 'react-router-dom';

import './PricingSection.css';

const PricingSection = () => {
  return (
    <div className="pricing-section">
      <div className="pricing-content">
        <h3 className="subtitle">FLEXIBLE & AFFORDABLE</h3>
        <h1 className="title">Our Pricing Plans</h1>
        <p className="description">
          Adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis.
        </p>
        <ul className="features-list">
          <li>✔ Suspendisse dignissim</li>
          <li>✔ Nullam efficitur nunc</li>
          <li>✔ Etiam eu lectus at lectus</li>
        </ul>
      </div>
      <div className="pricing-cards">
        <div className="pricing-card">
          <div className="card-icon"> {/* Add your icon here */}</div>
          <h2 className="card-title">Silver Pack</h2>
          <p className="card-subtitle">Great for private individuals</p>
          <div className="card-price">
            <span className="price-currency">$</span>
            <span className="price-amount">4</span>
            <span className="price-duration">/Mo</span>
          </div>
          <ul className="card-features">
            <li>1 User</li>
            <li>Unlimited Projects</li>
            <li>Download prototypes</li>
          </ul>
          <Link to="/signup">
  <button className="card-button">Get Now</button>
</Link>        </div>
        <div className="pricing-card">
          <div className="card-icon"> {/* Add your icon here */}</div>
          <h2 className="card-title">Gold Pack</h2>
          <p className="card-subtitle">Perfect for small business</p>
          <div className="card-price">
            <span className="price-currency">$</span>
            <span className="price-amount">10</span>
            <span className="price-duration">/Mo</span>
          </div>
          <ul className="card-features">
            <li>3 Users</li>
            <li>Unlimited Projects</li>
            <li>Download prototypes</li>
          </ul>
       
<Link to="/signup">
  <button className="card-button">Get Now</button>
</Link>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
