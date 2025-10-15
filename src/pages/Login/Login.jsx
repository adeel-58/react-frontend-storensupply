// src/pages/Login.jsx
import { useState } from "react";
import axios from "axios";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showNotification } = useNotification();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, form);
      login(res.data);
    } catch (err) {
      console.error(err);
      showNotification(
        err.response?.data?.message || "Login failed. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ maxWidth: 400, mx: "auto", p: 4, mt: 6 }}>
      <Typography variant="h5" textAlign="center" gutterBottom>
        Login
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          margin="normal"
          required
        />
        <Button
          fullWidth
          type="submit"
          variant="contained"
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
      </Box>
    </Paper>
  );
}
