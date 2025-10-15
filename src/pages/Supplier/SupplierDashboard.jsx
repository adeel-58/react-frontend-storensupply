import { useState, useEffect } from "react";
import { Box, Typography, Avatar, Paper, Divider, CircularProgress } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import SupplierNavbar from "./components/SupplierNavbar";
import axios from "axios";
import InventorySection from "./sections/InventorySection";

const API_URL = import.meta.env.VITE_API_URL;
const API_URL2 = import.meta.env.VITE_API_URL2;
export default function SupplierDashboard() {
  const { user, setUser } = useAuth();
  const [supplier, setSupplier] = useState(user?.supplierProfile || null);
  const [activeSection, setActiveSection] = useState("store-dashboard");
  const [loading, setLoading] = useState(!supplier);

  // 🔹 Fetch supplier from /auth/verify if missing
  useEffect(() => {
    const fetchSupplier = async () => {
      if (!supplier) {
        try {
          setLoading(true);
          const token = localStorage.getItem("token");
          const res = await axios.get(`${API_URL}/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.data.supplierProfile) {
            setSupplier(res.data.supplierProfile);
            setUser((prev) => ({
              ...prev,
              supplierProfile: res.data.supplierProfile,
            }));
          }
        } catch (err) {
          console.error("Failed to fetch supplier:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSupplier();
  }, []);

  // 🔹 Loading state
  if (loading) {
    return (
      <Box
        sx={{
          height: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={45} />
      </Box>
    );
  }

  // 🔹 No Supplier Found
  if (!supplier) {
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <Typography variant="h6" color="text.secondary">
          Supplier profile not found.
        </Typography>
        <Typography color="text.secondary">
          Please create your supplier profile first.
        </Typography>
      </Box>
    );
  }

  // ✅ Supplier Dashboard View
  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", mt: 6 }}>
      {/* Header Section */}
      <Paper sx={{ display: "flex", alignItems: "center", p: 3, mb: 4, gap: 3 }}>
       <Avatar
  src={
    supplier?.logo
      ? `${import.meta.env.VITE_API_URL2.replace(/\/$/, "")}${supplier.logo}`
      : "/default-avatar.png"
  }
  alt={supplier?.store_name}
  sx={{ width: 90, height: 90, borderRadius: "12px" }}
/>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            {supplier?.store_name}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            {supplier?.store_description || "No description"}
          </Typography>
          <Typography>
            ⭐ Rating: {supplier?.rating ?? "N/A"} |{" "}
            {supplier?.is_verified ? "✅ Verified" : "❌ Not Verified"}
          </Typography>
        </Box>
      </Paper>

      {/* Navbar */}
      <SupplierNavbar setActiveSection={setActiveSection} />

      <Divider sx={{ mb: 3 }} />

      {/* Dynamic Section Rendering */}
      {activeSection === "store-dashboard" && <Typography>Store Dashboard Section</Typography>}
      {activeSection === "plan" && <Typography>Plan Management Section</Typography>}
      {activeSection === "inventory" && <InventorySection />}

      {activeSection === "analytics" && <Typography>Analytics Dashboard Section</Typography>}
      {activeSection === "sales" && <Typography>Sales Section</Typography>}
    </Box>
  );
}
