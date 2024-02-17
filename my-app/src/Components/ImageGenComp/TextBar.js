import React, { useState } from "react";

const TextBar = ({ onTextChange, label }) => {
  const [text, setText] = useState("");

  const handleTextChange = (e) => {
    setText(e.target.value);
    onTextChange(e.target.value);
  };

  return (
    <div>
      <label>{label}</label>
      <input type="text" value={text} onChange={handleTextChange} />
    </div>
  );
};

export default TextBar;
