import { useState } from "react";
import "./Dropdown.css";

const Dropdown = ({ apiType, apiTypes, formatApiType, icons, handleApiTypeChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedIndex = apiTypes.indexOf(apiType);
  const selectedIcon = selectedIndex !== -1 ? icons[selectedIndex] : icons[0];

  return (
    <div className="dropdown">
      <button className="dropdown-btn" onClick={() => setIsOpen(!isOpen)}>
        <img src={selectedIcon} alt="selected-icon" className="dropdown-icon" />
        {formatApiType(apiType)}
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="6" viewBox="0 0 14 6" fill="none">
          <path d="M7 6L13.0622 0.75H0.937822L7 6Z" fill="white" />
        </svg>
      </button>

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
              {formatApiType(type)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
