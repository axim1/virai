import React from 'react';
import { Link } from 'react-router-dom';
import axios from "axios";

import './PricingSection.css';

const PricingSection = () => {
  const apiUrl = process.env.REACT_APP_API_URL;

  const submitForm = async (event, amount, subcription) => {
    event.preventDefault();
    const user = JSON.parse(localStorage.getItem('user')) || null;

    if (user) {
      try {
        // Make the API call to your Express server
        console.log(user)
        console.log(user.email)
        const response = await axios.post(`${apiUrl}api/getPaymentUrl`, {email:user.email ,amount: amount, subscriptionName: subcription });
        const tatraPayPlusUrl = response.data.tatraPayPlusUrl;

        if (tatraPayPlusUrl) {
          // Redirect to the URL received
          window.location.href = tatraPayPlusUrl;
        }
      } catch (error) {
        console.error('Error fetching payment URL:', error);
        alert('There was an error processing your request.');
      }
    } else {
      window.location.href = 'http://localhost:3000/login';
    }
  };

  return (
    <div className="pricing-section">
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
          <button className="card-button" onClick={(event) => submitForm(event, 8, 'starter')}>Get Now</button>
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
          <button className="card-button" onClick={(event) => submitForm(event, 24,'business')}>Get Now</button>
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
          <button className="card-button" onClick={(event) => submitForm(event, 48, 'premium')}>Get Now</button>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
