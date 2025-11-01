// src/components/Header.jsx
import { useNavigate, Link } from "react-router-dom";
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
  InputBase,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MenuIcon from "@mui/icons-material/Menu";
import EmailIcon from "@mui/icons-material/Email";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useAuth } from "../context/AuthContext";
import logo from "/logo_final.png";
import whatsappIcon from "/whatsapp.png";
import { useEffect } from "react";

// ✅ Search bar styling
const SearchBox = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  backgroundColor: "white",
  padding: "4px 10px",
  borderRadius: "4px",
  flex: 1,
  maxWidth: "350px",
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

export default function Header() {
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [catAnchor, setCatAnchor] = useState(null);
  const [userAnchor, setUserAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const categories = [
    "Electronics",
    "Fashion",
    "Home&Kitchen",
    "Health&Beauty",
    "Sports",
  ];

  const handleSearch = () => {
    if (searchText.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchText.trim())}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };
  useEffect(() => {
    // clear search input after navigating away
    setSearchText("");
  }, [location.pathname]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* ✅ Top Bar (hidden on mobile) */}
      {!isMobile && (
        <Box
          sx={{
            backgroundColor: "#D3AF37",
            color: "#1A1A1A",
            display: "flex",
            justifyContent: "space-between",
            px: 7,
            py: 0.5,
            fontSize: "12px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <img src={whatsappIcon} alt="WhatsApp" style={{ width: 18 }} />
            +92 333 8051097
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EmailIcon fontSize="small" />
            contact.storensupply@gmail.com
          </Box>
        </Box>
      )}

      {/* ✅ Main Navbar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{ backgroundColor: "#1A1A1A", py: 2, px: 4 }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* ✅ Left side: Logo & Search */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 6, flexGrow: 1 }}>
            <img
              src={logo}
              alt="Logo"
              style={{ height: "35px", cursor: "pointer" }}
              onClick={() => navigate("/")}
            />

            {/* ✅ Search (hidden on mobile) */}
            <SearchBox>
              <InputBase
                placeholder="Search products..."
                sx={{ flex: 1, maxWidth: "350px" }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <SearchIcon sx={{ cursor: "pointer" }} onClick={handleSearch} />
            </SearchBox>
          </Box>

          {/* ✅ Right Side */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
            {/* ✅ Mobile Menu Button */}
            {isMobile ? (
              <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: "white", mt: 1, }}>
                <MenuIcon sx={{ fontSize: 35 }} />
              </IconButton>
            ) : (
              <>
                {/* ✅ Categories dropdown (desktop only) */}
                <Button
                  sx={{
                    color: "white",
                    fontWeight: 500,
                    textTransform: "none",
                    fontSize: "17px",
                    "&:hover": { backgroundColor: "transparent" },
                  }}
                  endIcon={<ArrowDropDownIcon />}
                  onClick={(e) => setCatAnchor(e.currentTarget)}
                >
                  categories
                </Button>

                <Menu
                  anchorEl={catAnchor}
                  open={Boolean(catAnchor)}
                  onClose={() => setCatAnchor(null)}
                >
                  {categories.map((cat) => (
                    <MenuItem
                      key={cat}
                      onClick={() => {
                        setCatAnchor(null);
                        navigate(`/shop?category=${encodeURIComponent(cat)}`);
                      }}
                    >
                      {cat}
                    </MenuItem>
                  ))}
                </Menu>

                {/* ✅ Switch to Supplier */}
                {user && (
                  <Button
                    sx={{
                      color: "white",
                      fontWeight: 500,
                      textTransform: "none",
                      fontSize: "17px",
                      textDecoration: "underline",
                      textUnderlineOffset: "8px",
                      textDecorationColor: "white",
                      "&:hover": {
                        textDecorationColor: "#D4AF37",
                        color: "#D4AF37",
                      },
                    }}
                    onClick={() => navigate("/supplier-profile")}
                  >
                    switch to supplier
                  </Button>
                )}

                {/* ✅ Auth Buttons */}
                {!user ? (
                  <IconButton onClick={() => navigate("/login")}>
                    <PersonOutlineIcon
                      alt="Login/Signup"
                      sx={{ width: 29, height: 29, color: "white" }}
                    />
                  </IconButton>
                ) : (
                  <>
                    <Button
                      onClick={(e) => setUserAnchor(e.currentTarget)}
                      endIcon={<AccountCircle />}
                      sx={{
                        fontWeight: 600,
                        fontSize: "17px",
                        textTransform: "none",
                        color: "#D4AF37",
                        "& .MuiButton-endIcon svg": { fontSize: "32px" },
                      }}
                    >
                      hi, {user.username}
                    </Button>

                    <Menu
                      anchorEl={userAnchor}
                      open={Boolean(userAnchor)}
                      onClose={() => setUserAnchor(null)}
                    >
                      <MenuItem
                        component={Link}
                        to="/seller"
                        onClick={() => setUserAnchor(null)}
                      >
                        Profile
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setUserAnchor(null);
                          logout();
                        }}
                      >
                        Logout
                      </MenuItem>
                    </Menu>
                  </>
                )}
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* ✅ Mobile Drawer Menu */}
      {/* ✅ Mobile Drawer Menu */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250, p: 2 }}>
          {/* ✅ Search inside Drawer (Now fully functional) */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              border: "1px solid #ccc",
              borderRadius: "4px",
              px: 1,
            }}
          >
            <InputBase
              placeholder="Search..."
              sx={{ flex: 1 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && searchText.trim()) {
                  navigate(`/shop?search=${encodeURIComponent(searchText.trim())}`);
                  setDrawerOpen(false);
                }
              }}
            />
            <IconButton
              onClick={() => {
                if (searchText.trim()) {
                  navigate(`/shop?search=${encodeURIComponent(searchText.trim())}`);
                  setDrawerOpen(false);
                }
              }}
            >
              <SearchIcon />
            </IconButton>
          </Box>

          {/* ✅ Category Links */}
          <List>
            {categories.map((cat) => (
              <ListItemButton
                key={cat}
                onClick={() => {
                  setDrawerOpen(false);
                  navigate(`/shop?category=${encodeURIComponent(cat)}`);
                }}
              >
                <ListItemText primary={cat.replace("&", " & ")} />
              </ListItemButton>
            ))}

            <Divider sx={{ my: 1 }} />

            {/* ✅ Additional Links */}
            <ListItemButton
              onClick={() => {
                setDrawerOpen(false);
                navigate("/about-us");
              }}
            >
              <ListItemText primary="About Us" />
            </ListItemButton>
            <ListItemButton
              onClick={() => {
                setDrawerOpen(false);
                navigate("/features");
              }}
            >
              <ListItemText primary="Features" />
            </ListItemButton>
            <ListItemButton
              onClick={() => {
                setDrawerOpen(false);
                navigate("/plans");
              }}
            >
              <ListItemText primary="Plans" />
            </ListItemButton>
            <ListItemButton
              onClick={() => {
                setDrawerOpen(false);
                navigate("/contact-us");
              }}
            >
              <ListItemText primary="Contact Us" />
            </ListItemButton>

            <Divider sx={{ my: 1 }} />

            {/* ✅ Authentication Section */}
            {!user ? (
              <ListItemButton
                onClick={() => {
                  setDrawerOpen(false);
                  navigate("/login");
                }}
              >
                <PersonOutlineIcon sx={{ width: 25, height: 25, mr: 1 }} />
                <ListItemText primary="Login / Signup" />
              </ListItemButton>
            ) : (
              <>
                <ListItemButton
                  onClick={() => {
                    setDrawerOpen(false);
                    navigate("/supplier-profile");
                  }}
                >
                  <ListItemText primary="Switch to Supplier" />
                </ListItemButton>
                <ListItemButton
                  onClick={() => {
                    setDrawerOpen(false);
                    navigate("/seller");
                  }}
                >
                  <ListItemText primary="Profile" />
                </ListItemButton>
                <ListItemButton
                  onClick={() => {
                    setDrawerOpen(false);
                    logout();
                  }}
                >
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </>
            )}
          </List>
        </Box>
      </Drawer>

    </Box>
  );
}
