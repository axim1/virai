import "./App.css";
import Profile from "./Components/Profile/Profile";
import Login from "./Components/Login/Login";
import Register from "./Components/Register/Register";
import Home from "./Components/Home/Home";
// import NewHome from "./Components/NewHome/NewHome";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import TermsOfService from "./Components/TermsOfService/TermsOfService";

// import { useEffect, useState } from "react";

function App() {
  const [userState, setUserState] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserState(JSON.parse(storedUser));
      setLoggedIn(true);
    }
  }, []);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={<Login setLoggedIn={setLoggedIn} setUserState={setUserState} />}
          />
          <Route path="/signup" element={<Register />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Routes>
      </Router>
    </div>
  );
}



export default App;
