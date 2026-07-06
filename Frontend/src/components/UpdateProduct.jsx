import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import AppContext from "../Context/Context"; // Import context for syncing

const UpdateProduct = () => {
  const { id } = useParams();
  const { refreshData } = useContext(AppContext); // Pull in the refresh function
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8080";

  const [product, setProduct] = useState({});
  const [image, setImage] = useState();
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  
  const [updateProduct, setUpdateProduct] = useState({
    id: null,
    name: "",
    description: "",
    brand: "",
    price: "",
    category: "",
    releaseDate: "",
    productAvailable: false,
    stockQuantity: "",
  });

  const [imageChanged, setImageChanged] = useState(false);
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch initial product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/product/${id}`);
        setProduct(response.data);
        
        // Format the date correctly for the input type="date"
        const formattedData = { ...response.data };
        if (formattedData.releaseDate) {
          formattedData.releaseDate = formattedData.releaseDate.slice(0, 10);
        }
        setUpdateProduct(formattedData);

        // Fetch existing image
        if (response.data.imageName) {
          const responseImage = await axios.get(`${baseUrl}/api/product/${id}/image`, { 
            responseType: "blob" 
          });
          const imageFile = new File([responseImage.data], response.data.imageName, { type: responseImage.data.type });
          setImage(imageFile);
          setImagePreviewUrl(URL.createObjectURL(imageFile));
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details.");
      }
    };

    fetchProduct();
  }, [id, baseUrl]);

  // Prevent memory leaks from object URLs
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setValidated(true);
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    setLoading(true);
    const updatedProductFormData = new FormData();
    
    if (imageChanged && image) {
      updatedProductFormData.append("imageFile", image);
    } else {
      // Send an empty blob instead of "null" to prevent Spring Boot Multipart exceptions
      updatedProductFormData.append("imageFile", new Blob([], { type: 'application/octet-stream' }));
    }
    
    updatedProductFormData.append(
      "product",
      new Blob([JSON.stringify(updateProduct)], { type: "application/json" })
    );

    try {
      await axios.put(`${baseUrl}/api/product/${id}`, updatedProductFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      toast.success("Product updated successfully! 🔄");
      refreshData(); // Sync the global context so changes reflect immediately
      navigate(`/product/${id}`); // Send them back to the product detail page instead of home
      
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error.response?.data?.message || "Failed to update product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUpdateProduct({
      ...updateProduct,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImageChanged(true);
      
      // Update preview immediately
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  if (!product.id) {
    return (
      <div className="container mt-5 pt-5 d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 pt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-5">
              
              <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <h3 className="card-title fw-bold mb-0">
                  <i className="bi bi-pencil-square text-primary me-2"></i>Update Product
                </h3>
                <span className="badge bg-light text-secondary border">ID: {id}</span>
              </div>
              
              <form className="row g-4 needs-validation" noValidate validated={validated.toString()} onSubmit={handleSubmit}>
                
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label fw-bold small text-muted text-uppercase">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={updateProduct.name}
                    onChange={handleChange}
                    name="name"
                    id="name"
                    required
                  />
                </div>
                
                <div className="col-md-6">
                  <label htmlFor="brand" className="form-label fw-bold small text-muted text-uppercase">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    className="form-control"
                    value={updateProduct.brand}
                    onChange={handleChange}
                    id="brand"
                    required
                  />
                </div>
                
                <div className="col-md-6">
                  <label htmlFor="category" className="form-label fw-bold small text-muted text-uppercase">Category</label>
                  <select
                    className="form-select"
                    value={updateProduct.category}
                    onChange={handleChange}
                    name="category"
                    id="category"
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
                </div>

                <div className="col-md-6">
                  <label htmlFor="releaseDate" className="form-label fw-bold small text-muted text-uppercase">Release Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={updateProduct.releaseDate}
                    name="releaseDate"
                    onChange={handleChange}
                    id="releaseDate"
                    required
                  />
                </div>
                
                <div className="col-12">
                  <label htmlFor="description" className="form-label fw-bold small text-muted text-uppercase">Description</label>
                  <textarea
                    className="form-control"
                    value={updateProduct.description}
                    name="description"
                    onChange={handleChange}
                    id="description"
                    rows="4"
                    required
                  />
                </div>
                
                <div className="col-md-6">
                  <label htmlFor="price" className="form-label fw-bold small text-muted text-uppercase">Price</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">₹</span>
                    <input
                      type="number"
                      className="form-control"
                      onChange={handleChange}
                      value={updateProduct.price}
                      name="price"
                      id="price"
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                
                <div className="col-md-6">
                  <label htmlFor="stockQuantity" className="form-label fw-bold small text-muted text-uppercase">Stock Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    onChange={handleChange}
                    value={updateProduct.stockQuantity}
                    name="stockQuantity"
                    id="stockQuantity"
                    min="0"
                    required
                  />
                </div>
                
                <div className="col-12">
                  <div className="p-3 bg-light rounded-3 border">
                    <label htmlFor="imageFile" className="form-label fw-bold">Update Image</label>
                    <input
                      className="form-control mb-3"
                      type="file"
                      onChange={handleImageChange}
                      id="imageFile"
                      accept="image/png, image/jpeg"
                    />
                    
                    <div className="text-center">
                      <small className="text-muted d-block mb-2">
                        {imageChanged ? "New Image Preview:" : "Current Image:"}
                      </small>
                      {imagePreviewUrl ? (
                        <div className="border rounded-3 p-3 bg-white shadow-sm d-inline-block">
                          <img
                            src={imagePreviewUrl}
                            alt="Preview"
                            className="img-fluid rounded"
                            style={{ height: "150px", objectFit: "contain" }}
                          />
                        </div>
                      ) : (
                        <div className="p-3 border rounded text-muted">No image uploaded</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-12">
                  <div className="form-check form-switch fs-5 mt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="productAvailable"
                      id="productAvailable"
                      checked={updateProduct.productAvailable}
                      onChange={handleChange}
                      style={{ cursor: "pointer" }}
                    />
                    <label className="form-check-label ms-2" htmlFor="productAvailable" style={{ cursor: "pointer" }}>
                      Product Available for Sale
                    </label>
                  </div>
                </div>
                
                <hr className="my-4 text-muted" />

                <div className="col-12 d-flex gap-3">
                  <button 
                    type="submit" 
                    className="btn btn-dark btn-lg flex-grow-1 fw-bold rounded-pill shadow-sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Updating Database...</>
                    ) : (
                      <><i className="bi bi-cloud-arrow-up me-2"></i>Save Changes</>
                    )}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary btn-lg rounded-pill px-4"
                    onClick={() => navigate(`/product/${id}`)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
                
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProduct;