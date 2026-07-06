import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AppContext from '../Context/Context';
import { AuthContext } from '../Context/AuthContext'; // Imported to auto-fill user data

const CheckoutPopup = ({ show, handleClose, cartItems, totalPrice }) => {
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8080";
  const navigate = useNavigate();
  
  // Pull global cart actions to ensure the UI updates instantly after purchase
  const { clearCart, refreshData } = useContext(AppContext);
  const { user } = useContext(AuthContext); // Get logged-in user

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill the form if the user is already logged in
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user, show]);

  const handleConfirm = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);
    setIsSubmitting(true);

    const orderItems = cartItems.map(item => ({
      productId: item.id,
      quantity: item.quantity
    }));

    const data = {
      customerName: name,
      email: email,
      items: orderItems
    };

    try {
      // API SYNC: Posting the order data to your OrderStack backend
      const response = await axios.post(`${baseUrl}/api/orders/place`, data);
      
      toast.success('Order placed successfully! 🎉');

      // Clean up global state
      clearCart();
      refreshData(); 
      handleClose();

    // Redirect to Profile and tell it to open the Orders tab!
      setTimeout(() => {
        // Replace navigate('/'); with this:
        navigate('/profile', { state: { activeTab: 'orders' } });
      }, 2000);
      
    } catch (error) {
      console.error("Checkout Error:", error);
      toast.error('Failed to place order. Please try again or contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when modal closes so it's clean for the next time
  const handleModalClose = () => {
    if (!user) {
      setName('');
      setEmail('');
    }
    setValidated(false);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleModalClose} centered backdrop="static" size="md">
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title className="fw-bold d-flex align-items-center">
          <div className="bg-success-subtle text-success rounded-circle d-flex justify-content-center align-items-center me-3" style={{ width: "40px", height: "40px" }}>
            <i className="bi bi-shield-lock-fill fs-5"></i>
          </div>
          Secure Checkout
        </Modal.Title>
      </Modal.Header>
      
      <Form noValidate validated={validated} onSubmit={handleConfirm}>
        <Modal.Body className="pt-4">
          
          {/* Scrollable Order Summary (Sleek Receipt UI) */}
          <h6 className="fw-bold mb-3 text-uppercase text-muted" style={{ letterSpacing: "1px", fontSize: "0.8rem" }}>Order Summary</h6>
          
          <div className="checkout-items mb-4 pe-2" style={{ maxHeight: '220px', overflowY: 'auto' }}>
            {cartItems.map((item) => (
              <div 
                key={item.id} 
                className="d-flex justify-content-between align-items-center mb-3 p-3 bg-white rounded-3 shadow-sm border-start border-primary border-4 transition-all"
              >
                <div className="flex-grow-1 pe-3">
                  <h6 className="mb-1 fw-bold text-dark text-truncate" style={{ maxWidth: '220px' }}>{item.name}</h6>
                  <span className="badge bg-secondary-subtle text-secondary rounded-pill fw-semibold px-2">Qty: {item.quantity}</span>
                </div>
                <div className="text-end">
                  <span className="fw-bold" style={{ color: "#0a4297", fontSize: "1.1rem" }}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Premium Gradient Total Box */}
          <div 
            className="d-flex justify-content-between align-items-center p-3 rounded-4 mb-4 shadow-sm text-white" 
            style={{ background: "linear-gradient(45deg, #0a4297, #0052D4)" }}
          >
            <span className="text-uppercase fw-semibold" style={{ letterSpacing: "1px", fontSize: "0.9rem" }}>Total Amount</span>
            <h3 className="mb-0 fw-bold">₹{totalPrice.toFixed(2)}</h3>
          </div>

          <h6 className="fw-bold mb-3 text-uppercase text-muted" style={{ letterSpacing: "1px", fontSize: "0.8rem" }}>Customer Details</h6>
          
          <Form.Group className="mb-3">
            <Form.Label className="small fw-semibold text-dark mb-1">Full Name</Form.Label>
            <div className="input-group input-group-lg shadow-sm">
              <span className="input-group-text bg-white border-end-0"><i className="bi bi-person text-primary"></i></span>
              <Form.Control
                type="text"
                className="border-start-0 ps-0 bg-white"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ fontSize: "0.95rem" }}
              />
              <Form.Control.Feedback type="invalid">
                Please provide your full name.
              </Form.Control.Feedback>
            </div>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label className="small fw-semibold text-dark mb-1">Email Address</Form.Label>
            <div className="input-group input-group-lg shadow-sm">
              <span className="input-group-text bg-white border-end-0"><i className="bi bi-envelope text-primary"></i></span>
              <Form.Control
                type="email"
                className="border-start-0 ps-0 bg-white"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ fontSize: "0.95rem" }}
              />
              <Form.Control.Feedback type="invalid">
                Please provide a valid email address.
              </Form.Control.Feedback>
            </div>
          </Form.Group>

        </Modal.Body>
        <Modal.Footer className="border-top-0 pt-0 pb-4 px-4 d-flex gap-2">
          <Button variant="light" className="px-4 py-2 rounded-pill fw-semibold flex-grow-1 border" onClick={handleModalClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            className="px-4 py-2 rounded-pill fw-bold shadow-sm flex-grow-1" 
            style={{ background: "linear-gradient(45deg, #0a4297, #0052D4)", border: "none" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Processing...
              </>
            ) : 'Confirm Purchase'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CheckoutPopup;