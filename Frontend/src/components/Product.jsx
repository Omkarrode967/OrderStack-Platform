import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AppContext from "../Context/Context";
import { AuthContext } from "../Context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";

const Product = () => {
  const { id } = useParams();
  const { cart, addToCart, removeFromCart, refreshData } = useContext(AppContext);
  const { user } = useContext(AuthContext); 
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8080";

  useEffect(() => {
    let objectUrl = null; 

    const fetchProductAndImage = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${baseUrl}/api/product/${id}`);
        setProduct(response.data);
        
        if (response.data.imageName) {
          const imgResponse = await axios.get(`${baseUrl}/api/product/${id}/image`, { 
            responseType: "blob" 
          });
          objectUrl = URL.createObjectURL(imgResponse.data);
          setImageUrl(objectUrl);
        }
        setError(false);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductAndImage();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [id, baseUrl]);

  const deleteProduct = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product? This action cannot be undone.");
    
    if (confirmDelete) {
      try {
        await axios.delete(`${baseUrl}/api/product/${id}`);
        removeFromCart(id);
        toast.success("Product deleted successfully");
        refreshData();
        navigate("/");
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product.");
      }
    }
  };

  const handleEditClick = () => {
    navigate(`/product/update/${id}`);
  };

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const cartItem = cart.find(item => item.id === Number(id));
  const currentCartQuantity = cartItem ? cartItem.quantity : 0;
  
  const isOutOfStock = !product?.productAvailable || product?.stockQuantity === 0;
  const isMaxCartReached = currentCartQuantity >= product?.stockQuantity;

  if (isLoading) {
    return (
      <div className="container mt-5 pt-5 d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
        <div className="spinner-border" style={{ color: "#8b5cf6", width: "3.5rem", height: "3.5rem" }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mt-5 pt-5 d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
        <div 
          className="text-center p-5 rounded-4 shadow-lg border-0"
          style={{ background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(12px)", maxWidth: "500px" }}
        >
          <div className="rounded-circle d-flex justify-content-center align-items-center mx-auto mb-4" style={{ width: "80px", height: "80px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
            <i className="bi bi-exclamation-triangle-fill fs-1"></i>
          </div>
          <h2 className="fw-bolder text-dark mb-3">Product Not Found</h2>
          <p className="text-muted mb-4 fs-5">The product you are looking for does not exist or has been removed from our catalog.</p>
          <button 
            className="btn text-white rounded-pill px-5 py-2 fw-bold shadow-sm" 
            style={{ background: "linear-gradient(45deg, #3b82f6, #8b5cf6)", border: "none" }}
            onClick={() => navigate("/")}
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 pt-5 mb-5" style={{ minHeight: "85vh" }}>
      <div className="row g-5 align-items-center mt-3">
        
        {/* --- PRODUCT IMAGE SECTION (Glassmorphism + Glow) --- */}
        <div className="col-lg-6 d-flex justify-content-center align-items-center">
          <div 
            className="card border-0 rounded-4 w-100 p-5 position-relative overflow-hidden d-flex justify-content-center align-items-center" 
            style={{ 
              minHeight: "500px", 
              background: "rgba(255, 255, 255, 0.7)", 
              backdropFilter: "blur(15px)",
              WebkitBackdropFilter: "blur(15px)",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.04)"
            }}
          >
            {/* Ambient Background Glow Orb */}
            <div 
              className="position-absolute top-50 start-50 translate-middle rounded-circle"
              style={{
                width: "300px",
                height: "300px",
                background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(255,255,255,0) 70%)",
                filter: "blur(20px)",
                zIndex: 0
              }}
            ></div>

            <img
              src={imageUrl || "https://via.placeholder.com/400?text=No+Image"}
              alt={product.name}
              className="img-fluid position-relative"
              style={{ 
                maxHeight: "450px", 
                objectFit: "contain", 
                zIndex: 1,
                mixBlendMode: "darken",
                transition: "transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)" 
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05) translateY(-10px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1) translateY(0)"}
            />
          </div>
        </div>

        {/* --- PRODUCT DETAILS SECTION --- */}
        <div className="col-lg-6 d-flex flex-column justify-content-center py-4 px-lg-5">
          
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span 
              className="badge px-4 py-2 rounded-pill fw-bold"
              style={{ 
                background: "linear-gradient(45deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))", 
                color: "#8b5cf6",
                fontSize: "0.85rem",
                letterSpacing: "0.5px"
              }}
            >
              {product.category}
            </span>
            <span className="text-muted fw-semibold" style={{ fontSize: "0.85rem" }}>
              <i className="bi bi-calendar3 me-2"></i>
              {new Date(product.releaseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <p className="fw-bolder mb-1" style={{ color: "#3b82f6", letterSpacing: "2px", textTransform: "uppercase", fontSize: "0.9rem" }}>
            {product.brand}
          </p>
          <h1 className="fw-bolder text-capitalize mb-4 display-5" style={{ color: "#0f172a", letterSpacing: "-1px", lineHeight: "1.2" }}>
            {product.name}
          </h1>

          <div className="mb-4">
            <p className="text-secondary fs-5" style={{ lineHeight: "1.7" }}>
              {product.description}
            </p>
          </div>

          <div className="d-flex align-items-center mb-4 pb-4 border-bottom border-secondary-subtle">
            <h1 className="fw-bolder mb-0 me-4 display-4" style={{ color: "#1e293b" }}>
              <span className="fs-3 text-muted me-1">₹</span>{product.price.toLocaleString()}
            </h1>
            
            <span 
              className="badge rounded-pill px-3 py-2 fw-bold fs-6 d-flex align-items-center"
              style={{ 
                background: product.stockQuantity > 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", 
                color: product.stockQuantity > 0 ? "#10b981" : "#ef4444",
                border: `1px solid ${product.stockQuantity > 0 ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`
              }}
            >
              <i className={`bi ${product.stockQuantity > 0 ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-2`}></i>
              {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <p className="mb-4 text-muted fw-medium d-flex align-items-center fs-5">
            <i className="bi bi-box-seam me-3 fs-4 text-primary"></i>
            Stock Available: <span className="fw-bolder text-dark ms-2 fs-4">{product.stockQuantity}</span>
          </p>

          {/* --- ACTION BUTTONS --- */}
          {user?.role === 'ADMIN' ? (
            <div className="d-flex gap-3 justify-content-start mt-2">
              <button
                className="btn fw-bold rounded-pill px-5 py-3 shadow-sm d-flex align-items-center"
                type="button"
                onClick={handleEditClick}
                style={{ 
                  background: "rgba(255, 255, 255, 0.8)", 
                  color: "#3b82f6", 
                  border: "2px solid #3b82f6",
                  transition: "all 0.2s" 
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#3b82f6"; e.currentTarget.style.color = "white"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.8)"; e.currentTarget.style.color = "#3b82f6"; }}
              >
                <i className="bi bi-pencil-square me-2 fs-5"></i> Edit Product
              </button>

              <button
                className="btn fw-bold rounded-pill px-5 py-3 shadow-sm d-flex align-items-center"
                type="button"
                onClick={deleteProduct}
                style={{ 
                  background: "rgba(255, 255, 255, 0.8)", 
                  color: "#ef4444", 
                  border: "2px solid #ef4444",
                  transition: "all 0.2s" 
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.color = "white"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.8)"; e.currentTarget.style.color = "#ef4444"; }}
              >
                <i className="bi bi-trash3 me-2 fs-5"></i> Delete
              </button>
            </div>
          ) : (
            <div className="d-grid mt-2">
              <button
                className={`btn btn-lg rounded-pill shadow-sm py-3 fw-bold fs-5 ${isOutOfStock || isMaxCartReached ? 'btn-secondary opacity-75' : 'text-white'}`}
                onClick={handleAddToCart}
                disabled={isOutOfStock || isMaxCartReached}
                style={
                  !isOutOfStock && !isMaxCartReached 
                    ? { 
                        background: "linear-gradient(45deg, #3b82f6, #8b5cf6)", 
                        border: "none",
                        transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
                      } 
                    : { border: "none" }
                }
                onMouseEnter={(e) => {
                  if (!isOutOfStock && !isMaxCartReached) {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 10px 25px rgba(139, 92, 246, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isOutOfStock && !isMaxCartReached) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 0.125rem 0.25rem rgba(0,0,0,0.075)";
                  }
                }}
              >
                {isOutOfStock 
                  ? <><i className="bi bi-cart-x fs-4 me-2"></i> Out of Stock</>
                  : isMaxCartReached 
                    ? <><i className="bi bi-bag-check fs-4 me-2"></i> Max Stock Reached</>
                    : <><i className="bi bi-cart-plus-fill fs-4 me-2"></i> Add to Cart</>}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Product;