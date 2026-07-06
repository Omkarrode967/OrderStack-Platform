import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  // This hook grabs the '?token=xyz' from the URL!
  const [searchParams] = useSearchParams(); 
  const token = searchParams.get('token');
  
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8080";

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.warning("Passwords do not match!");
      return;
    }

    try {
      setIsLoading(true);
      // We will build this endpoint in Spring Boot next
      await axios.post(`${baseUrl}/api/auth/reset-password`, { token, newPassword: password });
      
      toast.success("Password reset successfully! You can now log in.");
      navigate('/login'); // kick them back to login page
    } catch (error) {
      toast.error("Failed to reset password. The link might be expired.");
      console.error("Reset password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="container mt-5 pt-5 text-center">
        <h3 className="text-danger">Invalid Reset Link</h3>
        <p>Please request a new password reset link.</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f4f9ff", minHeight: "100vh", paddingTop: "8rem", paddingBottom: "3rem" }}>
      <div className="container d-flex justify-content-center">
        <div className="card shadow-sm border-0 rounded-4" style={{ maxWidth: "450px", width: "100%", padding: "2.5rem" }}>
          
          <div className="text-center mb-4">
            <div className="d-inline-block p-3 rounded-circle bg-light mb-3 text-primary shadow-sm">
              <i className="bi bi-shield-lock" style={{ fontSize: "2.5rem" }}></i>
            </div>
            <h2 className="fw-bold" style={{ color: "#0a4297" }}>Create New Password</h2>
            <p className="text-muted">Your new password must be different from previous used passwords.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold text-dark">New Password</label>
              <input 
                type="password" 
                className="form-control bg-light border-0 py-2" 
                placeholder="Enter new password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold text-dark">Confirm New Password</label>
              <input 
                type="password" 
                className="form-control bg-light border-0 py-2" 
                placeholder="Confirm new password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100 py-2 rounded-pill fw-bold shadow-sm mb-3" 
              style={{ backgroundImage: "linear-gradient(45deg, #0052D4, #4364F7)", border: "none" }}
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default ResetPassword;