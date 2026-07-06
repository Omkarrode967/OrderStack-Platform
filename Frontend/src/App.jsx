import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AppProvider } from "./Context/Context";
import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import AdminDashboard from './components/AdminDashboard';

// Components
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Cart from "./components/Cart";
import AddProduct from "./components/AddProduct";
import Product from "./components/Product";
import UpdateProduct from "./components/UpdateProduct";
import SearchResults from "./components/SearchResults";

// Global Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "react-toastify/dist/ReactToastify.css"; // Essential for the toasts to look correct

function App() {
  // 🚀 We removed the local selectedCategory state!
  // Navbar and Home will now get it directly from AppProvider.

  return (
    <AppProvider>
      <BrowserRouter>
        {/* Global Toast Configuration */}
        <ToastContainer 
          position="top-right"
          autoClose={2000} 
          hideProgressBar={true} 
          newestOnTop={true}
          closeOnClick
        />
        
        {/* No more props needed here! */}
        <Navbar />
        
        {/* Added top padding so the fixed Navbar doesn't hide your content */}
        <div className="min-vh-100 transition-theme" style={{ paddingTop: '80px', paddingBottom: '40px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/add_product" element={<AddProduct />} />
            <Route path="/product" element={<Product />} /> {/* Fallback route */}
            <Route path="/product/:id" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/product/update/:id" element={<UpdateProduct />} />
            <Route path="/search-results" element={<SearchResults />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;