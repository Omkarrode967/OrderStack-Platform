import React, { useEffect, useRef, useState, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../Context/AuthContext";


const Navbar = ({ onSelectCategory }) => {
  const getInitialTheme = () => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme ? storedTheme : "light-theme";
  };
  
  const { user, logoutUser } = useContext(AuthContext); 

  const [theme, setTheme] = useState(getInitialTheme());
  const [input, setInput] = useState("");
  const [showNoProductsMessage, setShowNoProductsMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const navbarRef = useRef(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const baseUrl = import.meta.env.VITE_BASE_URL;

useEffect(() => {
    if (location.pathname !== '/search-results') {
      setInput(""); 
      setShowNoProductsMessage(false); // Also clears the "No products found" warning just in case
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setIsNavCollapsed(true);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchInitialData = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/products`);
      console.log(response.data, 'navbar initial data');
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const handleNavbarToggle = () => setIsNavCollapsed(!isNavCollapsed);
  const handleLinkClick = () => setIsNavCollapsed(true);
  const handleInputChange = (value) => setInput(value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    setShowNoProductsMessage(false);
    setIsLoading(true);
    setIsNavCollapsed(true);
    try {
      const response = await axios.get(`${baseUrl}/api/products/search?keyword=${input}`);
      if (response.data.length === 0) {
        setShowNoProductsMessage(true);
      } else {
        navigate(`/search-results`, { state: { searchData: response.data } });
      }
    } catch (error) {
      setShowNoProductsMessage(true);
    } finally {
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);
  
  return (
    <nav 
      className="navbar navbar-expand-lg fixed-top shadow-sm" 
      ref={navbarRef}
      style={{ 
        background: "rgba(255, 255, 255, 0.85)", 
        backdropFilter: "blur(12px)", 
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.05)"
      }}
    >
      <div className="container-fluid px-lg-5">
          {/* GRADIENT LOGO UPGRADE */}
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <i className="bi bi-cart4" style={{ fontSize: "1.8rem", color: "#8b5cf6" }}></i>
            <span className="fw-bolder" style={{ 
              fontSize: "1.5rem", 
              letterSpacing: "-0.5px",
              background: "linear-gradient(45deg, #3b82f6, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              OrderStack
            </span>
          </Link>
        
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          onClick={handleNavbarToggle}
          aria-expanded={!isNavCollapsed}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`} id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            <li className="nav-item">
              <Link 
                className="nav-link fw-bold text-dark px-3 rounded-pill" 
                to="/" 
                onClick={handleLinkClick}
                style={{ transition: "background 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.05)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                Home
              </Link>
            </li>
          </ul>
          
          <div className="d-flex align-items-center flex-wrap gap-3">
            
            {/* ONLY SHOW CART IF USER IS NOT AN ADMIN */}
            {user?.role !== 'ADMIN' && (
              <Link 
                to="/cart" 
                className="nav-link text-dark fw-bold d-flex align-items-center rounded-pill px-3 py-2" 
                onClick={handleLinkClick}
                style={{ transition: "all 0.2s", backgroundColor: "rgba(0,0,0,0.03)" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.08)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.03)"}
              >
                <i className="bi bi-cart3 me-2 fs-5"></i> Cart
              </Link>
            )}

            {/* UPGRADED SEARCH BAR */}
            <form className="d-flex position-relative" role="search" onSubmit={handleSubmit}>
              <div className="input-group shadow-sm rounded-pill overflow-hidden bg-white border">
                <input
                  className="form-control border-0 bg-transparent shadow-none px-4"
                  type="search"
                  placeholder="Type to search..."
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  style={{ minWidth: "220px" }}
                />
                <button 
                  className="btn px-4 fw-bold text-white border-0" 
                  type="submit" 
                  disabled={isLoading}
                  style={{ background: "linear-gradient(45deg, #3b82f6, #8b5cf6)", transition: "opacity 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                >
                  {isLoading ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-search"></i>}
                </button>
              </div>
              
              {/* STYLISH NO PRODUCTS ALERT */}
              {showNoProductsMessage && (
                <div 
                  className="alert alert-warning position-absolute shadow-lg border-0 rounded-4 d-flex align-items-center gap-2" 
                  style={{ top: "120%", right: 0, zIndex: 1000, minWidth: "250px" }}
                >
                  <i className="bi bi-exclamation-circle-fill text-warning fs-5"></i>
                  <span className="fw-semibold mb-0 text-dark">No products found.</span>
                </div>
              )}
            </form>
            
            <div className="d-flex align-items-center gap-3 ms-lg-2 mt-3 mt-lg-0 border-start ps-lg-3">
              {/* DYNAMIC AUTH LINKS */}
              {user ? (
                <>
                  {/* PREMIUM PROFILE PILL */}
                  <Link 
                    to={user.role === 'ADMIN' ? "/admin/dashboard" : "/profile"} 
                    className="nav-link fw-bolder d-flex align-items-center px-4 py-2 rounded-pill shadow-sm" 
                    onClick={handleLinkClick}
                    style={{ 
                      background: "linear-gradient(45deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1))",
                      color: "#8b5cf6",
                      border: "1px solid rgba(139, 92, 246, 0.2)",
                      transition: "transform 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    <i className="bi bi-person-circle me-2 fs-5"></i> {user.name}
                  </Link>

                  {/* DYNAMIC LOGOUT BUTTON */}
                  <button 
                    className="btn rounded-pill fw-bold px-4 py-2 shadow-sm" 
                    onClick={() => { logoutUser(); handleLinkClick(); navigate('/'); }}
                    style={{ 
                      background: "#fff",
                      color: "#ef4444",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                      transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#ef4444";
                      e.currentTarget.style.color = "#fff";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 15px rgba(239, 68, 68, 0.25)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#fff";
                      e.currentTarget.style.color = "#ef4444";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 0.125rem 0.25rem rgba(0,0,0,0.075)";
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/register" className="nav-link text-dark fw-bold" onClick={handleLinkClick}>
                    <i className="bi bi-person-plus me-1 text-primary"></i> Register
                  </Link>
                  <Link to="/login" className="btn text-white fw-bold rounded-pill px-4 shadow-sm" onClick={handleLinkClick} style={{ background: "#1e293b" }}>
                    Login <i className="bi bi-box-arrow-in-right ms-1"></i>
                  </Link>
                </>
              )}
              
              {/* ADMIN LINK */}
              {user?.role === 'ADMIN' && (
                <Link to="/admin/dashboard" className="nav-link text-danger fw-bold rounded-pill px-3 py-1" onClick={handleLinkClick} style={{ background: "rgba(239, 68, 68, 0.1)" }}>
                  <i className="bi bi-shield-lock-fill me-1"></i> Admin
                </Link>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;