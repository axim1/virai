// Register.jsx
// import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS

import React, { useEffect, useState } from "react";
import basestyle from "../Base.module.css";
// import registerstyle from "./Register.module.css";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";
import "./Register.css"

const Register = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);
  const [user, setUserDetails] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
    cpassword: "",
    subscription: "",
  });
  

  // Add the following line to define setSelectedSubscription
  const [selectedSubscription, setSelectedSubscription] = useState("");

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setUserDetails({
      ...user,
      [name]: value,
    });

    // Handle the selected subscription separately
    if (name === "subscription") {
      setSelectedSubscription(value);
    }
  };

  const validateForm = (values) => {
    const error = {};
    const regex = /^[^\s+@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!values.fname) {
      error.fname = "First Name is required";
    }
    if (!values.lname) {
      error.lname = "Last Name is required";
    }
    if (!values.email) {
      error.email = "Email is required";
    } else if (!regex.test(values.email)) {
      error.email = "This is not a valid email format!";
    }
    if (!values.password) {
      error.password = "Password is required";
    } else if (values.password.length < 4) {
      error.password = "Password must be more than 4 characters";
    } else if (values.password.length > 10) {
      error.password = "Password cannot exceed more than 10 characters";
    }
    if (!values.cpassword) {
      error.cpassword = "Confirm Password is required";
    } else if (values.cpassword !== values.password) {
      error.cpassword = "Confirm password and password should be same";
    }
    return error;
  };

const signupHandler = (e) => {
  e.preventDefault(); // Prevent the default form submission behavior
  setFormErrors(validateForm(user));
  setIsSubmit(true);
};

useEffect(() => {
  const submitForm = async () => {
    if (Object.keys(formErrors).length === 0 && isSubmit) {
      try {
        const response = await axios.post("http://localhost:8000/api/signup", {
          ...user,
          subscriptionName: selectedSubscription,
        });

        alert(response.data.message);
        navigate("/login", { replace: true });
      } catch (error) {
        console.error("Error during signup:", error);
        alert("Internal server error");
      }
    }
  };

  submitForm(); // Call the asynchronous function directly

}, [formErrors, isSubmit, user, selectedSubscription, navigate]);

useEffect(() => {
  axios.get("http://localhost:8000/subscriptions")
    .then((res) => {
      setSubscriptions(res.data.subscriptions || []); // Provide a default empty array
    })
    .catch((error) => {
      console.error("Error fetching subscriptions:", error);
    });
}, []);


  return (
    <>
    <div>this is div</div>
      <div className="register">
        <form>
          <h1 className="mb-4">Create your account</h1>
          <input
            type="text"
            name="fname"
            id="fname"
            placeholder="First Name"
            onChange={changeHandler}
            value={user.fname}
            className="form-control mb-3"
          />
          <p className={basestyle.error}>{formErrors.fname}</p>
          <input
            type="text"
            name="lname"
            id="lname"
            placeholder="Last Name"
            onChange={changeHandler}
            value={user.lname}
            className="form-control mb-3"
          />
          <p className={basestyle.error}>{formErrors.lname}</p>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Email"
            onChange={changeHandler}
            value={user.email}
            className="form-control mb-3"
          />
          <p className={basestyle.error}>{formErrors.email}</p>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Password"
            onChange={changeHandler}
            value={user.password}
            className="form-control mb-3"
          />
          <p className={basestyle.error}>{formErrors.password}</p>
          <input
            type="password"
            name="cpassword"
            id="cpassword"
            placeholder="Confirm Password"
            onChange={changeHandler}
            value={user.cpassword}
            className="form-control mb-3"
          />
          <select name="subscription" onChange={changeHandler} value={user.subscription} className="form-control mb-3">
            <option value="">Select Subscription</option>
            {subscriptions.map((subscription) => (
              <option key={subscription.id} value={subscription.name}>
                {subscription.name}
              </option>
            ))}
          </select>
          <p className={basestyle.error}>{formErrors.cpassword}</p>
          <button className="btn btn-primary btn-block" onClick={signupHandler}>
            Register
          </button>
        </form>
        <NavLink to="/login" className="mt-3 d-block text-center">
          Already registered? Login
        </NavLink>
      </div>
    </>
  );
};

export default Register;