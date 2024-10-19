import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import "./AITools.css"; // External CSS for styling
import wsImage from '../../../assets/House_sketch to image.jpg'; // Replace with your image path
import wsImage1 from '../../../assets/House_sketch-to-image_web.jpg'; // Replace with your image path
import wsImage2 from '../../../assets/Organic shapes mansion on a cliff.jpg'; // Replace with your image path

const tools = [
  {
    name: "Text to Image Generation",
    image: wsImage, // Replace with actual image paths
    apiType: "text-to-image", // Add corresponding API type
  },
  {
    name: "Image to Sketch Generation",
    image: wsImage1,
    apiType: "sketch-to-image",
  },
  {
    name: "Sketch to Image Generation",
    image: wsImage2,
    apiType: "sketch-to-image",
  },
  {
    name: "Image Enhancement",
    image: wsImage,
    apiType: "sketch-to-image",
  },
  {
    name: "AI Replacement",
    image: wsImage,
    apiType: "sketch-to-image",
  },
  {
    name: "Image Expansion",
    image: wsImage,
    apiType: "sketch-to-image",
  },
  {
    name: "Video Generation",
    image: wsImage,
    apiType: "sketch-to-image",
  },
  {
    name: "3D Object Generation",
    image: wsImage,
    apiType: "sketch-to-image",
  },
];

const AITools = () => {
  return (
    <div className="ai-tools-container">
      {tools.map((tool, index) => (
        <Link
          key={index}
          to={{
            pathname: "/gen",
            state: { apiType: tool.apiType }, // Pass the apiType as state
          }}
          className="ai-tool-card"
        >
          <div className="ai-tool-label">{tool.name}</div>
          <img src={tool.image} alt={tool.name} className="ai-tool-image" />
        </Link>
      ))}
    </div>
  );
};

export default AITools;
