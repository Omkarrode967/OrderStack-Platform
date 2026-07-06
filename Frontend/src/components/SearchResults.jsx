import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppContext from "../Context/Context"; // Importing Context for global cart state
import { toast } from "react-toastify";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useContext(AppContext);

  // Safely get search data from location state
  const searchData = location.state?.searchData || [];

  // Helper: Safely handle image conversion with placeholder
  const convertBase64ToDataURL = (base64String, mimeType = 'image/jpeg') => {
    const fallbackImage = "https://via.placeholder.com/400?text=No+Image"; 
    
    if (!base64String) return fallbackImage;
    if (base64String.startsWith('data:')) return base64String;
    if (base64String.startsWith('http')) return base64String;
    
    return `data:${mimeType};base64,${base64String}`;
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="container mt-5 pt-5 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <h2 className="fw-bold mb-0">
          <i className="bi bi-search text-primary me-2"></i>Search Results
        </h2>
        <span className="badge bg-secondary fs-6 rounded-pill px-3 py-2">
          {searchData.length} {searchData.length === 1 ? 'Product' : 'Products'} found
        </span>
      </div>
      
      {searchData.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-search text-muted opacity-25" style={{ fontSize: "5rem" }}></i>
          <h4 className="mt-4 fw-bold text-dark">No products found</h4>
          <p className="text-muted mb-4">We couldn't find anything matching your search criteria.</p>
          <button onClick={() => navigate("/")} className="btn btn-primary rounded-pill px-4 shadow-sm">
            Back to Home
          </button>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {searchData.map((product) => (
            <div key={product.id} className="col">
              <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
                <img 
                  src={convertBase64ToDataURL(product.imageData, product.imageType)} 
                  className="card-img-top p-4 bg-light" 
                  alt={product.name}
                  style={{ height: "250px", objectFit: "contain", cursor: "pointer", mixBlendMode: "multiply" }}
                  onClick={() => handleViewProduct(product.id)}
                />
                <div className="card-body d-flex flex-column p-4">
                  <span className="badge bg-light text-secondary border mb-2 align-self-start">{product.category}</span>
                  <h5 className="card-title fw-bold text-truncate">{product.name}</h5>
                  <p className="card-text text-muted mb-3">{product.brand}</p>
                  
                  <h5 className="card-text text-primary fw-bold mt-auto mb-3">₹{product.price.toLocaleString('en-IN')}</h5>
                  
                  <div className="d-flex justify-content-between mt-auto">
                    <button 
                      className="btn btn-outline-primary btn-sm rounded-pill px-3"
                      onClick={() => handleViewProduct(product.id)}
                    >
                      View Details
                    </button>
                    <button 
                      className="btn btn-primary btn-sm rounded-pill px-3"
                      onClick={(e) => handleAddToCart(product, e)}
                      disabled={!product.productAvailable || product.stockQuantity <= 0}
                    >
                      {product.productAvailable && product.stockQuantity > 0
                        ? "Add to Cart"
                        : "Out of Stock"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;