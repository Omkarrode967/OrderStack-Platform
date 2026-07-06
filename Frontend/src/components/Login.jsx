import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../Context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8080";
  
  const { loginUser } = useContext(AuthContext);

  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.email || !credentials.password) {
      toast.warning("Please enter both email and password.");
      return;
    }
    
    try {
      const response = await axios.post(`${baseUrl}/api/login`, credentials);
      
      if (response.status === 200) {
        toast.success("Login successful! Welcome back.");
        loginUser(response.data); 
        navigate('/'); 
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error("Invalid email or password.");
      } else {
        toast.error("Something went wrong. Please try again.");
        console.error("Login error:", error);
      }
    }
  };

  return (
    <div style={{ backgroundColor: "#f4f9ff", minHeight: "100vh", paddingTop: "8rem", paddingBottom: "3rem" }}>
      <div className="container d-flex justify-content-center">
        
        <div className="card shadow-sm border-0 rounded-4" style={{ maxWidth: "450px", width: "100%", padding: "2.5rem" }}>
          
          <div className="text-center mb-4">
            <div className="d-inline-block p-3 rounded-circle bg-light mb-3 text-primary shadow-sm">
              <i className="bi bi-box-arrow-in-right" style={{ fontSize: "2.5rem" }}></i>
            </div>
            <h2 className="fw-bold" style={{ color: "#0a4297" }}>Welcome Back</h2>
            <p className="text-muted">Sign in to your OrderStack account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold text-dark">Email Address</label>
              <input 
                type="email" 
                className="form-control bg-light border-0 py-2" 
                name="email" 
                placeholder="name@example.com" 
                value={credentials.email} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="mb-4">
              {/* --- FORGOT PASSWORD LINK ADDED HERE --- */}
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label fw-semibold text-dark mb-0">Password</label>
                <Link to="/forgot-password" style={{ fontSize: "0.85rem", textDecoration: "none", color: "#0052D4" }} className="fw-semibold">
                  Forgot Password?
                </Link>
              </div>
              <input 
                type="password" 
                className="form-control bg-light border-0 py-2" 
                name="password" 
                placeholder="Enter your password" 
                value={credentials.password} 
                onChange={handleChange} 
                required 
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100 py-2 rounded-pill fw-bold shadow-sm mb-3" 
              style={{ backgroundImage: "linear-gradient(45deg, #0052D4, #4364F7)", border: "none" }}
            >
              Sign In
            </button>
            
            <div className="d-flex align-items-center my-3">
              <hr className="flex-grow-1" />
              <span className="mx-3 text-muted small fw-bold">OR</span>
              <hr className="flex-grow-1" />
            </div>

            <a 
              href={`${baseUrl}/oauth2/authorization/google`}
              className="btn btn-outline-dark w-100 py-2 rounded-pill fw-bold shadow-sm mb-3 d-flex justify-content-center align-items-center"
            >
              <i className="bi bi-google text-danger me-2"></i> Continue with Google
            </a>

            <div className="text-center mt-3">
              <p className="text-muted mb-0">
                Don't have an account? <Link to="/register" className="fw-bold" style={{ color: "#0052D4", textDecoration: "none" }}>Register here</Link>
              </p>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;