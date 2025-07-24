import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from "axios";
import checkmark from '../../../assets/vector_icons/checkmark 1.svg';
import './PricingSection.css';
import sliderIcon from '../../../assets/vector_icons/Scroll Icon.svg'
import arrow from '../../../assets/vector_icons/Arrow 2.svg';
import arrow_gold from '../../../assets/vector_icons/Arrow_gold.svg';
import checkmark_black from '../../../assets/vector_icons/checkmark_black.svg';

const PricingSection = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  const user = JSON.parse(localStorage.getItem('user')) || null;
  const currentSubscription = user?.subscription?.name || 'FREE';

  // Helper function to determine change type
  const getChangeType = (planName) => {
    const currentPlan = currentSubscription;
    const pricingPlans = [
      { name: 'FREE', price: 0 },
      { name: 'STARTER', price: 8 },
      { name: 'BUSINESS', price: 24 },
      { name: 'PREMIUM', price: 48 }
    ];
    
    const currentPlanPrice = pricingPlans.find(p => p.name === currentPlan)?.price || 0;
    const newPlanPrice = pricingPlans.find(p => p.name === planName.toUpperCase())?.price || 0;
    
    if (planName.toUpperCase() === currentPlan) return 'renew';
    if (currentPlan === 'FREE' && planName.toUpperCase() !== 'FREE') return 'upgrade';
    if (currentPlan !== 'FREE' && planName.toUpperCase() === 'FREE') return 'downgrade';
    if (newPlanPrice > currentPlanPrice) return 'upgrade';
    if (newPlanPrice < currentPlanPrice) return 'downgrade';
    return 'new';
  };

  // Get modal content based on change type
  const getModalContent = (changeType, plan, currentPrice) => {
    const planName = plan.title;
    const billingText = billingCycle === 'yearly' ? 'yearly' : 'monthly';
    
    switch (changeType) {
      case 'upgrade':
        return {
          title: `Upgrade to ${planName}`,
          icon: '⚡',
          color: '#28a745',
          description: `You're upgrading from ${currentSubscription} to ${planName}.`,
          effects: [
            '🔄 New billing period starts immediately',
            '📊 Resources reset to new plan allocation',
            `💰 Charged €${currentPrice} for ${billingText} billing`,
            '🚀 Get access to higher tier features instantly'
          ],
          resources: plan.features,
          warning: 'Your current unused resources will be replaced with the new plan allocation.'
        };
        
      case 'downgrade':
        return {
          title: `Downgrade to ${planName}`,
          icon: '⬇️',
          color: '#ffc107',
          description: `You're downgrading from ${currentSubscription} to ${planName}.`,
          effects: [
            '✅ Change applies immediately',
            '🛡️ Existing resources preserved (if higher)',
            `💰 Next billing: €${currentPrice} ${billingText}`,
            '📉 Some features may be restricted'
          ],
          resources: plan.features,
          warning: 'You\'ll keep your existing resources if they\'re higher than the new plan limits.'
        };
        
      case 'renew':
        return {
          title: `Renew ${planName} Plan`,
          icon: '🔄',
          color: '#007bff',
          description: `You're renewing your current ${planName} plan.`,
          effects: [
            '🔄 New billing period starts immediately',
            '➕ Current resources + new plan allocation',
            `💰 Charged €${currentPrice} for ${billingText} billing`,
            '📈 Your existing quota carries forward and gets added to'
          ],
          resources: plan.features,
          warning: 'Your current unused resources will be added to the new plan allocation.'
        };
        
      default:
        return {
          title: `Subscribe to ${planName}`,
          icon: '🎯',
          color: '#007bff',
          description: `You're subscribing to the ${planName} plan.`,
          effects: [
            '🚀 Get instant access to all features',
            '📊 Full resource allocation',
            `💰 Charged €${currentPrice} for ${billingText} billing`,
            '⚡ Start creating immediately'
          ],
          resources: plan.features,
          warning: null
        };
    }
  };

  const handlePlanSelection = (event, amount, subscription, plan) => {
    event.preventDefault();
    
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const changeType = getChangeType(subscription);
    const currentPrice = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
    
    // For free plan, handle directly without modal
    if (subscription === 'free') {
      if (currentSubscription === 'FREE') {
        alert('You are already on the Free plan. Upgrade to a paid plan for more resources!');
        return;
      } else {
        // Show downgrade modal
        const modalContent = getModalContent(changeType, plan, currentPrice);
        setModalData({ ...modalContent, plan, amount: currentPrice, subscription, changeType });
        setShowModal(true);
      }
      return;
    }

    // Show modal for all paid plans
    const modalContent = getModalContent(changeType, plan, currentPrice);
    setModalData({ ...modalContent, plan, amount: currentPrice, subscription, changeType });
    setShowModal(true);
  };

  const confirmPurchase = async () => {
    if (!modalData) return;

    setLoading(modalData.subscription);
    setShowModal(false);

    try {
      console.log('Processing payment:', { 
        user: user.email, 
        amount: modalData.amount, 
        subscription: modalData.subscription, 
        billingCycle,
        changeType: modalData.changeType 
      });
      
      const response = await axios.post(`${apiUrl}api/getPaymentUrl`, { 
        email: user.email, 
        amount: modalData.amount, 
        subscriptionName: modalData.subscription,
        billingCycle,
        autoRenew: true,
        changeType: modalData.changeType // Pass change type to backend
      });
      
      // Handle direct subscription (Free plan)
      if (response.data.directSubscription) {
        alert(response.data.message);
        const updatedUser = { ...user, subscription: { name: modalData.subscription.toUpperCase() } };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.location.reload();
        return;
      }

      const { tatraPayPlusUrl, changeType } = response.data;

      if (tatraPayPlusUrl) {
        console.log(`✅ Payment URL generated. Change type: ${changeType}`);
        window.location.href = tatraPayPlusUrl;
      }
    } catch (error) {
      console.error('Error fetching payment URL:', error);
      let errorMessage = 'There was an error processing your request.';
      
      if (error.response?.status === 400 && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(null);
      setModalData(null);
    }
  };

  const scrollRef = useRef(null);
  const currentIndex = useRef(0);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.children[0].offsetWidth + 32;
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

  // Define pricing plans with both monthly and yearly prices
  const pricingPlans = [
    {
      title: "Free",
      priceMonthly: 0,
      priceYearly: 0,
      subscription: "free",
      features: ["200 Generated images", "Slow generations", "10 Video generations", "Personal use only", "Images are open to public"]
    },
    {
      title: "Starter",
      priceMonthly: 8,
      priceYearly: 80,
      subscription: "starter",
      features: ["1200 Generated images", "Slow generations", "40 Video generations", "Personal use only", "Images are open to public"]
    },
    {
      title: "Business",
      priceMonthly: 24,
      priceYearly: 240,
      subscription: "business",
      features: ["4800 Generated images", "Fast generations", "160 Video generations", "Commercial license", "Images are kept private"]
    },
    {
      title: "Premium",
      priceMonthly: 48,
      priceYearly: 480,
      subscription: "premium",
      features: ["9600 Generated images", "Fast generations", "320 Video generations", "Commercial license", "Images are kept private"]
    }
  ];

  // Get button text based on user's current plan
  const getButtonText = (plan) => {
    if (!user) return 'Get Now';
    
    const changeType = getChangeType(plan.subscription);
    switch (changeType) {
      case 'renew': return 'Renew Plan';
      case 'upgrade': return 'Upgrade';
      case 'downgrade': return 'Downgrade';
      default: return 'Get Now';
    }
  };

  return (
    <div className="pricing-section">
      <div style={{margin:'32px 0px'}}>
        <p className="p1">AI-powered creative toolkit for</p>
        <p className="p2">individuals & teams</p>
        <button className='topButton'>Start your 7-day free trial</button>
      </div>

      {/* Billing cycle toggle */}
      <div className="billing-toggle">
        <div className="toggle-container">
          <button 
            className={`toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button 
            className={`toggle-btn ${billingCycle === 'yearly' ? 'active' : ''}`}
            onClick={() => setBillingCycle('yearly')}
          >
            Yearly <span className="save-badge">(Save 17%)</span>
          </button>
        </div>
      </div>

      <div className="pricing-wrapper">
        <button className="slider-btn left" onClick={() => scroll("left")}><img src={sliderIcon}/></button>

        <div className="pricing-cards" ref={scrollRef}>
          {pricingPlans.map((plan, index) => {
            const currentPrice = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
            const isLoading = loading === plan.subscription;
            const buttonText = getButtonText(plan);
            
            return (
              <div
                key={index}
                className={`pricing-card ${plan.subscription === "business" ? "highlighted-card" : ""}`}
              >
                <h2 className="card-title">{plan.title}</h2>
                <div className="card-price">
                  <span className="price-currency">€</span>
                  <span className="price-amount">{currentPrice}</span>
                  <span className="price-duration">
                    {billingCycle === 'yearly' ? '/Year' : '/Mo'}
                  </span>
                </div>
                
                {/* Show monthly equivalent for yearly billing */}
                {billingCycle === 'yearly' && currentPrice > 0 && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    €{(currentPrice / 12).toFixed(1)}/month when billed annually
                  </div>
                )}
                
                <ul className="card-features">
                  {plan.features.map((feature, i) => (
                    <li key={i}>
                      <img src={plan.subscription === "business" ? checkmark_black : checkmark} alt="✔" className="price-check" /> 
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {currentPrice > 0 ? (
                  <button 
                    className="card-button" 
                    onClick={(event) => handlePlanSelection(event, currentPrice, plan.subscription, plan)}
                    disabled={isLoading}
                    style={{ 
                      opacity: isLoading ? 0.7 : 1,
                      cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isLoading ? 'Processing...' : buttonText}
                    {!isLoading && (
                      <img src={plan.subscription === "business" ? arrow_gold : arrow} className='arrow' alt="→" />
                    )}
                  </button>
                ) : (
                  user ? (
                    <button 
                      className="card-button" 
                      onClick={(event) => handlePlanSelection(event, currentPrice, plan.subscription, plan)}
                      disabled={isLoading}
                      style={{ 
                        opacity: isLoading ? 0.7 : 1,
                        cursor: isLoading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isLoading ? 'Processing...' : buttonText}
                      {!isLoading && (
                        <img src={plan.subscription === "business" ? arrow_gold : arrow} className='arrow' alt="→" />
                      )}
                    </button>
                  ) : (
                    <Link to="/signup">
                      <button className="card-button">
                        Get Now  
                        <img src={plan.subscription === "business" ? arrow_gold : arrow} className='arrow' alt="→" />
                      </button>
                    </Link>
                  )
                )}
              </div>
            );
          })}
        </div>
        <button className="slider-btn right" onClick={() => scroll("right")}><img src={sliderIcon}/></button>
      </div>

      <div className="slider-buttons">
        <button className="slider-btn-sm left" onClick={() => scroll("left")}><img src={sliderIcon}/></button>
        <button className="slider-btn-sm right" onClick={() => scroll("right")}><img src={sliderIcon}/></button>
      </div>

      {/* Plan Information Modal */}
      {showModal && modalData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header" style={{ borderBottom: `3px solid ${modalData.color}` }}>
              <h2 style={{ color: modalData.color }}>
                <span style={{ fontSize: '24px', marginRight: '10px' }}>{modalData.icon}</span>
                {modalData.title}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <p className="modal-description">{modalData.description}</p>
              
              <div className="modal-effects">
                <h4>What happens:</h4>
                <ul>
                  {modalData.effects.map((effect, index) => (
                    <li key={index}>{effect}</li>
                  ))}
                </ul>
              </div>

              <div className="modal-features">
                <h4>Plan includes:</h4>
                <ul>
                  {modalData.resources.map((feature, index) => (
                    <li key={index}>
                      <img src={checkmark} alt="✔" style={{ width: '16px', marginRight: '8px' }} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {modalData.warning && (
                <div className="modal-warning">
                  <strong>⚠️ Important:</strong> {modalData.warning}
                </div>
              )}

              <div className="modal-price">
                <strong>Total: €{modalData.amount} {billingCycle === 'yearly' ? '/year' : '/month'}</strong>
              </div>
            </div>

            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button 
                className="modal-btn-confirm" 
                onClick={confirmPurchase}
                style={{ backgroundColor: modalData.color }}
              >
                {modalData.changeType === 'renew' ? 'Renew Plan' : 
                 modalData.changeType === 'upgrade' ? 'Upgrade Now' :
                 modalData.changeType === 'downgrade' ? 'Downgrade' : 'Subscribe Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingSection;
