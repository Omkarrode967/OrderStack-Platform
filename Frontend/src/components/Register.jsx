import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();

  // Single state object for clean Spring Boot integration
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    gender: '',
    address: '',
    city: '',
    pincode: '',
    state: '',
    password: ''
  });

  // State to hold validation errors
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (formData.mobile.length !== 10 || isNaN(formData.mobile)) {
      newErrors.mobile = "Mobile number must be exactly 10 digits.";
    }
    if (formData.pincode.length !== 6 || isNaN(formData.pincode)) {
      newErrors.pincode = "Pincode must be exactly 6 digits.";
    }
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8080";

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        // Sending the data to our new Spring Boot endpoint
        const response = await axios.post(`${baseUrl}/api/register`, formData);
        
        if (response.status === 201) {
          toast.success("Account created successfully! Please log in.");
          handleReset(); // Clears the form after success
          // navigate('/login'); // We can uncomment this once the login page is built!
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          // This catches the "User with this email already exists." exception from our backend
          toast.error(error.response.data);
        } else {
          toast.error("Registration failed. Please try again.");
          console.error("Error connecting to backend:", error);
        }
      }
    } else {
      toast.error("Please fix the errors in the form.");
    }
  };

  const handleReset = () => {
    setFormData({
      name: '', email: '', mobile: '', gender: '', 
      address: '', city: '', pincode: '', state: '', password: ''
    });
    setErrors({});
  };

  return (
    <div style={{ paddingTop: "7rem", paddingBottom: "5rem" }}>
      <div className="container d-flex justify-content-center">
        
        <div 
          className="card border-0 p-4 p-md-5" 
          style={{ 
            maxWidth: "800px", 
            width: "100%", 
            background: "rgba(255, 255, 255, 0.9)", 
            backdropFilter: "blur(15px)", 
            WebkitBackdropFilter: "blur(15px)",
            borderRadius: "2rem", 
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.05)" 
          }}
        >
          
          <div className="text-center mb-5">
            <div 
              className="d-inline-flex justify-content-center align-items-center rounded-circle mb-3 shadow-sm"
              style={{ width: "80px", height: "80px", background: "linear-gradient(45deg, #3b82f6, #8b5cf6)", color: "white" }}
            >
              <i className="bi bi-person-bounding-box" style={{ fontSize: "2.5rem" }}></i>
            </div>
            <h2 className="fw-bolder display-6" style={{ color: "#0f172a", letterSpacing: "-1px" }}>Join OrderStack</h2>
            <p className="text-muted fs-5">Create an account to start your premium shopping experience</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-bold" style={{ color: "#475569", fontSize: "0.9rem" }}>Full Name</label>
                <input type="text" className="form-control form-control-lg bg-light border-0 shadow-sm rounded-3 px-4" style={{ fontSize: "0.95rem" }} name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold" style={{ color: "#475569", fontSize: "0.9rem" }}>Email Address</label>
                <input type="email" className="form-control form-control-lg bg-light border-0 shadow-sm rounded-3 px-4" style={{ fontSize: "0.95rem" }} name="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="row g-4 mb-4 align-items-center">
              <div className="col-md-6">
                <label className="form-label fw-bold" style={{ color: "#475569", fontSize: "0.9rem" }}>Mobile Number</label>
                <input type="tel" className={`form-control form-control-lg bg-light border-0 shadow-sm rounded-3 px-4 ${errors.mobile ? 'is-invalid border border-danger' : ''}`} style={{ fontSize: "0.95rem" }} name="mobile" placeholder="10-digit mobile number" value={formData.mobile} onChange={handleChange} required />
                {errors.mobile && <div className="invalid-feedback fw-medium">{errors.mobile}</div>}
              </div>
              
              <div className="col-md-6">
                <label className="form-label fw-bold d-block mb-3" style={{ color: "#475569", fontSize: "0.9rem" }}>Gender</label>
                <div className="d-flex gap-4">
                  <div className="form-check custom-radio">
                    <input className="form-check-input shadow-sm" type="radio" name="gender" id="male" value="Male" checked={formData.gender === 'Male'} onChange={handleChange} />
                    <label className="form-check-label fw-semibold text-dark" htmlFor="male">Male</label>
                  </div>
                  <div className="form-check custom-radio">
                    <input className="form-check-input shadow-sm" type="radio" name="gender" id="female" value="Female" checked={formData.gender === 'Female'} onChange={handleChange} />
                    <label className="form-check-label fw-semibold text-dark" htmlFor="female">Female</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold" style={{ color: "#475569", fontSize: "0.9rem" }}>Street Address</label>
              <input type="text" className="form-control form-control-lg bg-light border-0 shadow-sm rounded-3 px-4" style={{ fontSize: "0.95rem" }} name="address" placeholder="Flat, House no., Building, Company, Apartment" value={formData.address} onChange={handleChange} required />
            </div>

            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-bold" style={{ color: "#475569", fontSize: "0.9rem" }}>City</label>
                <input type="text" className="form-control form-control-lg bg-light border-0 shadow-sm rounded-3 px-4" style={{ fontSize: "0.95rem" }} name="city" placeholder="City/District/Town" value={formData.city} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold" style={{ color: "#475569", fontSize: "0.9rem" }}>Pincode</label>
                <input type="text" className={`form-control form-control-lg bg-light border-0 shadow-sm rounded-3 px-4 ${errors.pincode ? 'is-invalid border border-danger' : ''}`} style={{ fontSize: "0.95rem" }} name="pincode" placeholder="6-digit Pincode" value={formData.pincode} onChange={handleChange} required />
                {errors.pincode && <div className="invalid-feedback fw-medium">{errors.pincode}</div>}
              </div>
            </div>

            <div className="row g-4 mb-5">
              <div className="col-md-6">
                <label className="form-label fw-bold" style={{ color: "#475569", fontSize: "0.9rem" }}>State</label>
                <select className="form-select form-select-lg bg-light border-0 shadow-sm rounded-3 px-4" style={{ fontSize: "0.95rem", color: formData.state ? "#0f172a" : "#94a3b8" }} name="state" value={formData.state} onChange={handleChange} required>
                  <option value="" disabled>-- Select State --</option>
                  <option value="Maharashtra" style={{ color: "#0f172a" }}>Maharashtra</option>
                  <option value="Karnataka" style={{ color: "#0f172a" }}>Karnataka</option>
                  <option value="Delhi" style={{ color: "#0f172a" }}>Delhi</option>
                  <option value="Tamil Nadu" style={{ color: "#0f172a" }}>Tamil Nadu</option>
                  <option value="Telangana" style={{ color: "#0f172a" }}>Telangana</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold" style={{ color: "#475569", fontSize: "0.9rem" }}>Password</label>
                <input type="password" className={`form-control form-control-lg bg-light border-0 shadow-sm rounded-3 px-4 ${errors.password ? 'is-invalid border border-danger' : ''}`} style={{ fontSize: "0.95rem" }} name="password" placeholder="Create a strong password" value={formData.password} onChange={handleChange} required />
                {errors.password && <div className="invalid-feedback fw-medium">{errors.password}</div>}
              </div>
            </div>

            <div className="d-flex flex-column flex-md-row justify-content-center gap-3 mb-4 pt-4 border-top border-secondary-subtle">
              <button 
                type="submit" 
                className="btn text-white px-5 py-3 rounded-pill fw-bold shadow-sm" 
                style={{ 
                  background: "linear-gradient(45deg, #3b82f6, #8b5cf6)", 
                  border: "none",
                  transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 10px 20px rgba(139, 92, 246, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 0.125rem 0.25rem rgba(0,0,0,0.075)";
                }}
              >
                Create Account <i className="bi bi-arrow-right-short ms-1 fs-5 align-middle"></i>
              </button>
              
              <button 
                type="button" 
                className="btn px-5 py-3 rounded-pill fw-bold" 
                onClick={handleReset}
                style={{ 
                  background: "#f1f5f9", 
                  color: "#64748b", 
                  border: "none",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#e2e8f0";
                  e.currentTarget.style.color = "#475569";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f1f5f9";
                  e.currentTarget.style.color = "#64748b";
                }}
              >
                Clear Form
              </button>
            </div>

            <div className="text-center mt-3">
              <p className="text-muted fw-medium mb-0 fs-6">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="fw-bold" 
                  style={{ color: "#8b5cf6", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#3b82f6"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#8b5cf6"}
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Register;