import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";

export default function SellerProfile() {
  const { user, setUser } = useAuth();

  const [location, setLocation] = useState(user?.sellerProfile?.location || "");
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp_number || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });
  const [loading, setLoading] = useState(false); // ✅ for loader overlay

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // ✅ Common loading handler
  const showLoader = (state) => setLoading(state);

  // ✅ Update Location
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
        setSnackbar({ open: true, message: "Location updated successfully", type: "success" });

        const updatedUser = {
          ...user,
          sellerProfile: { ...user.sellerProfile, location },
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // ✅ Clear field after success
        setLocation("");
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.message, type: "error" });
    } finally {
      showLoader(false);
    }
  };

  // ✅ Update WhatsApp number
  const handleWhatsappUpdate = async () => {
    if (!whatsapp.trim()) {
      setSnackbar({ open: true, message: "Please enter a valid WhatsApp number", type: "error" });
      return;
    }

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
        setSnackbar({ open: true, message: "WhatsApp number updated successfully", type: "success" });

        const updatedUser = { ...user, whatsapp_number: whatsapp };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // ✅ Clear field after success
        setWhatsapp("");
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.message, type: "error" });
    } finally {
      showLoader(false);
    }
  };

  // ✅ Change Password
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
        setSnackbar({ open: true, message: "Password changed successfully", type: "success" });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        throw new Error(data.message);
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
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 6, p: 2 }}>
      <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Seller Profile
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">Username:</Typography>
              <Typography>{user.username}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">Email:</Typography>
              <Typography>{user.email}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">Contact (WhatsApp):</Typography>
              <Typography>{user.whatsapp_number || "Not Provided"}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">Credits:</Typography>
              <Typography>{user.sellerProfile.credits}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">Location:</Typography>
              <Typography>{user.sellerProfile.location}</Typography>
            </Grid>

            {/* ✅ Update WhatsApp Number */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                WhatsApp Number
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Enter your WhatsApp number"
              />
              <Button
                variant="contained"
                sx={{ mt: 1 }}
                onClick={handleWhatsappUpdate}
                disabled={loading}
              >
                Update WhatsApp
              </Button>
            </Grid>

            {/* ✅ Update Location */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Location
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter your location"
              />
              <Button
                variant="contained"
                sx={{ mt: 1 }}
                onClick={handleLocationUpdate}
                disabled={loading}
              >
                Update Location
              </Button>
            </Grid>

            {/* ✅ Change Password Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>

              <TextField
                fullWidth
                label="Old Password"
                type="password"
                margin="dense"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <TextField
                fullWidth
                label="New Password"
                type="password"
                margin="dense"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                margin="dense"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button
                variant="contained"
                color="secondary"
                sx={{ mt: 1 }}
                onClick={handlePasswordChange}
                disabled={loading}
              >
                Change Password
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ✅ Snackbar */}
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

      {/* ✅ Centered Loader Overlay */}
      <Backdrop
        open={loading}
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: "column",
        }}
      >
        <CircularProgress color="inherit" />
        <Typography sx={{ mt: 2 }}>Searching...</Typography>
      </Backdrop>
    </Box>
  );
}
