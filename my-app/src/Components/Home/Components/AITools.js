import { Link } from "react-router-dom";
import styles from "./AITools.module.css";
import wsImage from '../../../assets/images/texttoimage (7).png'; // Replace with your image path
import wsImage1 from '../../../assets/images/texttoimage (1).png'; // Replace with your image path
import wsImage2 from '../../../assets/images/texttoimage (2).png'; // Replace with your image path
import wsImage3 from '../../../assets/images/texttoimage (3).png'; // Replace with your image path
import wsImage4 from '../../../assets/images/texttoimage (4).png'; // Replace with your image path
import wsImage5 from '../../../assets/images/texttoimage (5).png'; // Replace with your image path
import wsImage6 from '../../../assets/images/texttoimage (6).png'; // Replace with your image path

import wsImage7 from '../../../assets/images/texttoimage (6).png'; // Replace with your image path




import arrow from '../../../assets/vector_icons/Arrow 2.svg'; // Replace with your image path

const tools = [
    {
      name: "Text To Image",
      apiType: "text-to-image",
      description: "VirtuartAI’s Text-To-Image Tools Turn Text Into Stunning Visuals With Ease.",
      image: wsImage, // Replace with actual image path
    },
    {
      name: "Image To Sketch",
      apiType: "image-to-sketch",
      description: "VirtuartAI’s Image-To-Sketch Turns Images Into Detailed Sketches With Ease.",
      image: wsImage1, // Replace with actual image path
    },
    {
      name: "3D Object Generation",
      apiType: "3d-object-generation",
      description: "VirtuartAI’s 3D Object Generation Creates Realistic 3D Models From Text Or Images.",
      image: wsImage2, // Replace with actual image path
    },
    {
      name: "Video Generation",
      apiType: "video-generation",
      description: "VirtuartAI’s Video Generation Creates Videos From Text Or Images With AI.",
      image: wsImage3, // Replace with actual image path
    },
    {
      name: "Image Enhancement",
      apiType: "image-enhancement",
      description: "VirtuartAI’s Image Enhancement Tools Boost Clarity And Color Instantly.",
      image: wsImage4, // Replace with actual image path
    },
    {
      name: "Image Expansion",
      apiType: "image-expansion",
      description: "VirtuartAI’s Image Expansion Tools Seamlessly Enlarge Images Without Losing Quality.",
      image: wsImage5, // Replace with actual image path
    },
    {
      name: "AI Replacement",
      apiType: "ai-replacement",
      description: "VirtuartAI’s AI Replacement Tools Effortlessly Swap Elements In Images With Precision.",
      image: wsImage6, // Replace with actual image path
    },
    {
      name: "Sketch To Image",
      apiType: "sketch-to-image",
      description: "VirtuartAI’s Sketch-To-Image Tools Transform Sketches Into Detailed, Lifelike Images.",
      image: wsImage7, // Replace with actual image path
    },
  ];
  
  
const AITools = () => {
  return (
    <>
          <p className={styles.p1}>
            Try Out
        </p>
        <p className={styles.p2}>the most amazing AI tools.</p>
        <p className={styles.p3}>
        Are you looking for inspiration in art, architecture, or design? 
Using our AI tools, you can generate high-quality images, videos, or 3D objects. 
Trust VirtuartAI to bring your digital vision to life.
        </p>
    <div className={styles.aiToolsContainer}>
  
      {tools.map((tool, index) => (
        <Link key={index} to={`/gen?apiType=${tool.apiType}`} className={styles.aiToolCard}>
          <img src={tool.image} alt={tool.name} className={styles.aiToolImage} />
          <div className={styles.overlay}></div>

          <div className={styles.textContainer}>
            <span className={styles.label}>{tool.name}</span>
            <p className={styles.description}>
                {tool.description}            
                     <img src={arrow} alt={tool.name} className={styles.arrow}  />
            </p>

          </div>
        </Link>
      ))}
    </div>
    </>

  );
};

export default AITools;
