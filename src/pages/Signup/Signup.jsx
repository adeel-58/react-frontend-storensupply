// src/pages/Signup.jsx
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";

const API_URL = import.meta.env.VITE_API_URL;
const ACCENT = "#D4AF37";

export default function Signup() {
  const { signup } = useAuth();
  const { showNotification } = useNotification();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    whatsapp_number: "+92",
    _phoneDialCode: "92",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // -------- Validators (same as in AuthModal) --------
  const validators = {
    username: (val) => {
      if (!val || val.trim() === "") return "Username is required.";
      if (!/^[A-Za-z][A-Za-z0-9_]{4,}$/.test(val))
        return "Must start with a letter and be at least 5 characters.";
      return "";
    },
    email: (val) => {
      if (!val || val.trim() === "") return "Email is required.";
      if (!/^[^\s@]+@(gmail\.com|hotmail\.com)$/.test(val))
        return "Email must be @gmail.com or @hotmail.com.";
      return "";
    },
    password: (val) => {
      if (!val || val.trim() === "") return "Password is required.";
      if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/.test(val))
        return "Password must be 8+ chars, include 1 uppercase, 1 number, 1 special char.";
      return "";
    },
    whatsapp_number: (val, dialCode = "92") => {
      if (!val || val.trim() === "" || val === `+${dialCode}`)
        return "WhatsApp number is required.";
      const digits = val.replace(/\D/g, "");
      const requiredMin = (dialCode || "92").length + 10;
      if (digits.length < requiredMin)
        return "Enter full number including country code and at least 10 digits.";
      return "";
    },
  };

  const isSignupValid = useMemo(() => {
    const uErr = validators.username(form.username);
    const eErr = validators.email(form.email);
    const pErr = validators.password(form.password);
    const wErr = validators.whatsapp_number(
      form.whatsapp_number,
      form._phoneDialCode
    );
    return !(uErr || eErr || pErr || wErr);
  }, [form]);

  const handlePhoneChange = (value, country) => {
    const normalized = value.startsWith("+") ? value : `+${value}`;
    setForm((prev) => ({
      ...prev,
      whatsapp_number: normalized,
      _phoneDialCode: country?.dialCode || prev._phoneDialCode || "92",
    }));
    setErrors((prev) => ({ ...prev, whatsapp_number: "" }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const uErr = validators.username(form.username);
    const eErr = validators.email(form.email);
    const pErr = validators.password(form.password);
    const wErr = validators.whatsapp_number(
      form.whatsapp_number,
      form._phoneDialCode
    );

    const newErrors = {
      ...(uErr ? { username: uErr } : {}),
      ...(eErr ? { email: eErr } : {}),
      ...(pErr ? { password: pErr } : {}),
      ...(wErr ? { whatsapp_number: wErr } : {}),
    };

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      // check if email already exists
      const checkRes = await axios.post(`${API_URL}/auth/check-email`, {
        email: form.email,
      });
      if (checkRes?.data?.exists) {
        setErrors({
          email: "This email is already registered. Try logging in.",
        });
        setLoading(false);
        return;
      }
    } catch (err) {
      if (err.response && err.response.status !== 404) {
        console.warn("check-email error", err.response?.data || err);
      }
    }

    try {
      const res = await axios.post(`${API_URL}/auth/signup`, {
        username: form.username,
        email: form.email,
        password: form.password,
        whatsapp_number: form.whatsapp_number,
        role: "both",
      });
      signup(res.data);
      window.scrollTo(0, 0);
      showNotification("Account created — welcome!", "success");
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
    <Paper
      sx={{
        maxWidth: 420,
        mx: "auto",
        p: 4,
        mt: 6,
        mb:6,
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        border: "1px solid #e6e6e6",
        borderRadius: 2,
      }}
    >
      <Typography variant="h5" textAlign="center" fontWeight={700} gutterBottom>
        Create Account
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
          error={Boolean(errors.username)}
          helperText={
            errors.username || "Start with a letter, minimum 5 characters"
          }
        />

        <TextField
          fullWidth
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          margin="normal"
          required
          error={Boolean(errors.email)}
          helperText={errors.email || "Only @gmail.com or @hotmail.com allowed"}
        />

        <TextField
          fullWidth
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={handleChange}
          margin="normal"
          required
          error={Boolean(errors.password)}
          helperText={
            errors.password ||
            "8+ chars, 1 uppercase, 1 number, 1 special char"
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((s) => !s)}
                  edge="end"
                  size="large"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ mt: 1 }}>
          <PhoneInput
            country={"pk"}
            value={form.whatsapp_number || ""}
            onChange={handlePhoneChange}
            inputProps={{
              name: "whatsapp_number",
              required: true,
            }}
            containerStyle={{ width: "100%" }}
            inputStyle={{
              width: "100%",
              height: 48,
              borderRadius: 2,
              background: "#FAFAFA",
              fontSize: 14,
              paddingLeft: 52,
              border: "1px solid #DCDCDC",
            }}
            buttonStyle={{
              borderRadius: 2,
              border: "none",
              background: "transparent",
            }}
            dropdownStyle={{ borderRadius: 2 }}
          />
          {errors.whatsapp_number && (
            <Typography
              color="error"
              variant="caption"
              sx={{ display: "block", mt: 0.6 }}
            >
              {errors.whatsapp_number}
            </Typography>
          )}
        </Box>

        <Button
          fullWidth
          type="submit"
          variant="contained"
          disabled={loading || !isSignupValid}
          sx={{
            mt: 2,
            backgroundColor: ACCENT,
            color: "#000",
            fontWeight: 700,
            borderRadius: 2,
            "&:hover": { backgroundColor: "#bf9f2e" },
            height: 48,
          }}
        >
          {loading ? "Processing..." : "SIGN UP"}
        </Button>

        <Typography textAlign="center" sx={{ mt: 2, color: "#444" }}>
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: ACCENT, textDecoration: "none", fontWeight: 500 }}
          >
            Login
          </Link>
        </Typography>
      </Box>
    </Paper>
  );
}
