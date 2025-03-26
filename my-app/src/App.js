import "./App.css";
// import Profile from "./Components/Profile/Profile";
import Login from "./Components/Login/Login";
import Register from "./Components/Register/Register";
import Home from "./Components/Home/Home";
import TermsOfService from "./Components/TermsOfService/TermsOfService";
import ImageGenerator from "./Components/ImageGenerator/ImageGenerator";
import Navbar from "./Components/Navbar/Navbar"; // Import the Navbar component
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Footer from "./Components/Home/Components/Footer";

function App() {
  const [userState, setUserState] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);
  const [scrollY, setScrollY] = useState(0); // State to track scroll position
  const [triggerShrink, setTriggerShrink] = useState(false); // State to trigger hero section shrink

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserState(JSON.parse(storedUser));
      setLoggedIn(true);
    }
  }, []);

  // Function to trigger hero shrink effect when "AI Tools" is clicked
  const handleAIToolsClick = () => {
    setTriggerShrink(true);
  };

  // Function to reset everything when "Home" is clicked
  const handleHomeClick = () => {
    setTriggerShrink(false); // Reset the hero shrink effect
    setScrollY(0); // Reset scroll position to top
    window.scrollTo(0, 0); // Scroll back to the top
  };

  return (
    <div className="App">
      <Router>
        {/* Render Navbar on every page and pass down the props */}
        <Navbar
          // user={userState}
          loggedIn={loggedIn}
          setLoggedIn={setLoggedIn}
          onAIToolsClick={handleAIToolsClick} // Pass down the AI Tools click handler
          onHomeClick={handleHomeClick} // Pass down the Home click handler
        />

        <Routes>
          {/* Home Route */}
          <Route path="/" element={<Home triggerShrink={triggerShrink} />} />
          <Route path="/home" element={<Home triggerShrink={triggerShrink} />} />

          {/* Login Route */}
          <Route
            path="/login"
            element={<Login setLoggedIn={setLoggedIn} setUserState={setUserState} />}
          />

          {/* Register Route */}
          <Route path="/signup" element={<Register />} />

          {/* Image Generator Route */}
          <Route path="/gen" element={<ImageGenerator />} />

          {/* Terms of Service Route */}
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Routes>
        <Footer/>
      </Router>
    </div>
  );
}

export default App;
