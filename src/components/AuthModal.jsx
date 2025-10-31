// src/components/AuthModal.jsx
import React, { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";

import axios from "axios";
import {
  Box,
  Button,
  Dialog,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

const API_URL = import.meta.env.VITE_API_URL;
const ACCENT = "#D4AF37";

const Card = styled("div")(({ theme }) => ({
  background: "#FFFFFF",
  padding: theme.spacing(3),
  width: 420,
  maxWidth: "94%",
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  border: "1px solid #e6e6e6",
  borderRadius: 2,
  color: "#000",
}));

const textFieldSX = {
  mb: 1,
  "& .MuiOutlinedInput-root": {
    height: 48,
    fontSize: "14px",
    borderRadius: 2,
    background: "#FAFAFA",
    "& fieldset": {
      borderColor: "#DCDCDC",
    },
    "&:hover fieldset": {
      borderColor: ACCENT,
    },
    "&.Mui-focused fieldset": {
      borderColor: ACCENT,
      boxShadow: `0 0 0 4px ${ACCENT}22`,
    },
    "& input": {
      padding: "10px 12px",
      fontSize: "14px",
    },
  },
  "& .MuiInputLabel-root": {
    fontSize: "14px",
    color: "#666",
  },
  "& .MuiFormHelperText-root": {
    fontSize: "13px",
  },
};

export default function AuthModal({ open }) {
  const { login, signup } = useAuth();
  const { showNotification } = useNotification();
  const location = useLocation();
  if (location.pathname === "/reset-password") return null;

  const [mode, setMode] = useState("login"); // 'login' | 'signup' | 'forgot'
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    username: "",
    email: "",
    password: "",
    whatsapp_number: "+92",
    _phoneDialCode: "92",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (setter) => (e) =>
    setter((prev) => ({ ...prev, [e.target.name]: e.target.value }));

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
        return "Enter full number including country code and at least 10 digits of the national number.";
      return "";
    },
  };

  const isSignupValid = useMemo(() => {
    const uErr = validators.username(signupForm.username);
    const eErr = validators.email(signupForm.email);
    const pErr = validators.password(signupForm.password);
    const wErr = validators.whatsapp_number(
      signupForm.whatsapp_number,
      signupForm._phoneDialCode
    );
    return !(uErr || eErr || pErr || wErr);
  }, [signupForm]);

  const isLoginValid = useMemo(() => {
    return loginForm.email.trim() !== "" && loginForm.password.trim() !== "";
  }, [loginForm]);

  const clearFieldError = (field) =>
    setErrors((prev) => ({ ...prev, [field]: "" }));

  const handlePhoneChange = (value, country) => {
    const normalized = value.startsWith("+") ? value : `+${value}`;
    setSignupForm((prev) => ({
      ...prev,
      whatsapp_number: normalized,
      _phoneDialCode: country?.dialCode || prev._phoneDialCode || "92",
    }));
    clearFieldError("whatsapp_number");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // ---------------- FORGOT PASSWORD ----------------
      if (mode === "forgot") {
        if (!loginForm.email) {
          setErrors({ email: "Email is required." });
          setLoading(false);
          return;
        }
        await axios.post(`${API_URL}/auth/forgot-password`, {
          email: loginForm.email,
        });
        showNotification(
          "Password reset link sent to your email.",
          "success"
        );
        setMode("login");
        setLoading(false);
        return;
      }

      // ---------------- LOGIN ----------------
      if (mode === "login") {
        if (!isLoginValid) {
          setErrors({
            email: loginForm.email ? "" : "Email is required.",
            password: loginForm.password ? "" : "Password is required.",
          });
          setLoading(false);
          return;
        }
        const res = await axios.post(`${API_URL}/auth/login`, loginForm);
        login(res.data);
        showNotification("Welcome back!", "success");
      }
      // ---------------- SIGNUP ----------------
      else {
        const uErr = validators.username(signupForm.username);
        const eErr = validators.email(signupForm.email);
        const pErr = validators.password(signupForm.password);
        const wErr = validators.whatsapp_number(
          signupForm.whatsapp_number,
          signupForm._phoneDialCode
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
          const checkRes = await axios.post(`${API_URL}/auth/check-email`, {
            email: signupForm.email,
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

        const payload = {
          username: signupForm.username,
          email: signupForm.email,
          password: signupForm.password,
          whatsapp_number: signupForm.whatsapp_number,
          role: "both",
        };

        const res = await axios.post(`${API_URL}/auth/signup`, payload);
        signup(res.data);
        showNotification("Account created — welcome!", "success");
      }
    } catch (err) {
      console.error(err);
      showNotification(
        err.response?.data?.message || "Authentication failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };



  return (
    <Dialog
      open={Boolean(open)}
      disableEscapeKeyDown
      onClose={() => { }}
      sx={{
        "& .MuiDialog-container": {
          alignItems: "flex-start",
        },
      }}
      BackdropProps={{
        sx: { backgroundColor: "rgba(0,0,0,0.48)" },
      }}
      PaperProps={{
        sx: {
          mt: 6,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "transparent",
          boxShadow: "none",
          borderRadius: 0,
          overflowX: "hidden",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        },
      }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          px: 2,
          pointerEvents: "auto",
          pb: 3,
        }}
      >
        <Card>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {mode === "login"
              ? "Sign In"
              : mode === "signup"
                ? "Create Account"
                : "Reset Password"}
          </Typography>

          {/* ---------- LOGIN ---------- */}
          {mode === "login" && (
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                name="email"
                label="Email"
                fullWidth
                margin="normal"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm((prev) => ({ ...prev, email: e.target.value }))
                }
                sx={textFieldSX}
                required
                error={Boolean(errors.email)}
                helperText={errors.email}
              />

              <TextField
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                margin="normal"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                sx={textFieldSX}
                required
                error={Boolean(errors.password)}
                helperText={errors.password}
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

              {/* Forgot Password Button */}
              <Typography sx={{ textAlign: "right", mt: 1 }}>
                <Button
                  onClick={() => {
                    setMode("forgot");
                    setErrors({});
                  }}
                  sx={{
                    textTransform: "none",
                    color: ACCENT,
                    fontSize: "14px",
                  }}
                >
                  Forgot Password?
                </Button>
              </Typography>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading || !isLoginValid}
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
                {loading ? "Processing..." : "LOGIN"}
              </Button>

              <Typography sx={{ textAlign: "center", mt: 2, color: "#444" }}>
                Don't have an account?{" "}
                <Button
                  onClick={() => {
                    setMode("signup");
                    setErrors({});
                  }}
                  sx={{ color: ACCENT, textTransform: "none", borderRadius: 0 }}
                >
                  Sign up
                </Button>
              </Typography>
            </Box>
          )}

          {/* ---------- SIGNUP ---------- */}
          {mode === "signup" && (
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                name="username"
                label="Username"
                fullWidth
                margin="normal"
                value={signupForm.username}
                onChange={(e) => {
                  handleChange(setSignupForm)(e);
                  clearFieldError("username");
                }}
                sx={textFieldSX}
                required
                error={Boolean(errors.username)}
                helperText={
                  errors.username || "Start with a letter, minimum 5 characters"
                }
              />

              <TextField
                name="email"
                label="Email"
                fullWidth
                margin="normal"
                value={signupForm.email}
                onChange={(e) => {
                  setSignupForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }));
                  clearFieldError("email");
                }}
                sx={textFieldSX}
                required
                error={Boolean(errors.email)}
                helperText={
                  errors.email ||
                  "Only @gmail.com or @hotmail.com allowed"
                }
              />

              <TextField
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                margin="normal"
                value={signupForm.password}
                onChange={(e) => {
                  setSignupForm((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }));
                  clearFieldError("password");
                }}
                sx={textFieldSX}
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
                  value={signupForm.whatsapp_number || ""}
                  onChange={(value, country) => handlePhoneChange(value, country)}
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
                {loading ? "Processing..." : "SIGNUP"}
              </Button>

              <Typography sx={{ textAlign: "center", mt: 2, color: "#444" }}>
                Already have an account?{" "}
                <Button
                  onClick={() => {
                    setMode("login");
                    setErrors({});
                  }}
                  sx={{ color: ACCENT, textTransform: "none", borderRadius: 0 }}
                >
                  Login
                </Button>
              </Typography>
            </Box>
          )}

          {/* ---------- FORGOT PASSWORD ---------- */}
          {mode === "forgot" && (
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                name="email"
                label="Enter your email"
                fullWidth
                margin="normal"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm((prev) => ({ ...prev, email: e.target.value }))
                }
                sx={textFieldSX}
                required
                error={Boolean(errors.email)}
                helperText={errors.email}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading || !loginForm.email}
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
                {loading ? "Processing..." : "Send Reset Link"}
              </Button>

              <Typography sx={{ textAlign: "center", mt: 2 }}>
                <Button
                  onClick={() => {
                    setMode("login");
                    setErrors({});
                  }}
                  sx={{ textTransform: "none", color: ACCENT }}
                >
                  Back to Login
                </Button>
              </Typography>
            </Box>
          )}
        </Card>
      </Box>
    </Dialog>
  );
}
