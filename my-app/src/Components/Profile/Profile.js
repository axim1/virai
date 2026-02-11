import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import basestyle from "../Base.module.css";
import "./Profile.css";
import coinIcon from "../../assets/vector_icons/pricing-01 1.svg";

const API_BASE = process.env.REACT_APP_API_URL;

const Profile = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?._id;

  const [form, setForm] = useState({
    fname: storedUser?.fname || "",
    lname: storedUser?.lname || "",
    email: storedUser?.email || "",
    phone: storedUser?.phone || "",
    userType: storedUser?.userType || "individual",
    companyName: storedUser?.companyName || "",
    address: storedUser?.address || "",
    vatNumber: storedUser?.vatNumber || "",
    profilePic: null,
  });

  const [formErrors, setFormErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);
  const [profilePicFilename, setProfilePicFilename] = useState(storedUser?.profilePic || "");
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [imageSaveError, setImageSaveError] = useState("");
  const [activeTab, setActiveTab] = useState('subscription'); // Default to subscription tab
  const [subscriptions, setSubscriptions] = useState([]);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [billingCycle, setBillingCycle] = useState(storedUser?.billingCycle || 'monthly');
  const [coinPackages] = useState([
    { coins: 100, price: 5, popular: false },
    { coins: 250, price: 10, popular: true },
    { coins: 500, price: 18, popular: false },
    { coins: 1000, price: 30, popular: false }
  ]);

  // Fetch available subscriptions
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch(`${API_BASE}subscriptions`);
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const handleAutoRenewToggle = async () => {
    try {
      const response = await fetch(`${API_BASE}api/updateAutoRenew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, autoRenew: !storedUser.autoRenew }),
      });
      const result = await response.json();
      if (result.success) {
        const updatedUser = { ...storedUser, autoRenew: !storedUser.autoRenew };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.location.reload();
      }
    } catch (err) {
      alert("Failed to update auto-renewal preference.");
    }
  };

  const handleSubscriptionChange = async (newSubscription) => {
    try {
      const response = await fetch(`${API_BASE}api/changeSubscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId, 
          newSubscriptionName: newSubscription.name,
          billingCycle
        }),
      });
      
      const result = await response.json();
      
      if (result.requiresPayment) {
        // For upgrades, redirect to payment
        const paymentResponse = await fetch(`${API_BASE}api/getPaymentUrl`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: storedUser.email,
            amount: result.amount,
            subscriptionName: result.subscriptionName,
            billingCycle: result.billingCycle,
            autoRenew: storedUser.autoRenew
          }),
        });
        
        const paymentData = await paymentResponse.json();
        if (paymentData.tatraPayPlusUrl) {
          window.location.href = paymentData.tatraPayPlusUrl;
        }
      } else if (result.success) {
        // Immediate change for downgrades
        alert(result.message);
        window.location.reload();
      } else {
        alert(result.message || 'Failed to change subscription');
      }
    } catch (error) {
      console.error('Error changing subscription:', error);
      alert('Failed to change subscription');
    }
    setShowSubscriptionModal(false);
  };

  const handleBuyCoins = async (coinPackage) => {
    try {
      const response = await fetch(`${API_BASE}api/buyCoins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: storedUser.email,
          amount: coinPackage.price,
          coinAmount: coinPackage.coins
        }),
      });
      
      const result = await response.json();
      
      if (result.tatraPayPlusUrl) {
        window.location.href = result.tatraPayPlusUrl;
      } else {
        alert('Failed to initiate coin purchase');
      }
    } catch (error) {
      console.error('Error buying coins:', error);
      alert('Failed to buy coins');
    }
    setShowCoinModal(false);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "profilePic" && files[0]) {
      const file = files[0];
      setForm((prev) => ({ ...prev, profilePic: file }));
      setPreviewUrl(URL.createObjectURL(file));
      saveProfileImage(file);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const saveProfileImage = async (file) => {
    if (!file || !userId) return;

    setIsSavingImage(true);
    setImageSaveError("");

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("profilePic", file);

    try {
      const res = await fetch(`${API_BASE}api/updateUser`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setImageSaveError(data?.message || "Failed to save image.");
        return;
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setProfilePicFilename(data.user.profilePic || "");
        setForm((prev) => ({ ...prev, profilePic: null }));
        setPreviewUrl(null);
      }
    } catch (error) {
      setImageSaveError("Failed to save image.");
    } finally {
      setIsSavingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(form);
    setFormErrors(errors);
    if (Object.keys(errors).length !== 0) return;

    const formData = new FormData();
    Object.entries({ ...form, userId }).forEach(([key, val]) => {
      if (key === "profilePic") {
        if (val) formData.append(key, val);
        return;
      }
      if (val === undefined || val === null) return;
      formData.append(key, val);
    });

    try {
      const res = await fetch(`${API_BASE}api/updateUser`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      alert(data.message);

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setProfilePicFilename(data.user.profilePic || "");
        setPreviewUrl(null);
      }
    } catch (error) {
      alert("Something went wrong.");
    }
  };

  const validateForm = (values) => {
    const error = {};
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

    if (!values.fname?.trim()) error.fname = "First Name is required";
    if (!values.lname?.trim()) error.lname = "Last Name is required";
    if (!values.email) {
      error.email = "Email is required";
    } else if (!regex.test(values.email)) {
      error.email = "Invalid email format";
    }

    if (!values.phone?.trim()) {
      error.phone = "Phone number is required";
    } else {
      const phoneRaw = values.phone.trim();
      const isExternal = phoneRaw.toLowerCase() === "external";
      const digitsOnly = phoneRaw.replace(/[^\d]/g, "");

      if (!isExternal && (digitsOnly.length < 7 || digitsOnly.length > 15)) {
        error.phone = "Phone number looks invalid";
      }
    }

    if (values.userType === "company") {
      if (!values.companyName?.trim()) error.companyName = "Company Name is required";
      if (!values.address?.trim()) error.address = "Company Address is required";
      if (!values.vatNumber?.trim()) error.vatNumber = "VAT Number is required";
    }

    return error;
  };

  const getProfilePicUrl = (picPath) => {
    if (!picPath) return "https://via.placeholder.com/100x100.png?text=User";
    const filename = picPath.split("\\").pop().split("/").pop(); // Handle both slashes
    return `${API_BASE}api/uploads/profilepic/${filename}?t=${Date.now()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const isLowOnResources = () => {
    const images = storedUser?.no_of_images_left || storedUser?.imagesLeft || 0;
    const videos = storedUser?.videosLeft || 0;
    const models = storedUser?.modelsLeft || 0;
    return images < 10 || videos < 2 || models < 1;
  };

  return (
    <div className="userProfile">
      <div className="profile-summary">
        <div className="left-profile-container">
          <div className="profile-pic-container">
            <label htmlFor="profilePic" className="edit-icon-label">
              <img
                src={previewUrl || getProfilePicUrl(profilePicFilename)}
                alt="User Profile"
                className="profile-pic"
              />
              <div className="edit-icon-wrapper">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="edit-icon"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                </svg>
              </div>
            </label>
            <input
              type="file"
              id="profilePic"
              name="profilePic"
              accept="image/*"
              onChange={handleChange}
              style={{ display: "none" }}
            />
            {isSavingImage && (
              <p className="form-errors" style={{ marginTop: 10 }}>
                Saving image...
              </p>
            )}
            {imageSaveError && (
              <p className="form-errors" style={{ marginTop: 10 }}>
                {imageSaveError}
              </p>
            )}
          </div>
        </div>
        <div className="profile-text">
          <h2>{form.fname} {form.lname}</h2>
          <p><strong></strong> {form.email}</p>
          <div className="subscription-info">
            <p><strong>Subscription:</strong> {storedUser?.subscription?.name || "Free"}</p>
            <p><strong>Billing:</strong> {storedUser?.billingCycle || "monthly"} • Auto-renew: {storedUser?.autoRenew ? "On" : "Off"}</p>
            {storedUser?.nextBillingDate && (
              <p><strong>Next Billing:</strong> {formatDate(storedUser.nextBillingDate)}</p>
            )}
          </div>
          <div className="resources-summary">
            <div className='resource-item'>
              <span>🖼 {storedUser?.no_of_images_left || storedUser?.imagesLeft || 0} Images</span>
            </div>
            <div className='resource-item'>
              <span>🎥 {storedUser?.videosLeft || 0} Videos</span>
            </div>
            <div className='resource-item'>
              <span>🎨 {storedUser?.modelsLeft || 0} 3D Models</span>
            </div>
            <div className='resource-item'>
            <img src={coinIcon} alt="images" /> 

              <span>{storedUser?.coins || 0} Coins</span>
            </div>
          </div>
          
          {/* Low resources warning */}
          {isLowOnResources() && (
            <div className="low-resources-warning">
              ⚠️ You're running low on resources. Consider upgrading your plan or buying coins.
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'subscription' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscription')}
        >
          Subscription Management
        </button>
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Edit Profile
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'subscription' && (
        <div className="tab-content">
          {/* Subscription Management Section */}
          <div className="subscription-management">
            <h3>Subscription Management</h3>
            <div className="subscription-actions">
              <button 
                onClick={() => setShowSubscriptionModal(true)}
                className="subscription-btn primary"
              >
                Change Plan
              </button>
              
              <button 
                onClick={() => setShowCoinModal(true)}
                className="subscription-btn secondary"
              >
                Buy Coins
              </button>
            </div>

            <div className="toggle-renewal">
              <label>
                <input
                  type="checkbox"
                  checked={storedUser?.autoRenew}
                  onChange={handleAutoRenewToggle}
                />
                Auto-Renew Subscription
              </label>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="tab-content">
          <form onSubmit={handleSubmit}>
            <h1 className="mb-4">Edit your profile</h1>

            <select
              name="userType"
              onChange={handleChange}
              value={form.userType}
              className="form-container form-ddd"
            >
              <option value="individual">Individual</option>
              <option value="company">Company</option>
            </select>

            <input
              name="fname"
              placeholder="First Name"
              onChange={handleChange}
              value={form.fname}
              className="form-container"
            />
            <input
              name="lname"
              placeholder="Last Name"
              onChange={handleChange}
              value={form.lname}
              className="form-container"
            />
            <input
              name="email"
              placeholder="Email"
              onChange={handleChange}
              value={form.email}
              className="form-container"
            />
            <input
              name="phone"
              placeholder="Phone Number"
              onChange={handleChange}
              value={form.phone}
              className="form-container"
            />

            {form.userType === "company" && (
              <>
                <input
                  name="companyName"
                  placeholder="Company Name"
                  onChange={handleChange}
                  value={form.companyName}
                  className="form-container"
                />
                <input
                  name="address"
                  placeholder="Company Address"
                  onChange={handleChange}
                  value={form.address}
                  className="form-container"
                />
                <input
                  name="vatNumber"
                  placeholder="VAT Number"
                  onChange={handleChange}
                  value={form.vatNumber}
                  className="form-container"
                />
              </>
            )}

            {Object.keys(formErrors).length > 0 && (
              <p className="form-errors">Please fill all required fields</p>
            )}

            <button type="submit" className="updateButton">
              UPDATE PROFILE
            </button>

            <NavLink to="/gen" style={{ color: "#2E8B57" }} className="mt-3 d-block text-center">
              Go back to Dashboard
            </NavLink>
          </form>
        </div>
      )}

      {/* Modals - Always available regardless of active tab */}
      {/* Subscription Change Modal */}
      {showSubscriptionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Change Subscription Plan</h3>
            
            <div className="billing-cycle-selector">
              <label>
                <input
                  type="radio"
                  name="billingCycle"
                  value="monthly"
                  checked={billingCycle === 'monthly'}
                  onChange={(e) => setBillingCycle(e.target.value)}
                />
                Monthly
              </label>
              <label>
                <input
                  type="radio"
                  name="billingCycle"
                  value="yearly"
                  checked={billingCycle === 'yearly'}
                  onChange={(e) => setBillingCycle(e.target.value)}
                />
                Yearly (Save 17%)
              </label>
            </div>

            <div className="subscription-options">
              {subscriptions.map((sub) => {
                const price = billingCycle === 'yearly' ? sub.priceYearly : sub.priceMonthly;
                const isCurrentSub = sub.name === storedUser?.subscription?.name;
                
                return (
                  <div 
                    key={sub._id} 
                    className={`subscription-option ${isCurrentSub ? 'current' : ''}`}
                    onClick={() => !isCurrentSub && setSelectedSubscription(sub)}
                  >
                    <h4>{sub.name} {isCurrentSub && '(Current)'}</h4>
                    <p><strong>€{price}</strong> / {billingCycle}</p>
                    <div className="subscription-details">
                      <p>• {sub.generatedImages} images</p>
                      <p>• {sub.videoGenerations} videos</p>
                      <p>• {sub.models3d} 3D models</p>
                      <p>• {sub.coins} coins</p>
                      <p>• {sub.generationSpeed} generation</p>
                      <p>• {sub.licenseType}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="modal-actions">
              <button 
                onClick={() => setShowSubscriptionModal(false)}
              >
                Cancel
              </button>
              
              {selectedSubscription && (
                <button 
                  onClick={() => handleSubscriptionChange(selectedSubscription)}
                >
                  Change to {selectedSubscription.name}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Coin Purchase Modal */}
      {showCoinModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Buy Coins</h3>
            <p>
              Use coins to generate images, videos, or 3D models when you run out of your monthly allocation.
            </p>
            
            <div className="coin-packages">
              {coinPackages.map((pkg, index) => (
                <div 
                  key={index}
                  className={`coin-package ${pkg.popular ? 'popular' : ''}`}
                  onClick={() => handleBuyCoins(pkg)}
                >
                  {pkg.popular && (
                    <div className="popular-badge">
                      Most Popular
                    </div>
                  )}
                  <div className="coin-package-content">
                    <div className="coin-info">
                      <h4>🪙 {pkg.coins} Coins</h4>
                      <p className="coin-rate">
                        €{(pkg.price / pkg.coins).toFixed(3)} per coin
                      </p>
                    </div>
                    <div className="coin-price">
                      <strong>€{pkg.price}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button 
                onClick={() => setShowCoinModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
