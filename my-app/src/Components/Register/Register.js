// Register.jsx
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
    phone: "",
    subscription: "",
    userType: "individual",
    companyName: "",
    address: "",
    vatNumber: "",
  });

  const [profilePic, setProfilePic] = useState(null);

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setUserDetails({ ...user, [name]: value });
  };

  const handleFileChange = (e) => {
    setProfilePic(e.target.files[0]);
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
  const signupHandler = async (e) => {
    e.preventDefault();
  
    const errors = validateForm(user);
    setFormErrors(errors);
  
    if (Object.keys(errors).length === 0) {
      try {
        const formData = new FormData();
        formData.append("fname", user.fname);
        formData.append("lname", user.lname);
        formData.append("email", user.email);
        formData.append("password", user.password);
        formData.append("phone", user.phone);
        formData.append("subscriptionName", "FREE");
  
        if (profilePic) formData.append("profilePic", profilePic);
        formData.append("userType", user.userType);
        if (user.userType === "company") {
          formData.append("companyName", user.companyName);
          formData.append("address", user.address);
          formData.append("vatNumber", user.vatNumber);
        }
  
        const response = await axios.post(`${apiUrl}api/signup`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
  
        alert(response.data.message);
        navigate("/login", { replace: true });
      } catch (error) {
        console.error("Error during signup:", error);
        alert("Internal server error");
      }
    } else {
      console.log("Form validation failed", errors);
    }
  };
  
  // const signupHandler = (e) => {
  //   e.preventDefault();
  //   console.log('registering user 1')

  //   setFormErrors(validateForm(user));
  //   setIsSubmit(true);
  // };

  // useEffect(() => {
  //   const submitForm = async () => {
  //     if (Object.keys(formErrors).length === 0 && isSubmit) {
  //       try {
  //         console.log('registering user')
  //         const formData = new FormData();
  //         formData.append("fname", user.fname);
  //         formData.append("lname", user.lname);
  //         formData.append("email", user.email);
  //         formData.append("password", user.password);
  //         formData.append("phone", user.phone);
  //         formData.append("subscriptionName", 'FREE');
  //         if (profilePic) formData.append("profilePic", profilePic);
  //         formData.append("userType", user.userType);
  //         if (user.userType === "company") {
  //           formData.append("companyName", user.companyName);
  //           formData.append("address", user.address);
  //           formData.append("vatNumber", user.vatNumber);
  //         }

  //         const response = await axios.post(`${apiUrl}api/signup`, formData, {
  //           headers: { "Content-Type": "multipart/form-data" },
  //         });

  //         alert(response.data.message);
  //         navigate("/login", { replace: true });
  //       } catch (error) {
  //         console.error("Error during signup:", error);
  //         alert("Internal server error");
  //       }
  //     }
  //   };

  //   submitForm();
  // }, [formErrors, isSubmit, user, profilePic, navigate]);

  useEffect(() => {
    axios.get(`${apiUrl}subscriptions`)
      .then((res) => setSubscriptions(res.data.subscriptions || []))
      .catch((error) => console.error("Error fetching subscriptions:", error));
  }, []);

  return (
    <>
      <Navbar />
      <div className="register">
        <form>
          <h1 className="mb-4">Create your account</h1>

          <select name="userType" onChange={changeHandler} value={user.userType} className="form-container form-ddd">
            <option value="individual">Individual</option>
            <option value="company">Company</option>
          </select>

          <input name="fname" placeholder="First Name" onChange={changeHandler} value={user.fname} className="form-container" />
          {/* <p className={basestyle.error}>{formErrors.fname}</p> */}

          <input name="lname" placeholder="Last Name" onChange={changeHandler} value={user.lname} className="form-container" />
          {/* <p className={basestyle.error}>{formErrors.lname}</p> */}

          <input name="email" placeholder="Email" onChange={changeHandler} value={user.email} className="form-container" />
          {/* <p className={basestyle.error}>{formErrors.email}</p> */}

          <input type="password" name="password" placeholder="Password" onChange={changeHandler} value={user.password} className="form-container" />
          {/* <p className={basestyle.error}>{formErrors.password}</p> */}

          <input type="password" name="cpassword" placeholder="Confirm Password" onChange={changeHandler} value={user.cpassword} className="form-container" />
          {/* <p className={basestyle.error}>{formErrors.cpassword}</p> */}

          <input name="phone" placeholder="Phone Number" onChange={changeHandler} value={user.phone} className="form-container" />
          {/* <p className={basestyle.error}>{formErrors.phone}</p> */}

          <label htmlFor="profilePic" style={{padding:'10px'}} className="form-container upload-label">
  Upload Profile Picture
</label>
<input
  type="file"
  style={{display:'none'}}
  id="profilePic"
  name="profilePic"
  onChange={handleFileChange}
/>

          {user.userType === "company" && (
            <>
              <input  name="companyName" placeholder="Company Name" onChange={changeHandler} value={user.companyName} className="form-container" />
              <input  name="address" placeholder="Company Address" onChange={changeHandler} value={user.address} className="form-container" />
              <input  name="vatNumber" placeholder="VAT Number" onChange={changeHandler} value={user.vatNumber} className="form-container" />
            </>
          )}

{/* Display validation errors here */}
{Object.keys(formErrors).length > 0 && (
         <p className='form-errors'>Please fill all required fields</p> 

  // <div className="form-errors">
  //   <ul>
  //     {Object.values(formErrors).map((error, index) => (
  //       <li key={index}>{error}</li>
  //     ))}
  //   </ul>
  // </div>
)}


          <button className="registerButton" onClick={signupHandler}>REGISTER</button>
   

          <NavLink to="/login" style={{ color: '#2E8B57' }} className="mt-3 d-block text-center">
          Already registered? Login
        </NavLink>
        </form>


      </div>
    </>
  );
};

export default Register;
