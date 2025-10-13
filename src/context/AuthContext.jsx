// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useNotification } from "./NotificationContext";

const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // ✅ Verify token on app load
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Merge user and profile data
        const combinedUser = {
          ...res.data.user,
          sellerProfile: res.data.sellerProfile || null,
          supplierProfile: res.data.supplierProfile || null,
        };

        setUser(combinedUser);
      } catch (error) {
        console.error("Token verification failed:", error);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false); // ✅ ensure this runs always
      }
    };

    verifyToken();
  }, []);

  // ✅ Unified login
  const login = (data) => {
    const combinedUser = {
      ...data.user,
      sellerProfile: data.sellerProfile || null,
      supplierProfile: data.supplierProfile || null,
    };

    localStorage.setItem("token", data.token);
    setUser(combinedUser);
    showNotification("Login successful! Welcome back 👋", "success");
    navigate("/");
  };

  // ✅ Unified signup
  const signup = (data) => {
    const combinedUser = {
      ...data.user,
      sellerProfile: data.sellerProfile || null,
      supplierProfile: data.supplierProfile || null,
    };

    localStorage.setItem("token", data.token);
    setUser(combinedUser);
    showNotification("Signup successful! Welcome aboard 🎉", "success");
    navigate("/");
  };

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    showNotification("Logged out successfully 👋", "info");
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
