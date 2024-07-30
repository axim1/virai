import React, { useState, useEffect } from "react";
import basestyle from "../Base.module.css";
import loginstyle from "./Login.module.css";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../Navbar/Navbar";
const apiUrl = process.env.REACT_APP_API_URL;

const Login = ({ setLoggedIn, setUserState }) => {
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState({});
  const [user, setUserDetails] = useState({
    email: "",
    password: "",
  });

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setUserDetails({
      ...user,
      [name]: value,
    });
  };

  const validateForm = (values) => {
    const error = {};
    const regex = /^[^\s+@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!values.email) {
      error.email = "Email is required";
    } else if (!regex.test(values.email)) {
      error.email = "Please enter a valid email address";
    }
    if (!values.password) {
      error.password = "Password is required";
    }
    return error;
  };
  const loginHandler = async () => {
    try {
      console.log("env var:", apiUrl);
      const response = await axios.post(`${apiUrl}login`, user);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setUserState(response.data.user);
      setLoggedIn(true); // Trigger a state update in Navbar component
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
      if (error.response && error.response.status === 401) {
        setFormErrors({
          email: "Invalid email or password",
          password: "Invalid email or password",
        });
      } else {
        alert("An error occurred during login. Please try again.");
      }
    }
  };
  

  // useEffect(() => {
  //   if (Object.keys(formErrors).length === 0) {
  //     loginHandler();
  //   }
  // }, [formErrors]);

  return (
    <>  <Navbar/>
      <div className={loginstyle.login}>

      <form>
        <h1 className="mb-4">Login</h1>
        <div className="mb-3">
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Email"
            onChange={changeHandler}
            value={user.email}
            className="form-control"
          />
          <p className={basestyle.error}>{formErrors.email}</p>
        </div>
        <div className="mb-3">
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Password"
            onChange={changeHandler}
            value={user.password}
            className="form-control"
          />
          <p className={basestyle.error}>{formErrors.password}</p>
        </div>
        <button type="button" className="btn btn-primary btn-block" onClick={loginHandler}>
          Login
        </button>
      </form>
      <div className="mt-3 text-center">
        <NavLink to="/signup">Not yet registered? Register Now</NavLink>
      </div>
    </div>
    </>

  );
};

export default Login;
