import "./App.css";
import { useLocation } from "react-router-dom";
import Login from "./Components/Login/Login";
import Register from "./Components/Register/Register";
import Home from "./Components/Home/Home";
import TermsOfService from "./Components/TermsOfService/TermsOfService";
import ImageGenerator from "./Components/ImageGenerator/ImageGenerator";
import Navbar from "./Components/Navbar/Navbar"; // Import the Navbar component
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Footer from "./Components/Home/Components/Footer";
import ImageGallery from "./Components/ImageGallery/ImageGallery";
import Chatgpt from './Components/Chatgpt/Chatgpt'
import Profile from './Components/Profile/Profile'
import AuthSuccess from "./Components/Login/AuthSuccess";

function App() {
  // const location = useLocation();

  const [userState, setUserState] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);
  const [scrollY, setScrollY] = useState(0); // State to track scroll position
  const [triggerShrink, setTriggerShrink] = useState(false); // State to trigger hero section shrink
  const [activeSection, setActiveSection] = useState('');
  // const location = useLocation();                      // ← new

// for a new build

  // useEffect(() => {
  //   switch (location.pathname) {
  //     case '/':
  //     case '/home':
  //       setActiveSection('home');
  //       break;
  //     case '/gen':
  //       setActiveSection('compo');     // your “Creation” key
  //       break;
  //     case '/gallery':
  //       setActiveSection('gallery');
  //       break;
  //     case '/chat-ai':
  //       setActiveSection('chat-ai');
  //       break;
  //     default:
  //       setActiveSection('home');
  //   }
  // }, [location.pathname]);
  useEffect(() => {
    const fetchAndUpdateUser = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

      if (!storedUser || !storedUser._id) {
        console.warn("No user in localStorage");
        return;
      }

      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}api/user/${storedUser._id}`);
        const data = await res.json();

        if (data.user) {
          const updatedUser = { ...storedUser, ...data.user };
          setUserState(updatedUser);
          setLoggedIn(true);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } else {
          console.warn("User data not returned from backend");
        }
      } catch (error) {
        console.error("Error refreshing user:", error);
      }
    };

    fetchAndUpdateUser();
  }, []);


  // Function to trigger hero shrink effect when "AI Tools" is clicked
  // const handleAIToolsClick = () => {
  //   // setTriggerShrink(true);
  // };

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
          loggedIn={loggedIn}
          setLoggedIn={setLoggedIn}
          onHomeClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          activeLink={activeSection}
          setActiveLink={setActiveSection}
        />

        <Routes>
          {/* Home Route */}
          <Route
            path="/"
            element={
              <Home
                triggerShrink={triggerShrink}
                activeLink={activeSection}
                setActiveLink={setActiveSection}
              />
              // <Home
              //   triggerShrink={triggerShrink}
              //   // scrollToSection={scrollToSection}
              // />
            }
          />
          <Route path="/home" element={<Home
            triggerShrink={triggerShrink}
            activeLink={activeSection}
            setActiveLink={setActiveSection}
          />} />

          {/* Login Route */}
          <Route
            path="/login"
            element={<Login setLoggedIn={setLoggedIn} setUserState={setUserState} />}
          />

          {/* Register Route */}
          <Route path="/signup" element={<Register />} />

          {/* Image Generator Route */}
          <Route path="/gen" element={<ImageGenerator />} />
          <Route path="/gallery" element={<ImageGallery />} />
          <Route path="/chat-ai" element={<Chatgpt />} />
          <Route path="/user" element={<Profile />} />
          <Route
  path="/auth-success"
  element={<AuthSuccess setLoggedIn={setLoggedIn} setUserState={setUserState} />}
/>


          {/* Terms of Service Route */}
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Routes>
        <Footer loggedIn={loggedIn}
          setLoggedIn={setLoggedIn}

        />
      </Router>
    </div>
  );
}

export default App;
