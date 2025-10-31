// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  CardActions,
  Alert,
} from "@mui/material";

const API_URL = import.meta.env.VITE_API_URL;

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        newPassword: password,
      });
      setMessage(res.data.message || "Password reset successful!");
      setTimeout(() => navigate("/"), 2000); // Redirect to login after 2 seconds
    } catch (err) {
      setError(err.response?.data?.message || "Error resetting password");
    }
  };

  return (
    <Box
      sx={{
        py:6,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#f5f5f5",
      }}
    >
      <Card sx={{ maxWidth: 400, width: "100%", boxShadow: 3, p: 2 }}>
        <CardContent>
          <Typography variant="h5" textAlign="center" gutterBottom>
            Reset Your Password
          </Typography>

          <Typography variant="body2" color="textSecondary" textAlign="center" sx={{ mb: 3 }}>
            Enter your new password below.
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 1.5 }}
            />
            <Typography
              variant="caption"
              color="textSecondary"
              display="block"
              textAlign="left"
              sx={{ mb: 2 }}
            >
              Password must be at least 8 characters, contain upper & lower case letters,
              a number, and a special character.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

            <CardActions>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                sx={{ py: 1.2, fontWeight: "bold" }}
              >
                Reset Password
              </Button>
            </CardActions>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
