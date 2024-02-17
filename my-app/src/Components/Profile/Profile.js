import React, { useState } from "react";
// import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "./Profile.css"
import GeneratorSelection from "../ImageGenComp/GeneratorSelection.js";
import TextBar from "../ImageGenComp/TextBar.js";
import StyleSelection from "../ImageGenComp/StyleSelection.js";
import ImageGenerationForm from "../ImageGenComp/ImageGenerationForm.js";
import ImageLibrary from "../ImageGenComp/ImageLibrary.js";

import ProfileTab from "../ImageGenComp/ProfileTab";

const Profile = ({ setUserState, username }) => {
  const [generatedImages, setGeneratedImages] = useState([]); // State to store generated images
  const [activeTab, setActiveTab] = useState("Generate");

  const switchTab = (tab) => {
    setActiveTab(tab);
  };

  // Callback function for generating images
  const generateImages = (images) => {
    setGeneratedImages(images);
  };

  return (
    <div className={`profile`}>
      <div className={`nav nav-tabs navTabs`}>
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
      </div>

      {activeTab === "Library" && <ImageLibrary className="imageLibrary" userId={username.id} generatedImages={generatedImages} />}
      {activeTab === "Generate" && <ImageGenerationForm className="imageGenerationForm" username={username} onGenerateImage={generateImages} />}
      {activeTab === "Profile" && <ProfileTab className="profileTab" username={username} setUserState={setUserState} />}
    </div>
  );
};
export default Profile;
