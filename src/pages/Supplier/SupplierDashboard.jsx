// src/pages/supplier/SupplierDashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  CircularProgress,
  Button,
  Modal,
  TextField,
  Grid,
  Stack,
  IconButton,
  Alert,
  Tooltip,
} from "@mui/material";
import { Edit, Save, Close, ContentCopy, Check } from "@mui/icons-material";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import InventorySection from "./sections/InventorySection";
import SalesSection from "./sections/SalesSection";
import StoreDashboard from "./sections/StoreDashboard";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const IMAGE_BASE = (import.meta.env.VITE_IMAGE_BASE_URL || "").replace(/\/$/, "");

export default function SupplierDashboard() {
  const { user, setUser } = useAuth();
  const [supplier, setSupplier] = useState(user?.supplierProfile || null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [loading, setLoading] = useState(!supplier);
  const [copied, setCopied] = useState(false);

  const [openEdit, setOpenEdit] = useState(false);
  const [form, setForm] = useState({
    store_name: "",
    store_description: "",
    whatsapp_number: "",
    country: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef();

  const buildLogoUrl = (dbPath) => {
    if (!dbPath) return null;
    const parts = dbPath.split("/").filter(Boolean);
    const lastTwo = parts.slice(-2).join("/");
    if (IMAGE_BASE) return `${IMAGE_BASE}/${lastTwo}`;
    if (dbPath.startsWith("http")) return dbPath;
    return dbPath;
  };

  const getPublicLink = () => (supplier?.id ? `https://storensupply/supplier/${supplier.id}` : null);

  const handleCopyLink = async () => {
    const link = getPublicLink();
    if (link) {
      try {
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  const fetchSupplier = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await axios.get(`${API_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sp = res.data?.supplierProfile ?? null;
      setSupplier(sp);
      setUser((prev) => ({ ...prev, supplierProfile: sp }));
      if (sp) {
        setForm({
          store_name: sp.store_name || "",
          store_description: sp.store_description || "",
          whatsapp_number: sp.whatsapp_number || "",
          country: sp.country || "",
        });
        setLogoPreview(sp.logo ? buildLogoUrl(sp.logo) : null);
      }
    } catch (err) {
      console.error("Failed to fetch supplier:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!supplier) fetchSupplier();
    else {
      setLogoPreview(supplier.logo ? buildLogoUrl(supplier.logo) : null);
      setForm({
        store_name: supplier.store_name || "",
        store_description: supplier.store_description || "",
        whatsapp_number: supplier.whatsapp_number || "",
        country: supplier.country || "",
      });
    }
  }, []);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const preview = URL.createObjectURL(file);
    setLogoPreview(preview);
  };

  const handleOpenEdit = () => {
    setMessage(null);
    setOpenEdit(true);
    if (supplier) {
      setForm({
        store_name: supplier.store_name || "",
        store_description: supplier.store_description || "",
        whatsapp_number: supplier.whatsapp_number || "",
        country: supplier.country || "",
      });
      setLogoPreview(supplier.logo ? buildLogoUrl(supplier.logo) : null);
      setLogoFile(null);
    }
  };

  const handleCloseEdit = () => {
    if (logoFile && logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(null);
    setMessage(null);
    setOpenEdit(false);
  };

  const handleInput = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setMessage(null);
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({ type: "error", text: "You must be logged in to update the profile." });
        setSaving(false);
        return;
      }

      const fd = new FormData();
      fd.append("store_name", form.store_name || "");
      fd.append("store_description", form.store_description || "");
      fd.append("whatsapp_number", form.whatsapp_number || "");
      fd.append("country", form.country || "");
      if (logoFile) fd.append("logo", logoFile);

      const res = await axios.put(`${API_URL}/supplier/update`, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        setMessage({ type: "success", text: res.data.message || "Updated successfully." });
        await fetchSupplier();
        setTimeout(() => {
          handleCloseEdit();
        }, 700);
      } else {
        setMessage({ type: "error", text: res.data?.message || "Update failed" });
      }
    } catch (err) {
      console.error("Supplier update error:", err);
      setMessage({ type: "error", text: err.response?.data?.message || err.message || "Update failed" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ height: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress size={45} />
      </Box>
    );
  }

  if (!supplier) {
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <Typography variant="h6" color="text.secondary">
          Supplier profile not found.
        </Typography>
        <Typography color="text.secondary">Please create your supplier profile first.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: "100%", mt: 0, mb: 0, boxShadow: 0, bgcolor: "#fff" }}>
      {/* Header Section */}
      <Paper
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "flex-start",
          p: { xs: 3, md: 8 },
          mb: 0,
          gap: { xs: 2, md: 4 },
        }}
      >
        {/* Logo */}
        <Avatar
          src={logoPreview || "/default-avatar.png"}
          alt={supplier?.store_name}
          sx={{
            width: { xs: 120, md: 180 },
            height: { xs: 140, md: 200 },
            borderRadius: "12px",
            flexShrink: 0,
            mb: { xs: 2, md: 0 },
          }}
          variant="rounded"
        />

        {/* Store Info */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: 120,
            width: "100%",
          }}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ mb: 1, fontSize: { xs: "1.4rem", md: "2rem" } }}
            >
              {supplier?.store_name}
            </Typography>
            <Typography
              color="text.secondary"
              sx={{
                mb: 2,
                lineHeight: 1.6,
                width: { xs: "100%", md: "60%" },
                fontSize: { xs: "0.875rem", md: "1rem" },
              }}
            >
              {supplier?.store_description || "No description"}
            </Typography>
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: { xs: 2, md: 0 } }}>
            {["dashboard", "inventory", "sales"].map((section) => (
              <Button
                key={section}
                onClick={() => setActiveSection(section)}
                sx={{
                  bgcolor: activeSection === section ? "#D4AF37" : "#E5C547",
                  color: "#000",
                  fontWeight: "bold",
                  width: { xs: "100%", sm: 140 },
                  height: 45,
                  "&:hover": { bgcolor: "#D4AF37" },
                }}
              >
                {section.toUpperCase()}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Edit & Public Link */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            textAlign: { xs: "center", md: "right" },
            alignItems: { xs: "center", md: "flex-end" },
            mt: { xs: 2, md: 0 },
          }}
        >
          <Button
            variant="text"
            startIcon={<Edit />}
            onClick={handleOpenEdit}
            sx={{
              whiteSpace: "nowrap",
              textDecoration: "underline",
              color: "#000",
              fontWeight: "bold",
              fontSize: "1rem",
              textTransform: "none",
              "&:hover": { bgcolor: "transparent", opacity: 0.7 },
            }}
          >
            edit store
          </Button>

          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{
              p: 1.5,
              borderRadius: 0,
              flexWrap: "wrap",
              justifyContent: { xs: "center", md: "flex-end" },
              wordBreak: "break-word",
            }}
          >
            <Typography variant="caption" sx={{ color: "#666", fontWeight: "500" }}>
              Public link:
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#1976d2",
                fontSize: "0.8rem",
                fontFamily: "monospace",
                textDecoration: "underline",
              }}
            >
              {getPublicLink()}
            </Typography>
            <Tooltip title={copied ? "Copied!" : "Copy link"} placement="top">
              <IconButton size="small" sx={{ p: 0.5 }} onClick={handleCopyLink}>
                {copied ? <Check sx={{ color: "green" }} /> : <ContentCopy />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Paper>

      {/* Dynamic Sections */}
      {activeSection === "dashboard" && <StoreDashboard />}
      {activeSection === "inventory" && <InventorySection />}
      {activeSection === "sales" && <SalesSection />}

      {/* Edit Modal */}
      <Modal open={openEdit} onClose={handleCloseEdit}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", md: 720 },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 3,
            borderRadius: 2,
            maxHeight: "85vh",
            overflowY: "auto",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Edit Supplier Profile</Typography>
            <IconButton onClick={handleCloseEdit}>
              <Close />
            </IconButton>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField label="Store name" name="store_name" value={form.store_name} onChange={handleInput} fullWidth />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField label="Country" name="country" value={form.country} onChange={handleInput} fullWidth />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Store description"
                name="store_description"
                value={form.store_description}
                onChange={handleInput}
                fullWidth
                multiline
                minRows={3}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField label="WhatsApp number" name="whatsapp_number" value={form.whatsapp_number} onChange={handleInput} fullWidth />
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <Button variant="contained" component="label">
                  Choose Logo
                  <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={onFileChange} />
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    if (logoFile && logoPreview) URL.revokeObjectURL(logoPreview);
                    setLogoFile(null);
                    setLogoPreview(supplier.logo ? buildLogoUrl(supplier.logo) : null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  Reset
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ width: { xs: "100%", sm: "auto" } }}>
                  Logo optional — recommended &lt; 2MB
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              {message && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Button variant="contained" startIcon={<Save />} onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </Button>
                <Button variant="outlined" onClick={handleCloseEdit} disabled={saving}>
                  Cancel
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </Box>
  );
}
