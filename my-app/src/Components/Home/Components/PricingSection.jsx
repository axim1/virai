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
          <h2 className="card-title">Free</h2>
          <p className="card-subtitle">0€/month</p>
          <div className="card-price">
            <span className="price-currency">€</span>
            <span className="price-amount">0</span>
            <span className="price-duration">/Mo</span>
          </div>
          <ul className="card-features">
            <li>200 Generated images</li>
            <li>Slow generations</li>
            <li>10 Video generations</li>
            <li>Personal use only</li>
            <li>Images are open to public</li>
          </ul>
          <Link to="/signup">
            <button className="card-button">Get Now</button>
          </Link>
        </div>
        <div className="pricing-card">
          <div className="card-icon"> {/* Add your icon here */}</div>
          <h2 className="card-title">Starter</h2>
          <p className="card-subtitle">8€/month or 80€/year</p>
          <div className="card-price">
            <span className="price-currency">€</span>
            <span className="price-amount">8</span>
            <span className="price-duration">/Mo</span>
          </div>
          <ul className="card-features">
            <li>1200 Generated images</li>
            <li>Slow generations</li>
            <li>40 Video generations</li>
            <li>Personal use only</li>
            <li>Images are open to public</li>
          </ul>
          <Link to="/signup">
            <button className="card-button">Get Now</button>
          </Link>
        </div>
        <div className="pricing-card">
          <div className="card-icon"> {/* Add your icon here */}</div>
          <h2 className="card-title">Business</h2>
          <p className="card-subtitle">24€/month or 240€/year</p>
          <div className="card-price">
            <span className="price-currency">€</span>
            <span className="price-amount">24</span>
            <span className="price-duration">/Mo</span>
          </div>
          <ul className="card-features">
            <li>4800 Generated images</li>
            <li>Fast generations</li>
            <li>160 Video generations</li>
            <li>Commercial license</li>
            <li>Images are kept private</li>
          </ul>
          <Link to="/signup">
            <button className="card-button">Get Now</button>
          </Link>
        </div>
        <div className="pricing-card">
          <div className="card-icon"> {/* Add your icon here */}</div>
          <h2 className="card-title">Premium</h2>
          <p className="card-subtitle">48€/month or 480€/year</p>
          <div className="card-price">
            <span className="price-currency">€</span>
            <span className="price-amount">48</span>
            <span className="price-duration">/Mo</span>
          </div>
          <ul className="card-features">
            <li>9600 Generated images</li>
            <li>Fast generations</li>
            <li>320 Video generations</li>
            <li>Commercial license</li>
            <li>Images are kept private</li>
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
