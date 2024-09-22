import React from "react";

const StyleSelection = ({ onSelectStyle }) => {
  const handleStyleSelect = (styleType) => {
    onSelectStyle(styleType);
  };

  return (
    <div>
      <h2>Style Selection</h2>
      <button onClick={() => handleStyleSelect("Photorealistic")}>Photorealistic</button>
      <button onClick={() => handleStyleSelect("Cinematic")}>Cinematic</button>
      <button onClick={() => handleStyleSelect("Digital")}>Digital</button>
      <button onClick={() => handleStyleSelect("Sketch")}>Sketch</button>
    </div>
  );
};

export default StyleSelection;
