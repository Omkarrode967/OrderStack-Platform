import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AppContext from "../Context/Context"; // Added context to sync global state

const AddProduct = () => {
  const { refreshData } = useContext(AppContext); // Pulling the refresh function
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8080";

  const [product, setProduct] = useState({
    name: "",
    brand: "",
    description: "", 
    price: "",
    category: "",
    stockQuantity: "",
    releaseDate: "",
    productAvailable: false,
  });

  const [image, setImage] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  
  // AI Generation States
  const [aiPrompt, setAiPrompt] = useState("");
  const [generatingProduct, setGeneratingProduct] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [aiGeneratedImage, setAiGeneratedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Cleanup blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct({ 
      ...product, 
      [name]: type === 'checkbox' ? checked : value 
    });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setAiGeneratedImage(null); 
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
      
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setErrors({ ...errors, image: "Please select a valid image file (JPEG or PNG)" });
      } else if (file.size > 5 * 1024 * 1024) { 
        setErrors({ ...errors, image: "Image size should be less than 5MB" });
      } else {
        setErrors({ ...errors, image: null });
      }
    } else {
      setImagePreview(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!product.name.trim()) newErrors.name = "Product name is required";
    if (!product.brand.trim()) newErrors.brand = "Brand is required";
    if (!product.price) {
      newErrors.price = "Price is required";
    } else if (parseFloat(product.price) <= 0) {
      newErrors.price = "Price must be greater than zero";
    }
    if (!product.category) newErrors.category = "Please select a category";
    if (!product.stockQuantity) {
      newErrors.stockQuantity = "Stock quantity is required";
    } else if (parseInt(product.stockQuantity) < 0) {
      newErrors.stockQuantity = "Stock quantity cannot be negative";
    }
    if (!product.releaseDate) newErrors.releaseDate = "Release date is required";
    
    if (image) {
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(image.type)) {
        newErrors.image = "Please select a valid image file (JPEG or PNG)";
      } else if (image.size > 5 * 1024 * 1024) {
        newErrors.image = "Image size should be less than 5MB";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- AI GENERATION HANDLERS ---
  const generateDescription = async () => {
    if (!product.name.trim() || !product.category) {
      toast.warning("Please enter product name and select a category first");
      return;
    }
    setGeneratingDescription(true);
    try {
      const response = await axios.post(`${baseUrl}/api/product/generate-description`, null, {
        params: { name: product.name, category: product.category }
      });
      if (response.data) {
        setProduct({ ...product, description: response.data });
        toast.success("Description generated successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data || "Failed to generate description. Please try again.");
    } finally {
      setGeneratingDescription(false);
    }
  };

  const generateImage = async () => {
    if (!product.name.trim() || !product.category || !product.description.trim()) {
      toast.warning("Please enter product name, category, and description first");
      return;
    }
    setGeneratingImage(true);
    try {
      const response = await axios.post(`${baseUrl}/api/product/generate-image`, null, {
        params: { name: product.name, category: product.category, description: product.description },
        responseType: 'arraybuffer' 
      });

      if (response.data) {
        const blob = new Blob([response.data], { type: 'image/jpeg' });
        const imageUrl = URL.createObjectURL(blob);
        
        setAiGeneratedImage({ blob: blob, url: imageUrl });
        setImagePreview(imageUrl);
        setImage(null); 
        
        // Reset file input UI
        const fileInput = document.getElementById('imageFile');
        if (fileInput) fileInput.value = '';
        
        toast.success("Image generated successfully!");
      }
    } catch (error) {
      const errorMessage = error.response?.data ? new TextDecoder().decode(error.response.data) : "Failed to generate image.";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleGenerateProduct = async () => {
    if (!aiPrompt.trim()) {
      toast.warning("Please enter a product description");
      return;
    }
    setGeneratingProduct(true);
    try {
      const response = await axios.post(`${baseUrl}/api/product/generate-product?query=${encodeURIComponent(aiPrompt)}`);
      if (response.data) {
        setProduct({
          name: response.data.name || "",
          brand: response.data.brand || "",
          description: response.data.description || "",
          price: response.data.price || "",
          category: response.data.category || "",
          stockQuantity: response.data.stockQuantity || "",
          releaseDate: response.data.releaseDate || "",
          productAvailable: response.data.productAvailable || false,
        });
        toast.success('Product details generated successfully!');
        setShowModal(false);
        setAiPrompt("");
      }
    } catch (error) {
      toast.error("Error generating product. Please try again.");
    } finally {
      setGeneratingProduct(false);
    }
  };

  // --- FORM SUBMISSION ---
  const submitHandler = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setValidated(true);
    
    if (!validateForm() || !form.checkValidity()) {
      event.stopPropagation();
      toast.error("Please fix the errors in the form before submitting.");
      return;
    }
    
    setLoading(true);
    const formData = new FormData();
    
    if (image) {
      formData.append("imageFile", image);
    } else if (aiGeneratedImage) {
      const file = new File([aiGeneratedImage.blob], "ai-generated-image.jpg", { type: "image/jpeg" });
      formData.append("imageFile", file);
    }
    
    formData.append(
      "product",
      new Blob([JSON.stringify(product)], { type: "application/json" })
    );

    axios.post(`${baseUrl}/api/product`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((response) => {
      toast.success('Product added successfully! 🎉');
      refreshData(); // VERY IMPORTANT: Syncs the global context so the home page updates instantly
      navigate('/');
    })
    .catch((error) => {
      console.error("Error adding product:", error);
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        toast.error('Error adding product to database.');
      }
      setLoading(false); 
    });
  };

  const canGenerateDescription = product.name.trim() && product.category;
  const canGenerateImage = product.name.trim() && product.category && product.description.trim();

  return (
    <div className="container mt-5 pt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-5">
              
              {/* Header with the restored AI Modal Trigger Button */}
              <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <h3 className="card-title fw-bold mb-0">
                  <i className="bi bi-box-seam text-primary me-2"></i>Add New Product
                </h3>
                <button 
                  className="btn btn-sm btn-outline-primary rounded-pill px-3 shadow-sm"
                  onClick={() => setShowModal(true)}
                >
                  <i className="bi bi-magic me-1"></i> AI Auto-Fill
                </button>
              </div>
              
              <form className="row g-4 needs-validation" noValidate validated={validated.toString()} onSubmit={submitHandler}>
                
                {/* Standard Inputs */}
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label fw-bold small text-muted text-uppercase">Name</label>
                  <input
                    type="text"
                    className={`form-control ${validated ? (errors.name ? 'is-invalid' : 'is-valid') : ''}`}
                    placeholder="E.g. Gaming Laptop"
                    name="name"
                    value={product.name}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
                
                <div className="col-md-6">
                  <label htmlFor="brand" className="form-label fw-bold small text-muted text-uppercase">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    className={`form-control ${validated ? (errors.brand ? 'is-invalid' : 'is-valid') : ''}`}
                    placeholder="E.g. Asus"
                    value={product.brand}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.brand && <div className="invalid-feedback">{errors.brand}</div>}
                </div>

                <div className="col-md-6">
                  <label htmlFor="category" className="form-label fw-bold small text-muted text-uppercase">Category</label>
                  <select
                    className={`form-select ${validated ? (errors.category ? 'is-invalid' : 'is-valid') : ''}`}
                    value={product.category}
                    onChange={handleInputChange}
                    name="category"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Headphone">Headphone</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Toys">Toys</option>
                    <option value="Fashion">Fashion</option>
                  </select>
                  {errors.category && <div className="invalid-feedback">{errors.category}</div>}
                </div>

                <div className="col-md-6">
                  <label htmlFor="releaseDate" className="form-label fw-bold small text-muted text-uppercase">Release Date</label>
                  <input
                    type="date"
                    className={`form-control ${validated ? (errors.releaseDate ? 'is-invalid' : 'is-valid') : ''}`}
                    value={product.releaseDate}
                    name="releaseDate"
                    onChange={handleInputChange}
                    required
                  />
                  {errors.releaseDate && <div className="invalid-feedback">{errors.releaseDate}</div>}
                </div>
                
                {/* AI Description Section */}
                <div className="col-12">
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label htmlFor="description" className="form-label fw-bold mb-0">
                        Description <span className="text-muted fw-normal">(Optional)</span>
                      </label>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary rounded-pill px-3"
                        onClick={generateDescription}
                        disabled={!canGenerateDescription || generatingDescription}
                      >
                        {generatingDescription ? (
                          <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Generating...</>
                        ) : (
                          <><i className="bi bi-robot me-1"></i> Write with AI</>
                        )}
                      </button>
                    </div>
                    <textarea
                      className={`form-control ${validated && errors.description ? 'is-invalid' : ''}`}
                      placeholder="Add product description or use AI to generate one..."
                      value={product.description}
                      name="description"
                      onChange={handleInputChange}
                      rows="4"
                    />
                    {!canGenerateDescription && (
                      <div className="form-text text-muted small mt-2">
                        <i className="bi bi-info-circle me-1"></i> Fill in product name and category to enable AI writer.
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Numbers */}
                <div className="col-md-6">
                  <label htmlFor="price" className="form-label fw-bold small text-muted text-uppercase">Price</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">₹</span>
                    <input
                      type="number"
                      className={`form-control ${validated ? (errors.price ? 'is-invalid' : 'is-valid') : ''}`}
                      placeholder="0.00"
                      onChange={handleInputChange}
                      value={product.price}
                      name="price"
                      min="0.01"
                      step="0.01"
                      required
                    />
                    {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                  </div>
                </div>

                <div className="col-md-6">
                  <label htmlFor="stockQuantity" className="form-label fw-bold small text-muted text-uppercase">Stock Quantity</label>
                  <input
                    type="number"
                    className={`form-control ${validated ? (errors.stockQuantity ? 'is-invalid' : 'is-valid') : ''}`}
                    placeholder="Units available"
                    onChange={handleInputChange}
                    value={product.stockQuantity}
                    name="stockQuantity"
                    min="0"
                    required
                  />
                  {errors.stockQuantity && <div className="invalid-feedback">{errors.stockQuantity}</div>}
                </div>
                
                {/* Image Section */}
                <div className="col-12">
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <label htmlFor="imageFile" className="form-label fw-bold mb-0">
                        Product Image <span className="text-muted fw-normal">(Optional)</span>
                      </label>
                      <button
                        type="button"
                        className="btn btn-sm btn-success rounded-pill px-3"
                        onClick={generateImage}
                        disabled={!canGenerateImage || generatingImage}
                      >
                        {generatingImage ? (
                          <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Generating...</>
                        ) : (
                          <><i className="bi bi-image me-1"></i> Create with AI</>
                        )}
                      </button>
                    </div>
                    
                    <input
                      className={`form-control ${validated && errors.image ? 'is-invalid' : ''}`}
                      type="file"
                      onChange={handleImageChange}
                      id="imageFile"
                      accept="image/png, image/jpeg"
                    />
                    {errors.image && <div className="invalid-feedback d-block">{errors.image}</div>}
                    
                    {!canGenerateImage && (
                      <div className="form-text text-muted small mt-2">
                        <i className="bi bi-info-circle me-1"></i> Provide a name, category, and description to enable AI image generation.
                      </div>
                    )}
                    
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="mt-4 text-center">
                        <div className="d-flex justify-content-between align-items-center mb-2 px-2">
                          <span className="badge bg-secondary">
                            {aiGeneratedImage ? "AI Generated Preview" : "Upload Preview"}
                          </span>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger border-0"
                            onClick={() => {
                              setImagePreview(null);
                              setImage(null);
                              setAiGeneratedImage(null);
                              document.getElementById('imageFile').value = '';
                            }}
                          >
                            <i className="bi bi-x-circle fs-5"></i>
                          </button>
                        </div>
                        <div className="border rounded-3 p-3 bg-white shadow-sm d-inline-block">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="img-fluid rounded"
                            style={{ maxHeight: "250px", objectFit: "contain" }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Availability Toggle */}
                <div className="col-12">
                  <div className="form-check form-switch fs-5 mt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="productAvailable"
                      id="productAvailable"
                      checked={product.productAvailable}
                      onChange={handleInputChange}
                      style={{ cursor: "pointer" }}
                    />
                    <label className="form-check-label ms-2" htmlFor="productAvailable" style={{ cursor: "pointer" }}>
                      Make Product Available to Customers
                    </label>
                  </div>
                </div>
                
                <hr className="my-4 text-muted" />

                {/* Submit Button */}
                <div className="col-12 mt-2">
                  <button 
                    type="submit" 
                    className="btn btn-dark btn-lg w-100 py-3 fw-bold rounded-pill shadow-sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Saving to Database...</>
                    ) : (
                      <><i className="bi bi-cloud-arrow-up me-2"></i>Publish Product</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* AI Full Product Generation Modal */}
      <div className={`modal fade ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none', backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header bg-primary text-white border-bottom-0 pb-3">
              <h5 className="modal-title fw-bold">
                <i className="bi bi-magic me-2"></i>AI Product Generator
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowModal(false)}
                disabled={generatingProduct}
              ></button>
            </div>
            <div className="modal-body p-4 bg-light">
              <p className="text-muted mb-4">Describe the product you want to create, and our AI will instantly generate the specs, pricing, and category for you.</p>
              
              <div className="form-floating mb-3">
                <textarea
                  id="aiPrompt"
                  className="form-control border-0 shadow-sm"
                  style={{ height: '120px', resize: 'none' }}
                  placeholder="Describe your product..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  disabled={generatingProduct}
                ></textarea>
                <label htmlFor="aiPrompt">E.g., A premium 4k drone with 3-axis gimbal...</label>
              </div>
            </div>
            <div className="modal-footer border-top-0 pt-0 bg-light">
              <button 
                type="button" 
                className="btn btn-link text-muted text-decoration-none" 
                onClick={() => setShowModal(false)}
                disabled={generatingProduct}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary rounded-pill px-4 shadow-sm" 
                onClick={handleGenerateProduct}
                disabled={generatingProduct || !aiPrompt.trim()}
              >
                {generatingProduct ? (
                  <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Analyzing...</>
                ) : (
                  <><i className="bi bi-stars me-1"></i> Generate Details</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;