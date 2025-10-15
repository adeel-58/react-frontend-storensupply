// src/components/Header.jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  IconButton,
  LinearProgress,
} from "@mui/material";
import { Link } from "react-router-dom";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout, loading } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate(); // ✅ Ensure this exists

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ flexGrow: 1, textDecoration: "none", color: "inherit" }}
          >
            My E-Commerce App
          </Typography>

          {/* ✅ New Button */}
          {user && (
            <Button
              color="inherit"
              sx={{ mr: 2 }}
              onClick={() => navigate("/supplier-profile")}
            >
              Switch to Supplier
            </Button>
          )}

          {/* ✅ Auth section */}
          {loading ? (
            <Typography sx={{ mr: 2, opacity: 0.7 }}>Loading...</Typography>
          ) : !user ? (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/signup">
                Signup
              </Button>
            </>
          ) : (
            <>
              <Typography sx={{ mr: 1 }}>Hi, {user.username}</Typography>
              <IconButton size="large" color="inherit" onClick={handleMenu}>
                <AccountCircle />
              </IconButton>
              <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                {user.sellerProfile && (
                  <MenuItem disabled>
                    Credits: {user.sellerProfile.credits ?? 0}
                  </MenuItem>
                )}
                <MenuItem component={Link} to="/seller" onClick={handleClose}>
                  Profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleClose();
                    logout();
                  }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>

        {loading && <LinearProgress color="secondary" />}
      </AppBar>
    </Box>
  );
}
