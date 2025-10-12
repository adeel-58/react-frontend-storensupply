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

  // Verify token on app load
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
        setUser(res.data.user);
      } catch {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, []);

  const login = (data) => {
    localStorage.setItem("token", data.token);
    setUser(data.user);
    showNotification("Login successful! Welcome back 👋", "success");
    navigate("/");
  };

  const signup = (data) => {
    localStorage.setItem("token", data.token);
    setUser(data.user);
    showNotification("Signup successful! Welcome aboard 🎉", "success");
    navigate("/");
  };

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
