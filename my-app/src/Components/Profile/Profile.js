import React, { useState, useEffect } from 'react';
// import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "./Profile.css"
import GeneratorSelection from "../ImageGenComp-legacy/GeneratorSelection.js";
import TextBar from "../ImageGenComp-legacy/TextBar.js";
import StyleSelection from "../ImageGenComp-legacy/StyleSelection.js";
import ImageGenerationForm from "../ImageGenComp-legacy/ImageGenerationForm.js";
import ImageLibrary from "../ImageGenComp-legacy/ImageLibrary.js";
import Navbar from '../Navbar/Navbar';

import ProfileTab from "../ImageGenComp-legacy/ProfileTab.js";

const Profile = ({setLoggedIn, setUserState, username }) => {
  const [generatedImages, setGeneratedImages] = useState([]); // State to store generated images
  const [activeTab, setActiveTab] = useState("Generate");
  const [navBackground, setNavBackground] = useState(false);

  // const handleScroll = () => {
  //   if (window.scrollY >= 50) {
  //     setNavBackground(true);
  //   } else {
  //     setNavBackground(false);
  //   }
  // };

  // useEffect(() => {
  //   window.addEventListener('scroll', handleScroll);

  //   return () => {
  //     window.removeEventListener('scroll', handleScroll);
  //   };
  // }, []);

  const switchTab = (tab) => {
    setActiveTab(tab);
  };
console.log("inside profile:",username)
  // Callback function for generating images
  const generateImages = (images) => {
    setGeneratedImages(images);
  };

  return (
    <div className={`profile`}>
              {/* <Navbar/> */}

              <nav className={`navbar-dash ${navBackground ? 'navbarSolid' : 'navbarSolid'}`}>
      <div className="navbar-logo">VirtuartAI</div>
      <div className="navbar-links">
       <button
          className={`nav-item-dash ${activeTab === "Library" ? "active" : ""}`}
          onClick={() => switchTab("Library")}
        >
          Library
        </button>
        <button
          className={`nav-item-dash ${activeTab === "Generate" ? "active" : ""}`}
          onClick={() => switchTab("Generate")}
        >
          Generate
        </button>
        <button
          className={`nav-item-dash ${activeTab === "Profile" ? "active" : ""}`}
          onClick={() => switchTab("Profile")}
        >
          Profile
        </button>
      </div>
    </nav>
      {/* <div className={`nav nav-tabs navTabs`}>
        <button
          className={`nav-link ${activeTab === "Library" ? "active" : ""}`}
          onClick={() => switchTab("Library")}
        >
          Library
        </button>
        <button
          className={`nav-link ${activeTab === "Generate" ? "active" : ""}`}
          onClick={() => switchTab("Generate")}
        >
          Generate
        </button>
        <button
          className={`nav-link ${activeTab === "Profile" ? "active" : ""}`}
          onClick={() => switchTab("Profile")}
        >
          Profile
        </button>
      </div> */}

      {activeTab === "Library" && <ImageLibrary className="imageLibrary" userId={username._id} generatedImages={generatedImages} />}
      {activeTab === "Generate" && <ImageGenerationForm className="imageGenerationForm" username={username} onGenerateImage={generateImages} />}
      {activeTab === "Profile" && <ProfileTab className="profileTab" username={username} setLoggedIn={setLoggedIn} />}
    </div>
  );
};
export default Profile;
