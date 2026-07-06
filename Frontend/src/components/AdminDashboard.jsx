import React, { useState, useEffect, useContext } from 'react';
import { Modal, Button, Form, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../Context/AuthContext'; // Import AuthContext

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8080";
  
  // Bring in the logged-in user to display in the sidebar
  const { user } = useContext(AuthContext);

  // --- CATEGORY STATE ---
  const [showCatModal, setShowCatModal] = useState(false);
  const [showUpdateCatModal, setShowUpdateCatModal] = useState(false); // New state for Update Modal
  const [editingCategory, setEditingCategory] = useState({ id: null, name: '', image: '' }); // Tracks which category is being edited
  
  // Dummy data for now until we build the Spring Boot Category backend
  const [categories, setCategories] = useState([
    { id: 1, name: 'Mobiles', image: '📱' },
    { id: 2, name: 'Laptops', image: '💻' },
    { id: 3, name: 'Electronics', image: '🎧' }
  ]);

  // --- PRODUCT & USER STATE ---
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchUsers();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/products`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/users`);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // --- ROW CLICK HANDLERS ---
  const handleRowClick = (id) => {
    navigate(`/product/${id}`);
  };

  const handleUserRowClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  // --- CATEGORY HANDLERS ---
  const handleCatClose = () => setShowCatModal(false);
  const handleUpdateCatClose = () => setShowUpdateCatModal(false);

  const handleAddCategory = (e) => {
    e.preventDefault();
    console.log("Saving new category...");
    handleCatClose();
  };

  const openUpdateCategoryModal = (cat) => {
    setEditingCategory(cat);
    setShowUpdateCatModal(true);
  };

  const handleUpdateCategorySubmit = (e) => {
    e.preventDefault();
    console.log("Updating category to:", editingCategory);
    // TODO: Send axios.put() to Spring Boot backend later
    
    // Optimistic UI update (just for the frontend dummy data)
    setCategories(categories.map(c => c.id === editingCategory.id ? editingCategory : c));
    handleUpdateCatClose();
  };

  return (
    <div style={{ backgroundColor: "#f4f9ff", minHeight: "100vh", paddingTop: "6rem", paddingBottom: "3rem" }}>
      <div className="container">
        <div className="row">
          
          {/* LEFT SIDEBAR */}
          <div className="col-md-3 mb-4">
            {/* UPDATED: Admin Card is now clickable to go to /profile */}
            <div 
              className="card shadow-sm border-0 rounded-4 mb-4 p-3 d-flex flex-row align-items-center hover-overlay"
              onClick={() => navigate('/profile')}
              style={{ cursor: "pointer", transition: "0.2s" }}
              title="Edit My Profile"
            >
              <div className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-3" style={{ width: "50px", height: "50px", fontSize: "1.5rem" }}>
                <i className="bi bi-person"></i>
              </div>
              <div>
                <small className="text-muted d-block mb-0" style={{ fontSize: "0.8rem" }}>Admin Portal</small>
                {/* Dynamically show Admin Name */}
                <span className="fw-bold text-dark">{user?.name || 'Admin'}</span>
              </div>
            </div>

            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
              <div className="list-group list-group-flush">
                <button 
                  className={`list-group-item list-group-item-action py-3 fw-semibold border-0 ${activeTab === 'categories' ? 'bg-primary text-white' : 'text-dark'}`}
                  onClick={() => setActiveTab('categories')}
                >
                  <i className="bi bi-tags me-2"></i> Categories
                </button>
                <button 
                  className={`list-group-item list-group-item-action py-3 fw-semibold border-0 ${activeTab === 'products' ? 'bg-primary text-white' : 'text-dark'}`}
                  onClick={() => setActiveTab('products')}
                >
                  <i className="bi bi-box-seam me-2"></i> Products
                </button>
                
                <button 
                  className={`list-group-item list-group-item-action py-3 fw-semibold border-0 ${activeTab === 'users' ? 'bg-primary text-white' : 'text-dark'}`}
                  onClick={() => setActiveTab('users')}
                >
                  <i className="bi bi-people me-2"></i> Users
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT AREA */}
          <div className="col-md-9">
            <div className="card shadow-sm border-0 rounded-4 p-4">
              
              {/* === CATEGORIES TAB === */}
              {activeTab === 'categories' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold" style={{ color: "#0a4297" }}>Manage Categories</h4>
                    <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" onClick={() => setShowCatModal(true)}>
                      <i className="bi bi-plus-circle me-2"></i> Add Category
                    </button>
                  </div>
                  <Table responsive hover className="align-middle">
                    <thead className="bg-light text-muted">
                      <tr>
                        <th className="border-0 rounded-start">Image</th>
                        <th className="border-0">Category Name</th>
                        <th className="border-0 rounded-end text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((cat) => (
                        <tr key={cat.id}>
                          <td style={{ width: "60px" }}>
                            <div className="bg-light rounded text-center shadow-sm d-flex align-items-center justify-content-center" style={{ width: "45px", height: "45px", fontSize: "1.2rem" }}>
                              {cat.image}
                            </div>
                          </td>
                          <td className="fw-semibold">{cat.name}</td>
                          <td className="text-end">
                            {/* UPDATED: Update Button triggers Modal */}
                            <button 
                              className="btn btn-sm btn-outline-secondary me-2 rounded-pill px-3"
                              onClick={() => openUpdateCategoryModal(cat)}
                            >
                              Update
                            </button>
                            <button className="btn btn-sm btn-danger rounded-pill px-3">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {/* === PRODUCTS TAB === */}
              {activeTab === 'products' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold" style={{ color: "#0a4297" }}>Manage Products</h4>
                    <button 
                      className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" 
                      onClick={() => navigate('/add_product')}
                    >
                      <i className="bi bi-plus-circle me-2"></i> Add Product
                    </button>
                  </div>
                  <Table responsive hover className="align-middle">
                    <thead className="bg-light text-muted">
                      <tr>
                        <th className="border-0 rounded-start">Name</th>
                        <th className="border-0">Brand</th>
                        <th className="border-0">Category</th>
                        <th className="border-0">Price</th>
                        <th className="border-0 rounded-end">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length > 0 ? (
                        products.map((prod) => (
                          <tr 
                            key={prod.id}
                            onClick={() => handleRowClick(prod.id)}
                            style={{ cursor: "pointer" }}
                            className="position-relative hover-overlay"
                          >
                            <td className="fw-semibold text-truncate" style={{ maxWidth: '200px' }}>{prod.name}</td>
                            <td className="text-muted small">{prod.brand}</td>
                            <td><span className="badge bg-secondary-subtle text-secondary">{prod.category}</span></td>
                            <td className="fw-bold text-success">₹{prod.price}</td>
                            <td>{prod.stockQuantity} units</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center text-muted py-4">
                            No products found in the database.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              )}

              {/* === USERS TAB === */}
              {activeTab === 'users' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold" style={{ color: "#0a4297" }}>Manage Users</h4>
                  </div>
                  <Table responsive hover className="align-middle">
                    <thead className="bg-light text-muted">
                      <tr>
                        <th className="border-0 rounded-start">Name</th>
                        <th className="border-0">Email</th>
                        <th className="border-0 rounded-end">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length > 0 ? (
                        users.map((u) => (
                          <tr 
                            key={u.id} 
                            className="position-relative hover-overlay"
                            onClick={() => handleUserRowClick(u.id)}
                            style={{ cursor: "pointer" }}
                          >
                            <td className="fw-semibold">{u.name}</td>
                            <td className="text-muted">{u.email}</td>
                            <td className="rounded-end">
                              <span className={`badge ${u.role === 'ADMIN' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'}`}>
                                {u.role || 'USER'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center text-muted py-4">
                            No users found in the database.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              )}

              {/* Placeholder for orders
              {activeTab === 'orders' && (
                <div className="text-center py-5 text-muted">
                  <h5><i className="bi bi-tools fs-1 d-block mb-3"></i></h5>
                  <p>Module for Orders is under construction.</p>
                </div>
              )} */}

            </div>
          </div>
        </div>
      </div>

      {/* --- ADD CATEGORY MODAL --- */}
      <Modal show={showCatModal} onHide={handleCatClose} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Add New Category</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddCategory}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control type="text" placeholder="e.g., Electronics" required />
            </Form.Group>
            <Form.Group>
              <Form.Label>Category Image</Form.Label>
              <Form.Control type="file" required />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={handleCatClose}>Cancel</Button>
            <Button variant="primary" type="submit">Save Category</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* --- UPDATE CATEGORY MODAL --- */}
      <Modal show={showUpdateCatModal} onHide={handleUpdateCatClose} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Update Category</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdateCategorySubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control 
                type="text" 
                required 
                value={editingCategory.name}
                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
              />
            </Form.Group>
            {/* Keeping it simple as text/emoji for the dummy data, change to file input later if needed */}
            <Form.Group>
              <Form.Label>Category Image (Emoji/URL)</Form.Label>
              <Form.Control 
                type="text" 
                required 
                value={editingCategory.image}
                onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={handleUpdateCatClose}>Cancel</Button>
            <Button variant="primary" type="submit">Update Category</Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </div>
  );
};

export default AdminDashboard;