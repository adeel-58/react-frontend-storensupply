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
  useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import loginSignupIcon from "/login_signup.png";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import MenuIcon from "@mui/icons-material/Menu";
//import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import whatsappIcon from "/whatsapp.png";
import EmailIcon from "@mui/icons-material/Email";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useAuth } from "../context/AuthContext";
import logo from "/logo_final.png";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
// Search bar styling
const SearchBox = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  backgroundColor: "white",
  padding: "4px 10px",
  borderRadius: "4px",
  flex: 1,                   // ✅ allow it to grow
  maxWidth: "350px",
  //border: "1px solid #ccc",
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

export default function Header() {

  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchText.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchText.trim())}`);
    }
  };

  // Optional: handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };
  const { user, logout } = useAuth();
  const [catAnchor, setCatAnchor] = useState(null);
  const [userAnchor, setUserAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  //const navigate = useNavigate();

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* ✅ Top Bar (DISABLED ON MOBILE) */}
      {!isMobile && (
        <Box
          sx={{
            backgroundColor: "#D3AF37",
            color: "#ffffffff",
            display: "flex",
            justifyContent: "space-between",
            px: 7,
            py: 0.5,
            fontSize: "12px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#1A1A1A" }}>
            <img src={whatsappIcon} alt="WhatsApp" style={{ width: 18 }} />
            +92 333 8051097
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#1A1A1A" }}>
            <EmailIcon fontSize="small" />
            contact.storensupply@gmail.com
          </Box>
        </Box>
      )}

      {/* ✅ Main Navbar */}
      <AppBar position="static" elevation={0} sx={{ backgroundColor: "#1A1A1A", color: "black", py: 2, px: 4 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 6, flexGrow: 1 }}>
            <img
              src={logo}
              alt="Logo"
              style={{ height: "35px", cursor: "pointer" }}
              onClick={() => navigate("/")}
            />

            {/* ✅ Search Bar moved here */}
            <SearchBox>
              <InputBase
                placeholder="Search products..."
                sx={{ flex: 1, maxWidth: "350px" }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={handleKeyPress} // Enter key triggers search
              />
              <SearchIcon sx={{ cursor: "pointer" }} onClick={handleSearch} />
            </SearchBox>
          </Box>
          {/* ✅ Right Side */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
            {/* ✅ Mobile Menu Button (Right) */}
            {isMobile ? (
              <IconButton onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
            ) : (
              <>
                {/* Categories */}
                {/* Categories */}
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
                  {["Electronics", "Fashion", "Home&Kitchen", "Health&Beauty", "Sports"].map((cat) => (
                    <MenuItem
                      key={cat}
                      onClick={() => {
                        setCatAnchor(null); // close menu
                        navigate(`/shop?category=${encodeURIComponent(cat)}`);
                      }}
                    >
                      {cat}
                    </MenuItem>
                  ))}
                </Menu>


                {/* Switch to Supplier */}
                {user && (
                  <Button
                    sx={{
                      color: "white", fontWeight: 500, textTransform: "none", fontSize: "17px", textDecoration: "underline", textUnderlineOffset: "8px", backgroundColor: "transparent", textDecorationColor: "white",// no hover background
                      "&:hover": {
                        backgroundColor: "transparent", // prevent yellow highlight
                        // underline turns gold
                        textDecoration: "underline",
                        textDecorationColor: "#D4AF37",
                        color: "#D4AF37"
                      }
                    }}
                    onClick={() => navigate("/supplier-profile")}
                  >
                    switch to supplier
                  </Button>
                )}

                {/* Authentication */}
                {!user ? (
                  <IconButton onClick={() => navigate("/login")}>
                   
                    <PersonOutlineIcon alt="Login/Signup" sx={{ width: 29, height: 29, color: "white" }} />
                  </IconButton>
                ) : (
                  <>
                    <Button onClick={(e) => setUserAnchor(e.currentTarget)} endIcon={<AccountCircle />} sx={{
                      fontWeight: 600,
                      fontSize: "17px",
                      textTransform: "none",
                      color: "#D4AF37",
                      fontFamily: "open-sans, Arial, sans-serif",
                      "& .MuiButton-endIcon": {
                        marginLeft: "8px",
                        "& svg": {
                          fontSize: "32px !important", // ✅ force icon size
                        },
                      },
                      "&:hover": {
                        backgroundColor: "transparent"
                      }
                    }}>
                      hi, {user.username}
                    </Button>
                    <Menu
                      anchorEl={userAnchor}
                      open={Boolean(userAnchor)}
                      onClose={() => setUserAnchor(null)}
                    >
                      {/*<MenuItem disabled>Credits: {user.sellerProfile?.credits || 0}</MenuItem>*/}
                      {/*<Divider />*/}
                      <MenuItem
                        component={Link}
                        to="/seller"
                        onClick={() => setUserAnchor(null)} // ✅ close menu
                      >
                        Profile
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setUserAnchor(null); // close menu
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

      {/* ✅ Drawer for Mobile */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250, p: 2 }}>
          {/* ✅ Search inside Drawer */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2, border: "1px solid #ccc", borderRadius: "4px", px: 1 }}>
            <InputBase placeholder="Search..." sx={{ flex: 1 }} />
            <SearchIcon />
          </Box>

          <List>
            <ListItemButton>Electronics</ListItemButton>
            <ListItemButton>Fashion</ListItemButton>
            <ListItemButton>Home & Kitchen</ListItemButton>
            <ListItemButton>Beauty</ListItemButton>
            <ListItemButton>Sports</ListItemButton>
            <Divider />
            {!user ? (
              <>
                <ListItemButton onClick={() => navigate("/login")}>
                 <PersonOutlineIcon alt="Login/Signup" sx={{ width: 29, height: 29, color: "black" }} />
                  <span style={{ marginLeft: 10 }}>Login / Signup</span>
                </ListItemButton>
              </>
            ) : (
              <>
                <ListItemButton onClick={() => navigate("/supplier-profile")}>
                  Switch to Supplier
                </ListItemButton>
                <ListItemButton onClick={() => navigate("/seller")}>Profile</ListItemButton>
                <ListItemButton onClick={logout}>Logout</ListItemButton>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}
