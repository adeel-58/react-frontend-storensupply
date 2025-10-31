// src/components/AuthModal.jsx
import React, { useState, useMemo } from "react";
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
  borderRadius: 2,         // slight radius for a modern look (keeps overall visual)
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

  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    username: "",
    email: "",
    password: "",
    whatsapp_number: "+92", // default value shown in input
    _phoneDialCode: "92",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (setter) => (e) =>
    setter((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Validation functions
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
      if (!val || val.trim() === "" || val === `+${dialCode}`) return "WhatsApp number is required.";
      const digits = val.replace(/\D/g, "");
      // dialCode digits + 10 national digits (minimum)
      const requiredMin = (dialCode || "92").length + 10;
      if (digits.length < requiredMin)
        return "Enter full number including country code and at least 10 digits of the national number.";
      return "";
    },
  };

  // Derived form validity
  const isSignupValid = useMemo(() => {
    const uErr = validators.username(signupForm.username);
    const eErr = validators.email(signupForm.email);
    const pErr = validators.password(signupForm.password);
    const wErr = validators.whatsapp_number(signupForm.whatsapp_number, signupForm._phoneDialCode);
    return !(uErr || eErr || pErr || wErr);
  }, [signupForm]);

  const isLoginValid = useMemo(() => {
    return loginForm.email.trim() !== "" && loginForm.password.trim() !== "";
  }, [loginForm]);

  const clearFieldError = (field) =>
    setErrors((prev) => ({ ...prev, [field]: "" }));

  // Phone input change handler
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
      } else {
        // Signup validation
        const uErr = validators.username(signupForm.username);
        const eErr = validators.email(signupForm.email);
        const pErr = validators.password(signupForm.password);
        const wErr = validators.whatsapp_number(signupForm.whatsapp_number, signupForm._phoneDialCode);

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

        // Check email existence endpoint (POST /auth/check-email)
        try {
          const checkRes = await axios.post(`${API_URL}/auth/check-email`, { email: signupForm.email });
          if (checkRes?.data?.exists) {
            setErrors({ email: "This email is already registered. Try logging in." });
            setLoading(false);
            return;
          }
        } catch (err) {
          // If endpoint not present (404) or network issue, continue to signup and rely on signup endpoint
          if (err.response && err.response.status !== 404) {
            console.warn("check-email returned non-404 error; continuing to signup", err.response?.data || err);
          }
        }

        // Call signup endpoint
        try {
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
        } catch (signupErr) {
          const serverMsg = signupErr.response?.data || {};
          if (serverMsg.errors && typeof serverMsg.errors === "object") {
            setErrors((prev) => ({ ...prev, ...serverMsg.errors }));
          } else if (serverMsg.message) {
            if (/email/i.test(serverMsg.message)) {
              setErrors({ email: serverMsg.message });
            } else if (/username/i.test(serverMsg.message)) {
              setErrors({ username: serverMsg.message });
            } else {
              showNotification(serverMsg.message, "error");
            }
          } else {
            showNotification("Signup failed. Please try again.", "error");
          }
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error(err);
      showNotification(err.response?.data?.message || "Authentication failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={Boolean(open)}
      // prevent Esc & backdrop click to force auth (we ignore onClose reason)
      disableEscapeKeyDown
      onClose={() => { }}
      // top-centered container
      sx={{
        "& .MuiDialog-container": {
          alignItems: "flex-start",
        },
      }}
      BackdropProps={{ sx: { backgroundColor: "rgba(0,0,0,0.48)" } }}
      PaperProps={{
        sx: {
          mt: 6,                 // push slightly down from very top (top-centered)
          maxHeight: "90vh",     // ensures whole modal can scroll inside viewport
          overflowY: "auto",     // scroll the dialog content when tall
          background: "transparent",
          boxShadow: "none",
          borderRadius: 0,
          overflowX: "hidden",
          scrollbarWidth: "none", // Firefox
          "&::-webkit-scrollbar": { display: "none" }, // Chrome, Safari
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
            {mode === "login" ? "Sign In" : "Create Account"}
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            {mode === "signup" && (
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
                helperText={errors.username || "Start with a letter, minimum 5 characters"}
              />
            )}

            <TextField
              name="email"
              label="Email"
              fullWidth
              margin="normal"
              value={mode === "login" ? loginForm.email : signupForm.email}
              onChange={(e) => {
                if (mode === "login") {
                  setLoginForm((prev) => ({ ...prev, email: e.target.value }));
                } else {
                  setSignupForm((prev) => ({ ...prev, email: e.target.value }));
                }
                clearFieldError("email");
              }}
              sx={textFieldSX}
              required
              error={Boolean(errors.email)}
              helperText={errors.email || (mode === "signup" ? "Only @gmail.com or @hotmail.com allowed" : "")}
            />

            <TextField
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              value={mode === "login" ? loginForm.password : signupForm.password}
              onChange={(e) => {
                if (mode === "login") {
                  setLoginForm((prev) => ({ ...prev, password: e.target.value }));
                } else {
                  setSignupForm((prev) => ({ ...prev, password: e.target.value }));
                }
                clearFieldError("password");
              }}
              sx={textFieldSX}
              required
              error={Boolean(errors.password)}
              helperText={errors.password || (mode === "signup" ? "8+ chars, 1 uppercase, 1 number, 1 special char" : "")}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? "Hide password" : "Show password"}
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

            {mode === "signup" && (
              <Box sx={{ mt: 1 }}>
                <PhoneInput
                  country={"pk"}
                  value={signupForm.whatsapp_number || ""}
                  onChange={(value, country) => handlePhoneChange(value, country)}
                  inputProps={{
                    name: "whatsapp_number",
                    required: true,
                    autoFocus: false,
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
                  <Typography color="error" variant="caption" sx={{ display: "block", mt: 0.6 }}>
                    {errors.whatsapp_number}
                  </Typography>
                )}
              </Box>
            )}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading || (mode === "signup" ? !isSignupValid : !isLoginValid)}
              sx={{
                mt: 2,
                backgroundColor: ACCENT,
                color: "#000",
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
                boxShadow: "none",
                "&:hover": { backgroundColor: "#bf9f2e" },
                height: 48,
              }}
            >
              {loading ? "Processing..." : mode === "login" ? "LOGIN" : "SIGNUP"}
            </Button>

            <Typography sx={{ textAlign: "center", mt: 2, color: "#444" }}>
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <Button
                onClick={() => {
                  setMode((m) => (m === "login" ? "signup" : "login"));
                  setErrors({});
                }}
                sx={{ color: ACCENT, textTransform: "none", borderRadius: 0 }}
              >
                {mode === "login" ? "Sign up" : "Login"}
              </Button>
            </Typography>
          </Box>
        </Card>
      </Box>
    </Dialog>
  );
}
