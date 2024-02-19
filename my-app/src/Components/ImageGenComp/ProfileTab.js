// ProfileTab.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ProfileTab.css"; // Import the stylesheet

const ProfileTab = ({ username, setLoggedIn }) => {
  const [userData, setUserData] = useState({});
const userId= username._id
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("user ir : ", username._id)
        const response = await axios.get(`http://localhost:8000/user/${userId}`);
        setUserData(response.data.user);
        console.log(response)
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [username]);

 
  return (
    <div className="profile">
      <h1 className="welcome-text">Welcome {userData.fname} !!</h1>
      {/* <button className="btn btn-danger" onClick={() => setLoggedIn(false)}>
        Logout
      </button> */}
      <div className="user-info">
        <p>Email: {userData.email}</p>
        <p>Subscribed Package: {userData.subscription?.name || "Not subscribed"}</p>
        <p>Images Left: {userData.no_of_images_left}</p>
        <p>Subscription Type: {userData.subscription?.licenseType}</p>
        {/* Add additional profile information if needed */}
      </div>
    </div>
  );

};

export default ProfileTab;
