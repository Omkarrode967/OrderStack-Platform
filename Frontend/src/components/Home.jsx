import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppContext from "../Context/Context";
import unplugged from "../assets/unplugged.png";
import { toast } from "react-toastify"; 

const Home = ({ selectedCategory }) => {
  const { data, isError, addToCart, refreshData } = useContext(AppContext);
  const [isDataFetched, setIsDataFetched] = useState(false);

  useEffect(() => {
    if (!isDataFetched) {
      refreshData();
      setIsDataFetched(true);
    }
  }, [refreshData, isDataFetched]);

  const convertBase64ToDataURL = (base64String, mimeType = 'image/jpeg') => {
    if (!base64String) return unplugged; 
    if (base64String.startsWith('data:')) return base64String;
    if (base64String.startsWith('http')) return base64String;
    return `data:${mimeType};base64,${base64String}`;
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation(); 
    addToCart(product);
    
    toast.success(`${product.name} added to cart!`, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const filteredProducts = selectedCategory
    ? data.filter((product) => product.category === selectedCategory)
    : data;

  if (isError) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="text-center">
          <img src={unplugged} alt="Error" className="img-fluid mb-3" width="100" />
          <h4 className="text-danger fw-bold">Oops! Something went wrong.</h4>
          <p className="text-muted">Could not connect to the backend server.</p>
        </div>
      </div>
    );
  }
  
  return (
    // NEW: The outermost div now acts as a full-page colorful ambient wrapper
    <div 
      style={{ 
        minHeight: "100vh", 
        // This creates the glowing God-Mode ambient background
        background: "radial-gradient(circle at top left, rgba(59, 130, 246, 0.08) 0%, transparent 40%), radial-gradient(circle at top right, rgba(236, 72, 153, 0.08) 0%, transparent 40%), radial-gradient(circle at bottom center, rgba(139, 92, 246, 0.08) 0%, transparent 50%), #f8fafc",
        paddingBottom: "4rem"
      }}
    >
      <div className="container pt-5">
        
        {/* --- HERO INTRODUCTION SECTION --- */}
        {!selectedCategory && (
          <div 
            className="p-5 text-center rounded-4 shadow-lg mb-5 mt-3 position-relative overflow-hidden" 
            style={{ 
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)",
              color: "white"
            }}
          >
            <div 
              className="mx-auto p-5 rounded-4" 
              style={{ 
                background: "rgba(255, 255, 255, 0.15)", 
                backdropFilter: "blur(12px)", 
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                maxWidth: "800px" 
              }}
            >
              <h1 className="fw-bolder mb-3 display-4" style={{ textShadow: "0 4px 15px rgba(0,0,0,0.2)" }}>
                Welcome to OrderStack
              </h1>
              <p className="lead fw-medium mb-4 mx-auto" style={{ maxWidth: "600px", textShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
                Your one-stop destination for premium tech, gaming gear, and daily electronics.
              </p>
              <button 
                className="btn btn-light btn-lg rounded-pill px-5 fw-bold"
                style={{ color: "#8b5cf6", boxShadow: "0 10px 20px rgba(0,0,0,0.15)", transition: "transform 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
              >
                Start Shopping <i className="bi bi-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        )}
        {/* ----------------------------------- */}

        {/* --- SECTION HEADER --- */}
        <div className="text-center mb-5 mt-4">
          <h2 className="fw-bolder" style={{ color: "#1e293b", fontSize: "2.2rem" }}>
            {selectedCategory ? `${selectedCategory}` : "Shop by Category"}
          </h2>
          <div className="mx-auto mt-2 rounded-pill" style={{ width: "60px", height: "4px", background: "linear-gradient(90deg, #3b82f6, #ec4899)" }}></div>
          <p className="text-muted mt-3 fs-5">Find the best products in your favorite categories</p>
        </div>
        {/* ----------------------- */}

        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          
          {!isDataFetched || !data ? (
             <div className="col-12 d-flex justify-content-center align-items-center my-5" style={{ minHeight: "30vh" }}>
               <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} role="status">
                 <span className="visually-hidden">Loading...</span>
               </div>
             </div>
          ) : !filteredProducts || filteredProducts.length === 0 ? (
            <div className="col-12 text-center my-5">
              <div className="p-5 bg-white shadow-sm rounded-4 border-0">
                <i className="bi bi-box-seam text-muted" style={{ fontSize: "3rem" }}></i>
                <h4 className="text-muted mt-3 fw-bold">No Products Available</h4>
              </div>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const { id, brand, name, price, productAvailable, imageData, imageType, stockQuantity } = product;
              
              return (
                <div className="col" key={id}>
                  <div 
                    className={`card h-100 shadow-sm border-0 rounded-4 overflow-hidden ${!productAvailable ? 'opacity-75' : ''}`}
                    style={{ transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)", cursor: "pointer", backgroundColor: "#ffffff" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow = "0 15px 35px rgba(139, 92, 246, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)";
                    }}
                  >
                    <Link to={`/product/${id}`} className="text-decoration-none text-dark">
                      <div className="p-3 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.03)" }}>
                        <img
                          src={convertBase64ToDataURL(imageData, imageType)}
                          alt={name}
                          className="card-img-top rounded-3"
                          style={{ height: "200px", objectFit: "contain" }}
                          onError={(e) => {
                            e.target.src = unplugged; 
                          }}
                        />
                      </div>
                    </Link>

                    <div className="card-body d-flex flex-column p-4">
                      <Link to={`/product/${id}`} className="text-decoration-none text-dark flex-grow-1">
                        <p className="text-uppercase fw-bold mb-1" style={{ fontSize: "0.75rem", letterSpacing: "1px", color: "#8b5cf6" }}>
                          {brand}
                        </p>
                        <h5 className="card-title fw-bold mb-3 text-truncate" title={name} style={{ color: "#1e293b" }}>
                          {name}
                        </h5>
                      </Link>
                      
                      <div className="mt-auto d-flex justify-content-between align-items-center pt-3 border-top">
                        <h5 className="mb-0 fw-bolder" style={{ color: "#0f172a" }}>
                          <i className="bi bi-currency-rupee"></i>{price}
                        </h5>
                        
                        <button
                          className={`btn rounded-pill px-4 fw-bold shadow-sm ${stockQuantity !== 0 ? 'text-white border-0' : 'btn-secondary'}`}
                          style={
                            stockQuantity !== 0 
                              ? { background: "linear-gradient(45deg, #3b82f6, #8b5cf6)", transition: "opacity 0.2s" } 
                              : {}
                          }
                          onMouseEnter={(e) => stockQuantity !== 0 && (e.currentTarget.style.opacity = "0.85")}
                          onMouseLeave={(e) => stockQuantity !== 0 && (e.currentTarget.style.opacity = "1")}
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={!productAvailable || stockQuantity === 0}
                        >
                          {stockQuantity !== 0 ? (
                            <>
                              <i className="bi bi-cart-plus-fill me-1"></i> Add
                            </>
                          ) : (
                            "Out of Stock"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;