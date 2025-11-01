import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  Backdrop,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useAuth } from "../../context/AuthContext";
import { InputAdornment } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";


export default function SellerProfile() {
  const { user, setUser } = useAuth();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [location, setLocation] = useState(user?.sellerProfile?.location || "");
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp_number || "");
  const [editingWhatsapp, setEditingWhatsapp] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });
  const [loading, setLoading] = useState(false);

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });
  const showLoader = (state) => setLoading(state);

  // Update WhatsApp
  const handleWhatsappUpdate = async () => {
    if (!whatsapp.trim()) return;
    showLoader(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/seller/update-whatsapp`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ whatsapp_number: whatsapp }),
      });
      const data = await res.json();
      if (data.success) {
        const updatedUser = { ...user, whatsapp_number: whatsapp };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setEditingWhatsapp(false);
        setSnackbar({ open: true, message: "WhatsApp updated", type: "success" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.message, type: "error" });
    } finally {
      showLoader(false);
    }
  };

  // Update Location
  const handleLocationUpdate = async () => {
    showLoader(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/seller/update-location`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ location }),
      });
      const data = await res.json();
      if (data.success) {
        const updatedUser = {
          ...user,
          sellerProfile: { ...user.sellerProfile, location },
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setEditingLocation(false);
        setSnackbar({ open: true, message: "Location updated", type: "success" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.message, type: "error" });
    } finally {
      showLoader(false);
    }
  };

  // Change Password
  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setSnackbar({ open: true, message: "Passwords do not match", type: "error" });
      return;
    }
    showLoader(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/seller/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setSnackbar({ open: true, message: "Password changed", type: "success" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.message, type: "error" });
    } finally {
      showLoader(false);
    }
  };

  if (!user || !user.sellerProfile)
    return <Typography variant="h6" align="center" sx={{ mt: 4 }}>Loading profile...</Typography>;

  return (
    <Box
      sx={{
        pb: 10,
        width:"100%",
        minHeight: "100vh",
        mb: 0,
        mx: { xs: 0, sm: 3, md: 0 }, // mobile horizontal margin
        pt: { xs: 4, sm: 6, md: 8 }, // mobile top padding
        px: { xs: 2, sm: 3, md: 39 }, // mobile horizontal padding
        bgcolor: "#fff",
        borderRadius: 0,
        boxShadow: 0,
      }}
    >
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontSize: { xs: "24px", sm: "28px", md: "35px" }, // responsive heading
          fontWeight: "600",
        }}
      >
        Seller Profile
      </Typography>

      <Box sx={{ mt: 5, mb: 1 }}>
        <Grid container spacing={{ xs: 4, md: 20 }}>
          {/* Left Column: Name & Email */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: { xs: "14px", md: "17px" },
                  fontWeight: "500",
                }}
              >
                Name:
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "16px", md: "18px" },
                  fontWeight: "600",
                  color: "#D4AF37",
                }}
              >
                {user.username}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: { xs: "14px", md: "17px" },
                  fontWeight: "500",
                }}
              >
                Email:
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "16px", md: "18px" },
                  fontWeight: "600",
                  color: "#D4AF37",
                }}
              >
                {user.email}
              </Typography>
            </Box>
          </Grid>

          {/* Right Column: WhatsApp & Location */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: { xs: "14px", md: "17px" },
                  fontWeight: "500",
                }}
              >
                Contact (WhatsApp):
              </Typography>
              {editingWhatsapp ? (
                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1, mt: 0.5 }}>
                  <TextField
                    size="small"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    fullWidth
                  />
                  <Button size="small" variant="contained" onClick={handleWhatsappUpdate}>
                    Save
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => setEditingWhatsapp(false)}>
                    Cancel
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
                  <Typography
                    sx={{
                      fontSize: { xs: "16px", md: "18px" },
                      fontWeight: "600",
                      color: "#D4AF37",
                    }}
                  >
                    {user.whatsapp_number || "Not Provided"}
                  </Typography>
                  <IconButton size="small" onClick={() => setEditingWhatsapp(true)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: { xs: "14px", md: "17px" },
                  fontWeight: "500",
                }}
              >
                Location:
              </Typography>
              {editingLocation ? (
                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1, mt: 0.5 }}>
                  <TextField
                    size="small"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    fullWidth
                  />
                  <Button size="small" variant="contained" onClick={handleLocationUpdate}>
                    Save
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => setEditingLocation(false)}>
                    Cancel
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
                  <Typography
                    sx={{
                      fontSize: { xs: "16px", md: "18px" },
                      fontWeight: "600",
                      color: "#D4AF37",
                    }}
                  >
                    {user.sellerProfile.location || "Not Provided"}
                  </Typography>
                  <IconButton size="small" onClick={() => setEditingLocation(true)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Change Password */}
      <Typography
        variant="h6"
        gutterBottom
        sx={{ fontSize: { xs: "15px", md: "17px" }, mt: 3 }}
      >
        Change Password
      </Typography>

      {/* Password Fields */}
      {[
        { label: "Old Password", value: oldPassword, setValue: setOldPassword, show: showOldPassword, setShow: setShowOldPassword },
        { label: "New Password", value: newPassword, setValue: setNewPassword, show: showNewPassword, setShow: setShowNewPassword },
        { label: "Confirm New Password", value: confirmPassword, setValue: setConfirmPassword, show: showConfirmPassword, setShow: setShowConfirmPassword }
      ].map((field, idx) => (
        <TextField
          key={idx}
          fullWidth
          label={field.label}
          type={field.show ? "text" : "password"}
          margin="dense"
          value={field.value}
          onChange={(e) => field.setValue(e.target.value)}
          InputProps={{
            sx: { height: 40, fontSize: { xs: "14px", md: 17 }, top: 7 },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => field.setShow(!field.show)}
                >
                  {field.show ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      ))}

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 4, width: { xs: "100%", sm: "auto" } }}
        onClick={handlePasswordChange}
        disabled={loading}
      >
        Change Password
      </Button>

      {/* Snackbar & Loader */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.type} onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Backdrop
        open={loading}
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: "column",
        }}
      >
        <CircularProgress color="inherit" />
        <Typography sx={{ mt: 2 }}>Processing...</Typography>
      </Backdrop>
    </Box>

  );
}
