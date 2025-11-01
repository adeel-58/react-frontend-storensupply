// src/pages/Login.jsx
import { useState, useMemo } from "react";
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
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";

const API_URL = import.meta.env.VITE_API_URL;
const ACCENT = "#D4AF37";

export default function Login() {
  const { login } = useAuth();
  const { showNotification } = useNotification();

  const [mode, setMode] = useState("login"); // 'login' | 'forgot'
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // -------- Validators --------
  const validators = {
    email: (val) => {
      if (!val || val.trim() === "") return "Email is required.";
      if (!/^[^\s@]+@(gmail\.com|hotmail\.com)$/.test(val))
        return "Email must be @gmail.com or @hotmail.com.";
      return "";
    },
    password: (val) => {
      if (!val || val.trim() === "") return "Password is required.";
      return "";
    },
  };

  const isFormValid = useMemo(() => {
    return form.email.trim() !== "" && form.password.trim() !== "";
  }, [form]);

  const isEmailValid = useMemo(() => {
    return form.email.trim() !== "" && !validators.email(form.email);
  }, [form.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // -------- FORGOT PASSWORD --------
      if (mode === "forgot") {
        if (!form.email) {
          setErrors({ email: "Email is required." });
          setLoading(false);
          return;
        }
        await axios.post(`${API_URL}/auth/forgot-password`, {
          email: form.email,
        });
        showNotification(
          "Password reset link sent to your email.",
          "success"
        );
        setMode("login");
        setForm({ email: "", password: "" });
        setErrors({});
        setLoading(false);
        return;
      }

      // -------- LOGIN --------
      const emailError = validators.email(form.email);
      const passwordError = validators.password(form.password);

      if (emailError || passwordError) {
        setErrors({
          ...(emailError ? { email: emailError } : {}),
          ...(passwordError ? { password: passwordError } : {}),
        });
        setLoading(false);
        return;
      }

      const res = await axios.post(`${API_URL}/auth/login`, form);
      login(res.data);
      window.scrollTo(0, 0);
      showNotification("Welcome back!", "success");
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
        {mode === "login" ? "Sign In" : "Reset Password"}
      </Typography>

      {/* -------- LOGIN MODE -------- */}
      {mode === "login" && (
        <Box component="form" onSubmit={handleSubmit}>
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
            sx={{
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
              },
            }}
          />
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            margin="normal"
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
            sx={{
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
              },
            }}
          />

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
            disabled={loading || !isFormValid}
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

          <Typography textAlign="center" sx={{ mt: 2, color: "#444" }}>
            Don't have an account?{" "}
            <Link
              to="/signup"
              style={{ color: ACCENT, textDecoration: "none", fontWeight: 500 }}
            >
              Sign Up
            </Link>
          </Typography>
        </Box>
      )}

      {/* -------- FORGOT PASSWORD MODE -------- */}
      {mode === "forgot" && (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            name="email"
            label="Enter your email"
            fullWidth
            margin="normal"
            value={form.email}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, email: e.target.value }));
              setErrors((prev) => ({ ...prev, email: "" }));
            }}
            required
            error={Boolean(errors.email)}
            helperText={errors.email}
            sx={{
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
              },
            }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading || !isEmailValid}
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
    </Paper>
  );
}