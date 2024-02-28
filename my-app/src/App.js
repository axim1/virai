import "./App.css";
import Profile from "./Components/Profile/Profile";
import Login from "./Components/Login/Login";
import Register from "./Components/Register/Register";
import Home from "./Components/Home/Home";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

function App() {
  const [userstate, setUserState] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (userstate && userstate._id) {
      console.log('User State:', userstate, userstate._id);
    }
  }, [userstate]);
  
  
  return (
    <div className="App">
      <Router>
        <Routes>
        <Route path="/" element={<Home/>}></Route>

          <Route
            path="/login"
            element={
              loggedIn ? (
                <Profile
                setLoggedIn={setLoggedIn}  
                  setUserState={setUserState}
                  username={userstate}
                />
              ) : (
                <Login setLoggedIn={setLoggedIn}  setUserState={setUserState} />
              )
            }
          ></Route>
          {/* <Route
            path="/login"
            element={<Login setLoggedIn={setLoggedIn} setUserState={setUserState} />}
          ></Route> */}
          <Route path="/signup" element={<Register />}></Route>

        </Routes>
      </Router>
    </div>
  );
}

export default App;
