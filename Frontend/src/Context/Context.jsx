import axios from "axios"; // If you have a custom axios instance in "../axios", use that!
import { useState, useEffect, createContext } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // --- PRODUCT STATE ---
  const [data, setData] = useState([]);
  const [isError, setIsError] = useState("");
  
  // --- UI & FILTER STATE (Fixes Navbar/Home connection) ---
  const [selectedCategory, setSelectedCategory] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light-theme");

  // --- CART STATE ---
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);
  
  // Fallback to localhost if env variable is missing
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8080";

  // 1. Theme Management Effect
  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark-theme" ? "light-theme" : "dark-theme"));
  };

  // 2. Fetch Data from OrderStack Backend
  const refreshData = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/products`);
      setData(response.data);
      setIsError(""); // Clear any previous errors on success
    } catch (error) {
      setIsError(error.message);
      console.error("Error fetching products from OrderStack:", error);
    }
  };

  // 3. Smart Cart Actions
  const addToCart = (product) => {
    const existingProductIndex = cart.findIndex((item) => item.id === product.id);
    
    if (existingProductIndex !== -1) {
      const updatedCart = [...cart];
      // Prevent adding more than what's in stock in the database
      if (updatedCart[existingProductIndex].quantity < product.stockQuantity) {
        updatedCart[existingProductIndex].quantity += 1;
        setCart(updatedCart);
      }
    } else {
      // Prevent adding if out of stock
      if (product.stockQuantity > 0) {
        setCart([...cart, { ...product, quantity: 1 }]);
      }
    }
  };

  const decrementQuantity = (productId) => {
    const existingProductIndex = cart.findIndex((item) => item.id === productId);
    if (existingProductIndex !== -1) {
      const updatedCart = [...cart];
      if (updatedCart[existingProductIndex].quantity > 1) {
        updatedCart[existingProductIndex].quantity -= 1;
        setCart(updatedCart);
      } else {
        // If it drops below 1, remove it completely
        removeFromCart(productId);
      }
    }
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item.id !== productId);
    setCart(updatedCart);
  };

  const clearCart = () => {
    setCart([]);
  };
  
  // --- LIFECYCLE EFFECTS ---
  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  
  return (
    <AppContext.Provider value={{ 
      data, 
      isError, 
      refreshData,
      
      // Exposing Cart functions
      cart, 
      addToCart, 
      removeFromCart, 
      decrementQuantity, 
      clearCart,
      
      // Exposing UI/Filter functions
      selectedCategory,  
      setSelectedCategory, 
      theme,             
      toggleTheme 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;