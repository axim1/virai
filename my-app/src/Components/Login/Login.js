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
      [name]: name === "email" ? value.toLowerCase() : value,
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
      navigate("/home", { replace: true });
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
    <>  
    {/* <Navbar/> */}
      <div className={loginstyle.login}>

      <form>
  <h1 className="mb-4">Login</h1>



  <input
    // type="email"
    name="email"
    placeholder="Email"
    onChange={changeHandler}
    value={user.email}
    className="form-container"
    autoComplete="off"
    autoCapitalize="off"
    autoCorrect="off"
    spellCheck="false"
    />

  <input
    type="password"
    name="password"
    placeholder="Password"
    onChange={changeHandler}
    value={user.password}
    className="form-container"
  />
  {Object.keys(formErrors).length > 0 && (
    <div className="form-errors">
      invalid email or password
    </div>
  )}
  <button
    type="button"
    className="registerButton"
    onClick={() => {
      const errors = validateForm(user);
      setFormErrors(errors);
      if (Object.keys(errors).length === 0) {
        loginHandler();
      }
    }}
  >
    Login
  </button>

  <div className="" style={{marginTop:'15px'}}>
        <NavLink to="/signup"  style={{ color: '#2E8B57' }} >Not yet registered? Register Now</NavLink>
      </div>
</form>




<button
  onClick={() => {
    window.location.href = `${process.env.REACT_APP_API_URL}auth/google`;
  }}
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'white',
    color: '#5f6368',
    border: '0px solid #dadce0',
    padding: '10px 16px',
    borderRadius: '40px',
    fontSize: '14px',
    fontWeight: 500,
    fontFamily: 'Poppins, sans-serif',
    cursor: 'pointer',
    margin: '50px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  }}
>
  <img
    src="https://developers.google.com/identity/images/g-logo.png"
    alt="Google"
    style={{ width: '18px', height: '18px' }}
  />
  Sign in with Google
</button>



{/* <button
  className="btn btn-dark"
  style={{ margin: '20px' }}
  onClick={() => {
    window.location.href = `${process.env.REACT_APP_API_URL}auth/apple`;
  }}
>
  Sign in with Apple
</button> */}

    </div>
    </>

  );
};

export default Login;
