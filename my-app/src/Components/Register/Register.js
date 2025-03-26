import React, { useEffect, useState } from "react";
import basestyle from "../Base.module.css";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";
import "./Register.css";
import Navbar from "../Navbar/Navbar";
const apiUrl = process.env.REACT_APP_API_URL;

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
    phone: "", // New field for phone number
    subscription: "",
  });

  const [profilePic, setProfilePic] = useState(null); // New state for profile picture

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setUserDetails({
      ...user,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setProfilePic(e.target.files[0]); // Store the uploaded file
  };

  const validateForm = (values) => {
    const error = {};
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!values.fname) error.fname = "First Name is required";
    if (!values.lname) error.lname = "Last Name is required";
    if (!values.email) {
      error.email = "Email is required";
    } else if (!regex.test(values.email)) {
      error.email = "Invalid email format";
    }
    if (!values.password) {
      error.password = "Password is required";
    } else if (values.password.length < 4) {
      error.password = "Password must be more than 4 characters";
    } else if (values.password.length > 10) {
      error.password = "Password cannot exceed 10 characters";
    }
    if (!values.cpassword) {
      error.cpassword = "Confirm Password is required";
    } else if (values.cpassword !== values.password) {
      error.cpassword = "Passwords must match";
    }
    if (!values.phone) {
      error.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(values.phone)) {
      error.phone = "Phone number must be 10 digits";
    }
    return error;
  };

  const signupHandler = (e) => {
    e.preventDefault();
    setFormErrors(validateForm(user));
    setIsSubmit(true);
  };

  useEffect(() => {
    const submitForm = async () => {
      if (Object.keys(formErrors).length === 0 && isSubmit) {
        try {
          const formData = new FormData();
          formData.append("fname", user.fname);
          formData.append("lname", user.lname);
          formData.append("email", user.email);
          formData.append("password", user.password);
          formData.append("phone", user.phone);
          formData.append("subscriptionName", 'FREE');
          if (profilePic) formData.append("profilePic", profilePic); // Append profile picture

          const response = await axios.post(`${apiUrl}api/signup`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          alert(response.data.message);
          navigate("/login", { replace: true });
        } catch (error) {
          console.error("Error during signup:", error);
          alert("Internal server error");
        }
      }
    };

    submitForm();
  }, [formErrors, isSubmit, user, profilePic, navigate]);

  useEffect(() => {
    axios.get(`${apiUrl}subscriptions`)
      .then((res) => setSubscriptions(res.data.subscriptions || []))
      .catch((error) => console.error("Error fetching subscriptions:", error));
  }, []);

  return (
    <>
      {/* <Navbar /> */}
      <div className="register">
        <form>
          <h1 className="mb-4">Create your account</h1>
          <input
            type="text"
            name="fname"
            placeholder="First Name"
            onChange={changeHandler}
            value={user.fname}
            className="form-control mb-3"
          />
          <p className={basestyle.error}>{formErrors.fname}</p>
          
          <input
            type="text"
            name="lname"
            placeholder="Last Name"
            onChange={changeHandler}
            value={user.lname}
            className="form-control mb-3"
          />
          <p className={basestyle.error}>{formErrors.lname}</p>
          
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={changeHandler}
            value={user.email}
            className="form-control mb-3"
          />
          <p className={basestyle.error}>{formErrors.email}</p>
          
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={changeHandler}
            value={user.password}
            className="form-control mb-3"
          />
          <p className={basestyle.error}>{formErrors.password}</p>
          
          <input
            type="password"
            name="cpassword"
            placeholder="Confirm Password"
            onChange={changeHandler}
            value={user.cpassword}
            className="form-control mb-3"
          />
          <p className={basestyle.error}>{formErrors.cpassword}</p>
          
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            onChange={changeHandler}
            value={user.phone}
            className="form-control mb-3"
          />
          <p className={basestyle.error}>{formErrors.phone}</p>
          
          <input
            type="file"
            name="profilePic"
            onChange={handleFileChange}
            className="form-control mb-3"
          />
          
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
