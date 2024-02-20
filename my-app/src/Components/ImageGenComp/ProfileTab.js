// ProfileTab.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ProfileTab.css"; // Import the stylesheet
const apiUrl = process.env.REACT_APP_API_URL;

const ProfileTab = ({ username, setLoggedIn }) => {
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const userId = username._id;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("user id: ", userId);
        // Replace the axios call with the Fetch API or any other library you prefer
        const response = await fetch(`${apiUrl}api/user/${userId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("API Response:", data);
        setUserData(data.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, [userId]);
  
  return (
    <div className="profile">
      {loading ? (
        <p>Loading user data...</p>
      ) : userData && userData.fname ? (
        <>
          <h1 className="welcome-text">Welcome {userData.fname} !!</h1>
          <div className="user-info">
            <p>Email: {userData.email}</p>
            <p>Subscribed Package: {userData.subscription?.name || "Not subscribed"}</p>
            <p>Images Left: {userData.no_of_images_left}</p>
            <p>Subscription Type: {userData.subscription?.licenseType}</p>
            {/* Add additional profile information if needed */}
          </div>
        </>
      ) : (
        <p>User data not available.</p>
      )}
    </div>
  );
};

export default ProfileTab;
