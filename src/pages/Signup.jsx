import { useState } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Paper,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function Signup() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "seller",
    whatsapp_number: "",
  });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const { showNotification } = useNotification();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/signup`, form);
      signup(res.data); // ✅ Automatically shows toast + redirects (via AuthContext)
    } catch (err) {
      console.error(err);
      showNotification(
        err.response?.data?.message || "Signup failed. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ maxWidth: 400, mx: "auto", p: 4, mt: 6 }}>
      <Typography variant="h5" textAlign="center" gutterBottom>
        Signup
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Username"
          name="username"
          value={form.username}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Email"
          type="email"
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
        <TextField
          fullWidth
          label="WhatsApp Number"
          name="whatsapp_number"
          value={form.whatsapp_number}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          select
          fullWidth
          label="Role"
          name="role"
          value={form.role}
          onChange={handleChange}
          margin="normal"
        >
          <MenuItem value="seller">Seller</MenuItem>
          <MenuItem value="supplier">Supplier</MenuItem>
          <MenuItem value="both">Both</MenuItem>
        </TextField>
        <Button
          fullWidth
          type="submit"
          variant="contained"
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? "Signing up..." : "Signup"}
        </Button>
      </Box>
    </Paper>
  );
}
