// src/pages/Supplier/SupplierProfile.jsx
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Autocomplete,
  Avatar,
  useTheme,
} from "@mui/material";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";

const API_URL = import.meta.env.VITE_API_URL;
const ACCENT = "#D4AF37";

/**
 * Minimal countries dataset used for the Autocomplete.
 * You can extend this list as needed (label, code (ISO2), dial_code).
 * Flags are rendered via getFlagEmoji(code).
 */
const COUNTRIES = [
  { code: "PK", label: "Pakistan", dial_code: "92" },
  { code: "AE", label: "United Arab Emirates", dial_code: "971" },
  { code: "US", label: "United States", dial_code: "1" },
  { code: "GB", label: "United Kingdom", dial_code: "44" },
  { code: "IN", label: "India", dial_code: "91" },
  { code: "CN", label: "China", dial_code: "86" },
  { code: "TR", label: "Turkey", dial_code: "90" },
  { code: "CA", label: "Canada", dial_code: "1" },
  { code: "SA", label: "Saudi Arabia", dial_code: "966" },
  { code: "DE", label: "Germany", dial_code: "49" },
  { code: "FR", label: "France", dial_code: "33" },
  { code: "MY", label: "Malaysia", dial_code: "60" },
  { code: "SG", label: "Singapore", dial_code: "65" },
  { code: "ID", label: "Indonesia", dial_code: "62" },
  { code: "BR", label: "Brazil", dial_code: "55" },
  { code: "AU", label: "Australia", dial_code: "61" },
  { code: "NL", label: "Netherlands", dial_code: "31" },
  { code: "RU", label: "Russia", dial_code: "7" },
  { code: "EG", label: "Egypt", dial_code: "20" },
  { code: "NG", label: "Nigeria", dial_code: "234" },
  { code: "JP", label: "Japan", dial_code: "81" },
  // ...add more countries as needed
];

/** Convert ISO country code to emoji flag */
function getFlagEmoji(countryCode) {
  if (!countryCode) return "";
  // Ensure upper-case two-letter code
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((c) => 127397 + c.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

export default function SupplierProfile() {
  const theme = useTheme();
  const { user, setUser } = useAuth();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [supplier, setSupplier] = useState(null);

  const [form, setForm] = useState({
    store_name: "",
    store_description: "",
    whatsapp_number: user?.whatsapp_number || "",
    country: null, // will store a country object from COUNTRIES
    logo: null,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch supplier info (unchanged behavior)
  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSupplier(res.data.supplierProfile || null);
      } catch (err) {
        showNotification("Failed to load supplier info", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSupplier();
  }, []);

  // Auto-detect country from IP once on mount
  useEffect(() => {
    const detectCountry = async () => {
      try {
        // Free and simple geolocation endpoint
        const res = await fetch("https://ipapi.co/json/");
        if (!res.ok) return;
        const data = await res.json();
        const iso = (data.country_code || "").toUpperCase();
        if (!iso) return;
        const match = COUNTRIES.find((c) => c.code === iso);
        if (match) {
          setForm((prev) => ({ ...prev, country: match }));
        } else {
          // If not in our dataset, create fallback object
          setForm((prev) => ({
            ...prev,
            country: { code: iso, label: data.country_name || iso, dial_code: data.country_calling_code?.replace("+", "") || "" },
          }));
        }
      } catch (err) {
        // silent failure - user can choose manually
        // console.warn("Country auto-detect failed", err);
      }
    };
    detectCountry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If supplier exists, redirect (unchanged)
  useEffect(() => {
    if (supplier) {
      window.location.href = "/supplier-dashboard";
    }
  }, [supplier]);

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // max file size 3 MB
  // max file size 3 MB
  const MAX_LOGO_SIZE = 3 * 1024 * 1024; // 3 MB
  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      showNotification("Invalid file type. Only JPG, PNG, or WEBP images are allowed.", "error");
      return;
    }

    // Check file size
    if (file.size > MAX_LOGO_SIZE) {
      showNotification("Logo file size cannot exceed 3 MB", "error");
      return;
    }

    // All checks passed, update state
    setForm((prev) => ({ ...prev, logo: file }));
  };


  // Country chosen from Autocomplete
  const handleCountrySelect = (_evt, value) => {
    // value is country object or null
    setForm((prev) => ({ ...prev, country: value }));
    setErrors((prev) => ({ ...prev, country: "" }));
  };

  // Phone input change
  const handlePhoneChange = (val, country) => {
    // react-phone-input-2 returns values like "923001234567" or with plus; we keep '+' prefixed
    const normalized = val.startsWith("+") ? val : `+${val}`;
    setForm((prev) => ({
      ...prev,
      whatsapp_number: normalized,
    }));
    setErrors((prev) => ({ ...prev, whatsapp_number: "" }));
  };

  // Validation: store_name start with letter, country required
  const validate = () => {
    const temp = {};
    if (!form.store_name || !/^[A-Za-z]/.test(form.store_name)) {
      temp.store_name = "Store name must start with a letter";
    }
    if (!form.country || !form.country.label) {
      temp.country = "Country is required";
    }
    // basic phone check (allow empty but if present ensure length >= 7 digits ignoring symbols)
    if (form.whatsapp_number) {
      const digits = form.whatsapp_number.replace(/\D/g, "");
      if (digits.length < 7) temp.whatsapp_number = "Enter a valid phone number";
    }
    if (form.store_description && form.store_description.length > 800) {
      temp.store_description = "Store description cannot exceed 800 characters";
    }
    return temp;
  };

  // Submit - keep logic identical to original but adapt country field to send text
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // unchanged: include user_id
      formData.append("user_id", user.id);

      // Append fields; send country as text (country.label) per your request
      if (form.store_name) formData.append("store_name", form.store_name);
      if (form.store_description) formData.append("store_description", form.store_description);
      if (form.whatsapp_number) formData.append("whatsapp_number", form.whatsapp_number);
      if (form.country && form.country.label) formData.append("country", form.country.label);
      if (form.logo) formData.append("logo", form.logo);

      const res = await axios.post(`${API_URL}/supplier/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        showNotification("Supplier profile created successfully!", "success");
        setSupplier(res.data.supplierProfile);
        setUser((prev) => ({ ...prev, role: "both", supplierProfile: res.data.supplierProfile }));
      } else {
        showNotification(res.data.message || "Failed to create supplier", "error");
      }
    } catch (err) {
      showNotification(err.response?.data?.message || "Error creating supplier profile", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ height: "70vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  // UI / Design improvements only below
  return (
    <Box sx={{ px: 2, py: 6, display: "flex", justifyContent: "center" }}>
      <Paper
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: 760,
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        }}
      >
        <Box sx={{ display: "flex", gap: 0 }}>
          {/* Left column: info */}
          <Box
            sx={{
              flex: "0 0 320px",
              background: `linear-gradient(180deg, ${ACCENT}14, transparent)`,
              px: 4,
              py: 5,
              display: { xs: "none", md: "block" }, // hide on small screens
              borderRight: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 1 }}>Create Supplier Profile</Typography>
            <Typography color="text.secondary" sx={{ mb: 2, lineHeight: 1.45 }}>
              Add your store details so buyers can find you. Your store name and country are required.
            </Typography>

            <Box sx={{ mt: 3, display: "flex", gap: 2, alignItems: "center" }}>
              <Avatar sx={{ bgcolor: ACCENT, color: "#000", width: 44, height: 44 }}>S</Avatar>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>Start Selling</Typography>
                <Typography variant="body2" color="text.secondary">Setup takes only a few minutes.</Typography>
              </Box>
            </Box>
          </Box>

          {/* Right column: form */}
          <Box sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
            {/* Heading (mobile friendly) */}
            <Box sx={{ display: { xs: "block", md: "none" }, mb: 2 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 700 }}>Create Supplier Profile</Typography>
              <Typography color="text.secondary" sx={{ mb: 1 }}>Add store details to start selling.</Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="Store Name"
                name="store_name"
                value={form.store_name}
                onChange={(e) => {
                  handleChange(e);
                }}
                margin="normal"
                required
                error={!!errors.store_name}
                helperText={errors.store_name || "Start with a letter"}
              />

              <TextField
  fullWidth
  multiline
  rows={3}
  label="Store Description (optional)"
  name="store_description"
  value={form.store_description}
  onChange={(e) => {
    if (e.target.value.length <= 800) handleChange(e);
  }}
  margin="normal"
  error={!!errors.store_description}
  helperText={errors.store_description || `${form.store_description.length}/800`}
  inputProps={{ maxLength: 800 }}
/>


              {/* Phone input with flags */}
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ mb: 0.5, color: "text.secondary" }}>
                  WhatsApp Number (optional)
                </Typography>
                <PhoneInput
                  country={form.country?.code?.toLowerCase() || "pk"}
                  value={form.whatsapp_number ? form.whatsapp_number.replace(/^\+?/, "") : ""}
                  onChange={(val, country) => handlePhoneChange(val, country)}
                  inputProps={{
                    name: "whatsapp_number",
                    autoFocus: false,
                  }}
                  containerStyle={{ width: "100%" }}
                  inputStyle={{
                    width: "100%",
                    height: 46,
                    borderRadius: 6,
                    background: "#FAFAFA",
                    fontSize: 14,
                    paddingLeft: 52,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                  buttonStyle={{
                    borderRadius: 6,
                    border: "none",
                    background: "transparent",
                  }}
                  dropdownStyle={{ borderRadius: 6 }}
                />
                {errors.whatsapp_number && (
                  <Typography color="error" variant="caption" sx={{ display: "block", mt: 0.6 }}>
                    {errors.whatsapp_number}
                  </Typography>
                )}
              </Box>

              {/* Country Autocomplete with flags */}
              <Box sx={{ mt: 2 }}>
                <Autocomplete
                  options={COUNTRIES}
                  getOptionLabel={(option) => `${getFlagEmoji(option.code)} ${option.label}`}
                  value={form.country}
                  onChange={handleCountrySelect}
                  isOptionEqualToValue={(opt, val) => opt.code === val.code}
                  renderOption={(props, option) => (
                    <Box component="li" sx={{ display: "flex", alignItems: "center", gap: 1 }} {...props}>
                      <span style={{ fontSize: 18 }}>{getFlagEmoji(option.code)}</span>
                      <span>{option.label}</span>
                      <Typography color="text.secondary" sx={{ ml: 1, fontSize: 12 }}>+{option.dial_code}</Typography>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Country"
                      required
                      error={!!errors.country}
                      helperText={errors.country}
                    />
                  )}
                  sx={{
                    "& .MuiInputBase-root": {
                      borderRadius: 1,
                      background: "#FAFAFA",
                    },
                  }}
                  clearOnEscape
                  freeSolo={false}
                />
              </Box>

              {/* Logo upload */}
              <Button
                variant="outlined"
                component="label"
                sx={{ mt: 3, textTransform: "none", borderRadius: 1 }}
              >
                Upload Logo (optional)
                <input type="file" accept="image/*" hidden onChange={handleLogoChange} />
              </Button>

              {form.logo && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Selected: {form.logo.name}
                </Typography>
              )}

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{
                  mt: 3,
                  mb: 1,
                  backgroundColor: ACCENT,
                  color: "#000",
                  fontWeight: 700,
                  textTransform: "none",
                  height: 48,
                  borderRadius: 1,
                  "&:hover": { backgroundColor: "#bf9f2e" },
                }}
              >
                {submitting ? "Creating..." : "Create Supplier Profile"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
