import { useState } from "react";
import "./Dropdown.css"; // Import CSS

const Dropdown = ({ apiType, apiTypes, icons, handleApiTypeChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Find the index of the selected API Type to show the correct icon in the button
  const selectedIndex = apiTypes.indexOf(apiType);
  const selectedIcon = selectedIndex !== -1 ? icons[selectedIndex] : icons[0];

  return (
    <div className="dropdown">
      {/* Dropdown Button (Shows Selected Icon + Name) */}
      <button className="dropdown-btn" onClick={() => setIsOpen(!isOpen)}>
        <img src={selectedIcon} alt="selected-icon" className="dropdown-icon" />
        {apiType} 
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="6" viewBox="0 0 14 6" fill="none">
  <path d="M7 6L13.0622 0.75H0.937822L7 6Z" fill="white"/>
</svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="dropdown-menu">
          {apiTypes.map((type, index) => (
            <button
              key={index}
              className={`dropdown-item ${apiType === type ? "active" : ""}`}
              onClick={() => {
                handleApiTypeChange(type);
                setIsOpen(false);
              }}
            >
              <img src={icons[index]} alt={`icon-${index}`} className="dropdown-icon" />
              {type}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
