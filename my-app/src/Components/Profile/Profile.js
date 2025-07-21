import React, { useState } from "react";
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

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "profilePic" && files[0]) {
      setForm((prev) => ({ ...prev, profilePic: files[0] }));
      setPreviewUrl(URL.createObjectURL(files[0])); // show preview
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(form);
    setFormErrors(errors);
    if (Object.keys(errors).length !== 0) return;

    const formData = new FormData();
    Object.entries({ ...form, userId }).forEach(([key, val]) =>
      formData.append(key, val)
    );

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

    if (!values.fname) error.fname = "First Name is required";
    if (!values.lname) error.lname = "Last Name is required";
    if (!values.email) {
      error.email = "Email is required";
    } else if (!regex.test(values.email)) {
      error.email = "Invalid email format";
    }
    if (!values.phone) error.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(values.phone)) error.phone = "Must be 10 digits";

    return error;
  };

  const getProfilePicUrl = (picPath) => {
    if (!picPath) return "https://via.placeholder.com/100x100.png?text=User";
    const filename = picPath.split("\\").pop().split("/").pop(); // Handle both slashes
    return `${API_BASE}api/uploads/profilepic/${filename}?t=${Date.now()}`;
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
                stroke="white"       // ✅ This sets the stroke color
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

          
        </div>
</div>
        <div className="profile-text">
                  <h2>{form.fname} {form.lname}</h2>

          <p><strong></strong> {form.email}</p>
          <p><strong>Subscription:</strong> {storedUser?.subscription.name || "Free"}</p>
          <div className='coins'>
            <img src={coinIcon} alt="coins" /> {storedUser?.no_of_images_left}
          </div>
        </div>
      </div>

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

        {/* <label htmlFor="profilePic" style={{ padding: '10px' }} className="form-container upload-label">
          Upload Profile Picture
        </label>
        <input
          type="file"
          style={{ display: "none" }}
          id="profilePic"
          name="profilePic"
          accept="image/*"
          onChange={handleChange}
        /> */}

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

        <NavLink to="/gen" style={{ color: "#2E8B57" }} className="mt-3 d-block text-center">
          Go back to Dashboard
        </NavLink>
      </form>
    </div>
  );
};

export default Profile;
