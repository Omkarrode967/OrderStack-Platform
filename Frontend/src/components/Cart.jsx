import React, { useContext, useState, useEffect } from "react";
import AppContext from "../Context/Context";
import axios from "axios";
import CheckoutPopup from "./CheckoutPopup";
import { toast } from "react-toastify";

const Cart = () => {
  // We now pull ALL cart logic directly from the central brain (Context.jsx)
  const { cart, addToCart, decrementQuantity, removeFromCart, clearCart, refreshData } = useContext(AppContext);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8080";

  // Calculate total price whenever the global cart state changes
  useEffect(() => {
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotalPrice(total);
  }, [cart]);

  // Image Helper
  const convertBase64ToDataURL = (base64String, mimeType = 'image/jpeg') => {
    const fallbackImage = "https://via.placeholder.com/80?text=No+Image"; 
    if (!base64String) return fallbackImage;
    if (base64String.startsWith("data:")) return base64String;
    if (base64String.startsWith("http")) return base64String;
    return `data:${mimeType};base64,${base64String}`;
  };

  // --- Handlers using Context ---
  const handleIncreaseQuantity = (item) => {
    if (item.quantity < item.stockQuantity) {
      addToCart(item); // This cleanly adds 1 to the quantity via Context
    } else {
      toast.warning(`Maximum stock (${item.stockQuantity}) reached for ${item.name}`);
    }
  };

  const handleDecreaseQuantity = (itemId) => {
    decrementQuantity(itemId); // Uses the new context function!
  };

  const handleRemoveFromCart = (itemId, itemName) => {
    removeFromCart(itemId);
    toast.error(`${itemName} removed from cart`);
  };

  // --- Checkout Logic (Preserving your OrderStack PUT logic) ---
  const handleCheckout = async () => {
    try {
      let hasError = false;

      for (const item of cart) {
        const { imageUrl, imageName, imageData, imageType, quantity, ...rest } = item;
        const updatedStockQuantity = item.stockQuantity - item.quantity;
        const updatedProductData = { ...rest, stockQuantity: updatedStockQuantity };

        const cartProduct = new FormData();
        cartProduct.append("imageFile", new Blob([], { type: 'application/octet-stream' })); 
        cartProduct.append(
          "product",
          new Blob([JSON.stringify(updatedProductData)], { type: "application/json" })
        );

        try {
          await axios.put(`${baseUrl}/api/product/${item.id}`, cartProduct, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } catch (err) {
          console.error(`Failed to update stock for ${item.name}:`, err);
          hasError = true;
        }
      }

      if (!hasError) {
        toast.success("Checkout successful! Order placed.");
        clearCart();
        refreshData(); 
        setShowModal(false);
      } else {
        toast.error("Checkout completed with some inventory syncing errors.");
        clearCart();
        refreshData();
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error("Checkout failed. Please try again.");
    }
  };

  return (
    <div className="container mt-5 pt-5 mb-5" style={{ minHeight: "85vh" }}>
      <div className="row justify-content-center">
        <div className="col-lg-11">
          <div 
            className="card border-0 p-4 p-md-5"
            style={{ 
              background: "rgba(255, 255, 255, 0.85)", 
              backdropFilter: "blur(15px)", 
              WebkitBackdropFilter: "blur(15px)",
              borderRadius: "2rem", 
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.05)" 
            }}
          >
            {/* Header Section */}
            <div className="d-flex align-items-center mb-5 pb-4 border-bottom border-secondary-subtle">
              <div 
                className="rounded-circle d-flex justify-content-center align-items-center me-4 shadow-sm" 
                style={{ width: "60px", height: "60px", background: "linear-gradient(45deg, #3b82f6, #8b5cf6)", color: "white" }}
              >
                <i className="bi bi-cart3 fs-3"></i>
              </div>
              <div>
                <h2 className="fw-bolder mb-0 display-6" style={{ color: "#0f172a", letterSpacing: "-1px" }}>
                  Shopping Cart
                </h2>
                {cart.length > 0 && (
                  <p className="text-muted mb-0 fw-medium mt-1">You have {cart.length} item(s) in your cart</p>
                )}
              </div>
            </div>
            
            <div className="card-body p-0">
              {cart.length === 0 ? (
                <div className="text-center py-5 my-4 d-flex flex-column align-items-center">
                  <div 
                    className="rounded-circle d-flex justify-content-center align-items-center mb-4 shadow-sm"
                    style={{ width: "130px", height: "130px", background: "rgba(241, 245, 249, 0.8)", color: "#94a3b8" }}
                  >
                    <i className="bi bi-cart-x" style={{ fontSize: "4.5rem" }}></i>
                  </div>
                  <h3 className="fw-bolder text-dark mb-3">Your cart is feeling lonely</h3>
                  <p className="text-muted mb-5 fs-5" style={{ maxWidth: "400px" }}>
                    Looks like you haven't added anything yet. Discover our premium gear and start filling it up!
                  </p>
                  <a 
                    href="/" 
                    className="btn text-white rounded-pill px-5 py-3 fw-bold shadow-sm"
                    style={{ 
                      background: "linear-gradient(45deg, #3b82f6, #8b5cf6)", 
                      textDecoration: "none", 
                      fontSize: "1.1rem",
                      transition: "transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 15px 30px rgba(139, 92, 246, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 .125rem .25rem rgba(0,0,0,.075)";
                    }}
                  >
                    <i className="bi bi-arrow-left me-2"></i> Continue Shopping
                  </a>
                </div>
              ) : (
                <>
                  <div className="table-responsive px-2">
                    <table className="table table-borderless align-middle mb-0">
                      <thead>
                        <tr className="text-muted small fw-bold" style={{ textTransform: "uppercase", letterSpacing: "1px", borderBottom: "2px solid rgba(0,0,0,0.05)" }}>
                          <th scope="col" className="pb-3 ps-3">Product</th>
                          <th scope="col" className="pb-3 text-center">Price</th>
                          <th scope="col" className="pb-3 text-center">Quantity</th>
                          <th scope="col" className="pb-3 text-end">Total</th>
                          <th scope="col" className="pb-3 text-center pe-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((item) => (
                          <tr key={item.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.03)" }}>
                            <td className="py-4 ps-3">
                              <div className="d-flex align-items-center">
                                <div 
                                  className="p-2 rounded-4 shadow-sm me-4"
                                  style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.05)" }}
                                >
                                  <img
                                    src={convertBase64ToDataURL(item.imageData, item.imageType)}
                                    alt={item.name}
                                    className="rounded-3"
                                    width="80"
                                    height="80"
                                    style={{ objectFit: "contain" }}
                                  />
                                </div>
                                <div>
                                  <span className="badge mb-2 rounded-pill px-3 py-1" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", fontWeight: "600" }}>
                                    {item.brand}
                                  </span>
                                  <h5 className="mb-0 fw-bolder text-dark">{item.name}</h5>
                                </div>
                              </div>
                            </td>
                            
                            <td className="py-4 fw-bold text-secondary text-center fs-5">
                              ₹{item.price.toLocaleString()}
                            </td>
                            
                            <td className="py-4">
                              <div className="d-flex justify-content-center">
                                <div 
                                  className="input-group input-group-sm rounded-pill p-1 shadow-sm border-0 d-flex align-items-center" 
                                  style={{ width: "130px", background: "rgba(241, 245, 249, 0.8)" }}
                                >
                                  <button
                                    className="btn btn-white rounded-circle shadow-sm d-flex justify-content-center align-items-center"
                                    type="button"
                                    style={{ width: "32px", height: "32px", background: "white", color: "#64748b" }}
                                    onClick={() => handleDecreaseQuantity(item.id)}
                                  >
                                    <i className="bi bi-dash fw-bold"></i>
                                  </button>
                                  <input
                                    type="text"
                                    className="form-control text-center border-0 bg-transparent fw-bolder fs-6"
                                    value={item.quantity}
                                    readOnly
                                    style={{ color: "#0f172a" }}
                                  />
                                  <button
                                    className="btn btn-white rounded-circle shadow-sm d-flex justify-content-center align-items-center"
                                    type="button"
                                    style={{ width: "32px", height: "32px", background: "white", color: "#64748b" }}
                                    onClick={() => handleIncreaseQuantity(item)}
                                  >
                                    <i className="bi bi-plus fw-bold"></i>
                                  </button>
                                </div>
                              </div>
                            </td>
                            
                            <td className="py-4 fw-bolder text-end fs-5" style={{ color: "#0f172a" }}>
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </td>
                            
                            <td className="py-4 text-center pe-3">
                              <button
                                className="btn rounded-circle shadow-sm d-inline-flex justify-content-center align-items-center"
                                onClick={() => handleRemoveFromCart(item.id, item.name)}
                                title="Remove Item"
                                style={{ 
                                  width: "45px", 
                                  height: "45px", 
                                  background: "#ffffff",
                                  color: "#ef4444",
                                  border: "1px solid rgba(239, 68, 68, 0.2)",
                                  transition: "all 0.2s"
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "#ef4444";
                                  e.currentTarget.style.color = "white";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "#ffffff";
                                  e.currentTarget.style.color = "#ef4444";
                                }}
                              >
                                <i className="bi bi-trash3 fs-5"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* --- GOD MODE ORDER SUMMARY --- */}
                  <div className="row justify-content-end mt-5 pt-3 border-top border-secondary-subtle">
                    <div className="col-lg-5 col-md-7">
                      <div 
                        className="card border-0 rounded-4 p-4 p-md-5 position-relative overflow-hidden" 
                        style={{ background: "#ffffff", boxShadow: "0 10px 30px rgba(0,0,0,0.06)" }}
                      >
                        {/* Summary Header Decoration */}
                        <div 
                          className="position-absolute top-0 start-0 w-100" 
                          style={{ height: "6px", background: "linear-gradient(90deg, #3b82f6, #ec4899)" }}
                        ></div>

                        <h4 className="fw-bolder mb-4 text-dark">Order Summary</h4>
                        
                        <div className="d-flex justify-content-between mb-3 fs-5">
                          <span className="text-muted fw-medium">Subtotal</span>
                          <span className="fw-bold text-dark">₹{totalPrice.toLocaleString()}</span>
                        </div>
                        
                        <div className="d-flex justify-content-between mb-4 pb-4 border-bottom border-secondary-subtle">
                          <span className="text-muted fw-medium">Estimated Tax</span>
                          <span className="fw-bold" style={{ color: "#10b981" }}>Calculated at checkout</span>
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-end mb-5">
                          <h4 className="mb-0 fw-bold text-muted">Total</h4>
                          <h2 className="mb-0 fw-bolder" style={{ 
                            background: "linear-gradient(45deg, #3b82f6, #8b5cf6)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent"
                          }}>
                            ₹{totalPrice.toLocaleString()}
                          </h2>
                        </div>
                        
                        <button
                          className="btn text-white w-100 rounded-pill py-3 fw-bold fs-5 shadow-sm d-flex justify-content-center align-items-center gap-2"
                          onClick={() => setShowModal(true)}
                          style={{ 
                            background: "linear-gradient(45deg, #1e293b, #0f172a)", 
                            border: "none",
                            transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-3px)";
                            e.currentTarget.style.boxShadow = "0 15px 25px rgba(15, 23, 42, 0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 .125rem .25rem rgba(0,0,0,.075)";
                          }}
                        >
                          Checkout Securely <i className="bi bi-shield-check fs-4 ms-1"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <CheckoutPopup
        show={showModal}
        handleClose={() => setShowModal(false)}
        cartItems={cart}
        totalPrice={totalPrice}
        handleCheckout={handleCheckout}
      />
    </div>
  );
};

export default Cart;