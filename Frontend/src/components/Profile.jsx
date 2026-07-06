import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../Context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); 
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8080";
  
  const { user, logoutUser, loginUser } = useContext(AuthContext);
  
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'info');
  const [isLoading, setIsLoading] = useState(false);

  // --- STATE FOR ORDERS ---
  const [myOrders, setMyOrders] = useState([]);

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    mobile: '',
    gender: '',
    address: '',
    city: '',
    pincode: '',
    state: ''
  });

  const isViewingOtherUser = Boolean(id);

  // SMART CHECK: Only show orders if viewing a customer, OR if the logged-in user is a normal customer (not Admin)
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN';
  const showOrdersTab = isViewingOtherUser || !isAdmin;

  // SMART LOADING LOGIC
  useEffect(() => {
    const fetchSpecificUser = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${baseUrl}/api/users/${id}`);
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to load user data.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchSpecificUser();
    } else if (user) {
      setUserData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        gender: user.gender || '',
        address: user.address || '',
        city: user.city || '',
        pincode: user.pincode || '',
        state: user.state || ''
      });
    } else {
      navigate('/login');
    }
  }, [id, user, navigate, baseUrl]);

  // --- FETCH ORDERS LOGIC ---
  const fetchMyOrders = async () => {
    try {
      const targetEmail = isViewingOtherUser ? userData.email : user?.email;
      
      if (targetEmail) {
        const response = await axios.get(`${baseUrl}/api/orders/my-orders?email=${targetEmail}`);
        setMyOrders(response.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders.");
    }
  };

  useEffect(() => {
    if (activeTab === 'orders' && showOrdersTab) {
      fetchMyOrders();
    }
  }, [activeTab, isViewingOtherUser, userData.email, user?.email, showOrdersTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!id) {
      loginUser({ ...user, ...userData });
      toast.success("Profile updated successfully!");
    } else {
      toast.info("User profile updated in database.");
    }
  };

  const handleLogoutClick = () => {
    logoutUser();
    toast.info("Logged out successfully.");
    navigate('/login');
  };

  const renderPersonalInfo = () => (
    <div 
      className="card border-0 rounded-4 p-5 mb-4"
      style={{ 
        background: "rgba(255, 255, 255, 0.9)", 
        backdropFilter: "blur(10px)",
        boxShadow: "0 15px 35px rgba(0, 0, 0, 0.05)" 
      }}
    >
      <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
        <div 
          className="rounded-circle d-flex justify-content-center align-items-center me-3 shadow-sm" 
          style={{ width: "45px", height: "45px", background: "linear-gradient(45deg, #3b82f6, #ec4899)", color: "white" }}
        >
          <i className="bi bi-person-lines-fill fs-5"></i>
        </div>
        <h3 className="fw-bolder mb-0" style={{ color: "#1e293b", letterSpacing: "-0.5px" }}>
          {isViewingOtherUser ? `Profile: ${userData.name}` : 'Personal Information'}
        </h3>
      </div>

      <form onSubmit={handleUpdateProfile}>
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <label className="form-label fw-bold" style={{ color: "#475569", fontSize: "0.9rem" }}>Full Name</label>
            <input type="text" className="form-control form-control-lg bg-light border-0 shadow-sm rounded-3 px-4" style={{ fontSize: "0.95rem" }} name="name" value={userData.name} onChange={handleInputChange} readOnly={isViewingOtherUser} />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold" style={{ color: "#475569", fontSize: "0.9rem" }}>Email Address</label>
            <input type="email" className="form-control form-control-lg bg-light border-0 shadow-sm rounded-3 px-4 text-muted" style={{ fontSize: "0.95rem" }} name="email" value={userData.email} onChange={handleInputChange} disabled />
          </div>
        </div>

        <div className="row g-4 mb-4 align-items-center">
          <div className="col-md-6">
            <label className="form-label fw-bold" style={{ color: "#475569", fontSize: "0.9rem" }}>Mobile Number</label>
            <input type="tel" className="form-control form-control-lg bg-light border-0 shadow-sm rounded-3 px-4" style={{ fontSize: "0.95rem" }} name="mobile" value={userData.mobile || ''} onChange={handleInputChange} readOnly={isViewingOtherUser} />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold d-block mb-3" style={{ color: "#475569", fontSize: "0.9rem" }}>Gender</label>
            <div className="d-flex gap-4">
              <div className="form-check custom-radio">
                <input className="form-check-input shadow-sm" type="radio" name="gender" value="Male" id="genderMale" checked={userData.gender === 'Male'} onChange={handleInputChange} disabled={isViewingOtherUser} />
                <label className="form-check-label fw-semibold text-dark" htmlFor="genderMale">Male</label>
              </div>
              <div className="form-check custom-radio">
                <input className="form-check-input shadow-sm" type="radio" name="gender" value="Female" id="genderFemale" checked={userData.gender === 'Female'} onChange={handleInputChange} disabled={isViewingOtherUser} />
                <label className="form-check-label fw-semibold text-dark" htmlFor="genderFemale">Female</label>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold" style={{ color: "#475569", fontSize: "0.9rem" }}>Street Address</label>
          <input type="text" className="form-control form-control-lg bg-light border-0 shadow-sm rounded-3 px-4" style={{ fontSize: "0.95rem" }} name="address" value={userData.address || ''} onChange={handleInputChange} readOnly={isViewingOtherUser} />
        </div>

        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <label className="form-label fw-bold" style={{ color: "#475569", fontSize: "0.9rem" }}>City</label>
            <input type="text" className="form-control form-control-lg bg-light border-0 shadow-sm rounded-3 px-4" style={{ fontSize: "0.95rem" }} name="city" value={userData.city || ''} onChange={handleInputChange} readOnly={isViewingOtherUser} />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-bold" style={{ color: "#475569", fontSize: "0.9rem" }}>State</label>
            <select className="form-select form-select-lg bg-light border-0 shadow-sm rounded-3 px-4" style={{ fontSize: "0.95rem" }} name="state" value={userData.state || ''} onChange={handleInputChange} disabled={isViewingOtherUser}>
              <option value="">--Select State--</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Delhi">Delhi</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label fw-bold" style={{ color: "#475569", fontSize: "0.9rem" }}>Pincode</label>
            <input type="text" className="form-control form-control-lg bg-light border-0 shadow-sm rounded-3 px-4" style={{ fontSize: "0.95rem" }} name="pincode" value={userData.pincode || ''} onChange={handleInputChange} readOnly={isViewingOtherUser} />
          </div>
        </div>

        {!isViewingOtherUser && (
          <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
            <button type="button" className="btn btn-light px-4 rounded-pill fw-bold shadow-sm" onClick={() => setActiveTab('info')} style={{ color: "#64748b" }}>Reset</button>
            <button 
              type="submit" 
              className="btn text-white px-5 rounded-pill fw-bold border-0 shadow-sm" 
              style={{ 
                background: "linear-gradient(45deg, #3b82f6, #8b5cf6)",
                transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(139, 92, 246, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 0.125rem 0.25rem rgba(0,0,0,0.075)";
              }}
            >
              Save Changes <i className="bi bi-check2-circle ms-1"></i>
            </button>
          </div>
        )}
      </form>
    </div>
  );

  // --- RENDER ORDERS TABLE ---
  const renderOrders = () => (
    <div 
      className="card border-0 rounded-4 p-5"
      style={{ 
        background: "rgba(255, 255, 255, 0.9)", 
        backdropFilter: "blur(10px)",
        boxShadow: "0 15px 35px rgba(0, 0, 0, 0.05)",
        minHeight: "500px"
      }}
    >
      <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
        <div 
          className="rounded-circle d-flex justify-content-center align-items-center me-3 shadow-sm" 
          style={{ width: "45px", height: "45px", background: "linear-gradient(45deg, #8b5cf6, #ec4899)", color: "white" }}
        >
          <i className="bi bi-box-seam-fill fs-5"></i>
        </div>
        <h3 className="fw-bolder mb-0" style={{ color: "#1e293b", letterSpacing: "-0.5px" }}>
          {isViewingOtherUser ? `Orders for ${userData.name}` : 'Order History'}
        </h3>
      </div>
      
      {myOrders.length > 0 ? (
        <div className="table-responsive mt-3">
          <table className="table table-hover align-middle border-0">
            <thead style={{ background: "rgba(248, 250, 252, 0.8)" }}>
              <tr>
                <th className="border-0 rounded-start py-3 text-muted fw-bold" style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px" }}>Order ID</th>
                <th className="border-0 py-3 text-muted fw-bold" style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px" }}>Date</th>
                <th className="border-0 py-3 text-muted fw-bold" style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px" }}>Status</th>
                <th className="border-0 rounded-end py-3 text-muted fw-bold text-end" style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {myOrders.map((order) => (
                <tr key={order.orderId} style={{ transition: "background-color 0.2s", cursor: "pointer" }}>
                  <td className="fw-bolder py-3" style={{ color: "#3b82f6" }}>#{order.orderId.toString().padStart(6, '0')}</td>
                  <td className="py-3 text-dark fw-medium">{new Date(order.orderDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td className="py-3">
                    <span 
                      className="badge rounded-pill px-3 py-2 fw-bold"
                      style={{ 
                        background: "rgba(16, 185, 129, 0.1)", 
                        color: "#10b981",
                        border: "1px solid rgba(16, 185, 129, 0.2)"
                      }}
                    >
                      <i className="bi bi-check-circle-fill me-1"></i> {order.status}
                    </span>
                  </td>
                  <td className="text-end fw-bolder py-3" style={{ color: "#0f172a", fontSize: "1.1rem" }}>
                    ₹{order.items?.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-5 d-flex flex-column justify-content-center align-items-center h-100">
          <div 
            className="rounded-circle d-flex justify-content-center align-items-center mb-4"
            style={{ width: "100px", height: "100px", background: "rgba(241, 245, 249, 0.8)", color: "#94a3b8" }}
          >
            <i className="bi bi-cart-x fs-1"></i>
          </div>
          <h4 className="fw-bolder text-dark mb-2">No orders found</h4>
          <p className="text-muted mb-4" style={{ maxWidth: "300px" }}>It looks like you haven't placed any orders yet. Start shopping to see your history here!</p>
          {!isViewingOtherUser && (
            <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" onClick={() => navigate('/')} style={{ background: "linear-gradient(45deg, #3b82f6, #8b5cf6)", border: "none" }}>
              Explore Products
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border" style={{ color: "#8b5cf6", width: "3rem", height: "3rem" }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "7rem", paddingBottom: "4rem" }}>
      <div className="container">
        <div className="row g-4">
          
          {/* --- SIDEBAR --- */}
          <div className="col-lg-3 col-md-4">
            
            {/* USER AVATAR CARD */}
            <div 
              className="card border-0 rounded-4 mb-4 p-4 text-center overflow-hidden position-relative"
              style={{ 
                background: "rgba(255, 255, 255, 0.9)", 
                backdropFilter: "blur(10px)",
                boxShadow: "0 15px 35px rgba(0, 0, 0, 0.05)" 
              }}
            >
              {/* Colorful background splash */}
              <div 
                className="position-absolute top-0 start-0 w-100" 
                style={{ height: "80px", background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(236, 72, 153, 0.2))" }}
              ></div>
              
              <div 
                className="rounded-circle d-flex justify-content-center align-items-center mx-auto position-relative bg-white shadow-sm" 
                style={{ width: "90px", height: "90px", fontSize: "2.5rem", marginTop: "15px", border: "4px solid white" }}
              >
                <div 
                  className="w-100 h-100 rounded-circle d-flex justify-content-center align-items-center"
                  style={{ background: "linear-gradient(45deg, #3b82f6, #ec4899)", color: "white" }}
                >
                  <i className="bi bi-person"></i>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-muted fw-bold mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px" }}>
                  {isViewingOtherUser ? 'Viewing Customer' : 'Welcome Back'}
                </p>
                <h5 className="fw-bolder mb-0 text-dark" style={{ letterSpacing: "-0.5px" }}>{userData.name || 'User'}</h5>
                {!isViewingOtherUser && (
                   <span className="badge mt-2 rounded-pill bg-light text-primary border border-primary-subtle px-3 py-1 fw-bold">
                     {user?.role === 'ADMIN' ? 'Administrator' : 'Verified Member'}
                   </span>
                )}
              </div>
            </div>

            {/* NAVIGATION MENU */}
            <div 
              className="card border-0 rounded-4 overflow-hidden p-2"
              style={{ 
                background: "rgba(255, 255, 255, 0.9)", 
                backdropFilter: "blur(10px)",
                boxShadow: "0 15px 35px rgba(0, 0, 0, 0.05)" 
              }}
            >
              <div className="list-group list-group-flush gap-1">
                <button 
                  className={`list-group-item list-group-item-action py-3 px-4 fw-bold rounded-4 border-0 d-flex align-items-center transition-all ${activeTab === 'info' ? 'text-white shadow-sm' : 'text-secondary'}`}
                  onClick={() => setActiveTab('info')}
                  style={activeTab === 'info' ? { background: "linear-gradient(45deg, #3b82f6, #8b5cf6)" } : { backgroundColor: "transparent" }}
                >
                  <i className={`bi bi-person-vcard me-3 fs-5 ${activeTab === 'info' ? 'text-white' : 'text-primary'}`}></i> Profile Info
                </button>
                
                {showOrdersTab && (
                  <button 
                    className={`list-group-item list-group-item-action py-3 px-4 fw-bold rounded-4 border-0 d-flex align-items-center transition-all ${activeTab === 'orders' ? 'text-white shadow-sm' : 'text-secondary'}`}
                    onClick={() => setActiveTab('orders')}
                    style={activeTab === 'orders' ? { background: "linear-gradient(45deg, #8b5cf6, #ec4899)" } : { backgroundColor: "transparent" }}
                  >
                    <i className={`bi bi-box-seam me-3 fs-5 ${activeTab === 'orders' ? 'text-white' : 'text-primary'}`}></i> {isViewingOtherUser ? "User's Orders" : "My Orders"}
                  </button>
                )}
                
                {!isViewingOtherUser && (
                  <>
                    <hr className="text-muted opacity-25 my-2 mx-3" />
                    <button 
                      className="list-group-item list-group-item-action py-3 px-4 fw-bold rounded-4 border-0 d-flex align-items-center text-danger"
                      onClick={handleLogoutClick}
                      style={{ backgroundColor: "transparent", transition: "all 0.2s" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <i className="bi bi-box-arrow-left me-3 fs-5"></i> Secure Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* --- MAIN CONTENT AREA --- */}
          <div className="col-lg-9 col-md-8">
            {activeTab === 'info' && renderPersonalInfo()}
            {activeTab === 'orders' && showOrdersTab && renderOrders()}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;