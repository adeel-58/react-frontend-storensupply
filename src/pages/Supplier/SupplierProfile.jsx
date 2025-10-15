// src/pages/Supplier/SupplierProfile.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function SupplierProfile() {
  const { user, setUser } = useAuth();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [supplier, setSupplier] = useState(null);
  const [form, setForm] = useState({
    store_name: "",
    store_description: "",
    whatsapp_number: user?.whatsapp_number || "",
    country: "",
    logo: null,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSupplier(res.data.supplierProfile || null);
      } catch (err) {
        console.error("Error fetching supplier:", err);
        showNotification("Failed to load supplier info", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSupplier();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogoChange = (e) => setForm({ ...form, logo: e.target.files[0] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("user_id", user.id);
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      const res = await axios.post(`${API_URL}/supplier/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        showNotification("Supplier profile created successfully!", "success");
        setSupplier(res.data.supplierProfile);
        setUser((prev) => ({
          ...prev,
          role: "both",
          supplierProfile: res.data.supplierProfile,
        }));
      } else {
        showNotification(res.data.message || "Failed to create supplier", "error");
      }
    } catch (err) {
      console.error("Create supplier error:", err);
      showNotification(
        err.response?.data?.message || "Error creating supplier profile",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <Box sx={{ height: "70vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Box>
    );

  if (supplier) {
    // Redirect to SupplierDashboard
    window.location.href = "/supplier-dashboard";
    return null;
  }

  return (
    <Paper sx={{ maxWidth: 500, mx: "auto", p: 4, mt: 6 }}>
      <Typography variant="h5" textAlign="center" gutterBottom>
        Create Your Supplier Profile
      </Typography>
      <Typography textAlign="center" color="text.secondary" sx={{ mb: 3 }}>
        Fill in your store details to get started.
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Store Name"
          name="store_name"
          value={form.store_name}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Store Description"
          name="store_description"
          value={form.store_description}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="WhatsApp Number"
          name="whatsapp_number"
          value={form.whatsapp_number}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Country"
          name="country"
          value={form.country}
          onChange={handleChange}
          margin="normal"
        />

        <Button variant="contained" component="label" sx={{ mt: 2, mb: 1 }}>
          Upload Logo (optional)
          <input type="file" accept="image/*" hidden onChange={handleLogoChange} />
        </Button>

        {form.logo && (
          <Typography variant="body2" color="text.secondary">
            Selected: {form.logo.name}
          </Typography>
        )}

        <Button
          fullWidth
          type="submit"
          variant="contained"
          sx={{ mt: 3 }}
          disabled={submitting}
        >
          {submitting ? "Creating..." : "Create Supplier Profile"}
        </Button>
      </Box>
    </Paper>
  );
}
