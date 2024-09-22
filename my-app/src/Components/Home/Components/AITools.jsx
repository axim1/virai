    import React from "react";
    import "./AITools.css"; // External CSS for styling
    import wsImage from '../../../assets/House_sketch to image.jpg'; // Replace with your image path
    import wsImage1 from '../../../assets/House_sketch-to-image_web.jpg'; // Replace with your image path
    import wsImage2 from '../../../assets/Organic shapes mansion on a cliff.jpg'; // Replace with your image path

    const tools = [
    {
        name: "Text to Image Generation",
        image: wsImage, // Replace with actual image paths
    },
    {
        name: "Image to Sketch Generation",
        image: wsImage1,
    },
    {
        name: "Sketch to Image Generation",
        image: wsImage2,
    },
    {
        name: "Image Enhancement",
        image: wsImage,
    },
    {
        name: "AI Replacement",
        image: wsImage,
    },
    {
        name: "Image Expansion",
        image: wsImage,
    },
    {
        name: "Video Generation",
        image: wsImage,
    },
    {
        name: "3D Object Generation",
        image: wsImage,
    },
    ];

    const AITools = () => {
        return (
            <>
            
        <div className="ai-tools-container">
            {tools.map((tool, index) => (
            <div key={index} className="ai-tool-card">
                <div className="ai-tool-label">{tool.name}</div>
                <img src={tool.image} alt={tool.name} className="ai-tool-image" />
            </div>
            ))}
        </div>
        </>
        );
    };

    export default AITools;
