import React from "react";

const GeneratorSelection = ({ onSelectGenerator }) => {
  const handleGeneratorSelect = (generatorType) => {
    onSelectGenerator(generatorType);
  };

  return (
    <div>
      <h2>Generator Selection</h2>
      <button onClick={() => handleGeneratorSelect("2D")}>2D</button>
      <button onClick={() => handleGeneratorSelect("3D")}>3D</button>
    </div>
  );
};

export default GeneratorSelection;
