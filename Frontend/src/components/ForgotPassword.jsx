import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8080";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.warning("Please enter your email address.");
      return;
    }

    try {
      setIsLoading(true);
      // We will build this backend endpoint next!
      await axios.post(`${baseUrl}/api/auth/forgot-password`, { email });
      toast.success("If an account exists, a reset link has been sent to your email.");
      setEmail(''); // clear input
    } catch (error) {
      toast.error("Failed to send reset link. Please try again.");
      console.error("Forgot password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#f4f9ff", minHeight: "100vh", paddingTop: "8rem", paddingBottom: "3rem" }}>
      <div className="container d-flex justify-content-center">
        <div className="card shadow-sm border-0 rounded-4" style={{ maxWidth: "450px", width: "100%", padding: "2.5rem" }}>
          
          <div className="text-center mb-4">
            <div className="d-inline-block p-3 rounded-circle bg-light mb-3 text-primary shadow-sm">
              <i className="bi bi-envelope-at" style={{ fontSize: "2.5rem" }}></i>
            </div>
            <h2 className="fw-bold" style={{ color: "#0a4297" }}>Forgot Password?</h2>
            <p className="text-muted">Enter your email and we'll send you a link to reset your password.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label fw-semibold text-dark">Email Address</label>
              <input 
                type="email" 
                className="form-control bg-light border-0 py-2" 
                placeholder="name@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100 py-2 rounded-pill fw-bold shadow-sm mb-3" 
              style={{ backgroundImage: "linear-gradient(45deg, #0052D4, #4364F7)", border: "none" }}
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="text-center mt-3">
              <p className="text-muted mb-0">
                Remember your password? <Link to="/login" className="fw-bold" style={{ color: "#0052D4", textDecoration: "none" }}>Back to Login</Link>
              </p>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;