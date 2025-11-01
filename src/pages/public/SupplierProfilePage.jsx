// src/pages/public/SupplierProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Paper,
  Avatar,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Rating,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Verified,
  LocationOn,
  Phone,
  CalendarToday,
  Search,
  WhatsApp,
  Star,
  Visibility,
  Category as CategoryIcon,
  ArrowBack,
} from "@mui/icons-material";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const IMAGE_BASE_URL = "https://storensupply.com";

export default function SupplierProfilePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const { supplierId } = useParams();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    fetchSupplierProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierId]);

  useEffect(() => {
    filterProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory, sortBy, products]);

  const fetchSupplierProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch supplier profile and products
      const { data } = await axios.get(`${API_URL}/supplier-profile/${supplierId}`);

      if (data.success) {
        setSupplier(data.supplier);
        setProducts(data.products);
        setFilteredProducts(data.products);

        // Extract categories
        const cats = [...new Set(data.products.map(p => p.category).filter(Boolean))];
        setCategories(cats);
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError(err.response?.data?.message || "Failed to load supplier profile");
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Sorting
    switch (sortBy) {
      case "price_low":
        filtered.sort((a, b) => a.supplier_sold_price - b.supplier_sold_price);
        break;
      case "price_high":
        filtered.sort((a, b) => b.supplier_sold_price - a.supplier_sold_price);
        break;
      case "popular":
        filtered.sort((a, b) => b.views_count - a.views_count);
        break;
      case "recent":
      default:
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleContactSupplier = () => {
  if (supplier?.whatsapp_number) {
    const message = `Hi ${supplier.store_name}, I'm interested in your products!`;
    const cleanNumber = supplier.whatsapp_number.replace(/\D/g, ""); // remove +, spaces, dashes
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  } else {
    alert("Supplier WhatsApp number not available");
  }
};


  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate("/")}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: "#ffffffff", minHeight: "100vh", py: 0, px: 0 }}>
      <Container maxWidth="100%">

        {/* Header Section */}
        <Box width="100%">
          <Paper
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: isMobile ? "center" : "flex-start",
              flexDirection: isMobile ? "column" : "row",
              px: isMobile ? 2 : 8,
              pt: isMobile ? 3 : 8,
              mb: isMobile ? 3 : 4,
              gap: isMobile ? 2 : 4,
              boxShadow: "none",
              borderRadius: 0,
              width: "100%",
              position: "relative",
            }}
          >
            {/* Logo */}
            <Avatar
              src={supplier?.logo ? IMAGE_BASE_URL + supplier.logo : "/default-store.png"}
              alt={supplier?.store_name}
              sx={{
                width: isMobile ? 120 : 180,
                height: isMobile ? 140 : 200,
                borderRadius: 2,
                flexShrink: 0,
              }}
              variant="rounded"
            />

            {/* Store Info */}
            <Box sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              textAlign: isMobile ? "center" : "left",
            }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1, justifyContent: isMobile ? "center" : "flex-start" }}>
                <Typography variant="h4" fontWeight="bold" sx={{ fontSize: isMobile ? "20px" : "inherit" }}>
                  {supplier?.store_name}
                </Typography>
              </Stack>

              <Typography
                color="text.secondary"
                sx={{
                  mb: 2,
                  lineHeight: 1.6,
                  width: isMobile ? "100%" : "60%",
                  fontSize: isMobile ? "14px" : "16px",
                  color: "black"
                }}
              >
                {supplier?.store_description || "Welcome to our store!"}
              </Typography>

              <Stack direction={isMobile ? "column" : "row"} spacing={isMobile ? 1.5 : 5} flexWrap="wrap" sx={{ mb: 3, color: "black", gap: isMobile ? 1 : 5 }}>
                {supplier?.country && (
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ justifyContent: isMobile ? "center" : "flex-start" }}>
                    <LocationOn fontSize={isMobile ? "small" : "small"} color="action" />
                    <Typography variant="body2" color="#000000" fontSize={isMobile ? "14px" : "16px"}>
                      {supplier.country}
                    </Typography>
                  </Stack>
                )}
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ justifyContent: isMobile ? "center" : "flex-start" }}>
                  <CalendarToday fontSize={isMobile ? "small" : "small"} color="action" />
                  <Typography variant="body2" fontSize={isMobile ? "14px" : "16px"}>
                    Member since {new Date(supplier?.member_since).toLocaleDateString()}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ justifyContent: isMobile ? "center" : "flex-start" }}>
                  <CategoryIcon fontSize={isMobile ? "small" : "small"} color="action" />
                  <Typography variant="body2" fontSize={isMobile ? "14px" : "16px"}>
                    {supplier?.total_products} Products
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            {/* Contact Button */}
            <Box sx={{
              display: "flex",
              justifyContent: isMobile ? "center" : "flex-end",
              width: isMobile ? "100%" : "auto",
            }}>
              <Button
                variant="contained"
                startIcon={isMobile ? undefined : <WhatsApp />}
                onClick={handleContactSupplier}
                disabled={!supplier?.whatsapp_number}
                sx={{
                  color: "#000",
                  fontWeight: "bold",
                  width: isMobile ? "100%" : 200,
                  height: isMobile ? 40 : 45,
                  mt: isMobile ? 0 : 1,
                  fontSize: isMobile ? "12px" : "14px",
                  "&:hover": {
                    bgcolor: "#D4AF37",
                  },
                }}
              >
                {isMobile ? "Contact" : "Contact Supplier"}
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* Filters Section */}
        <Box width="100%">
          <Card sx={{
            boxShadow: "none",
            borderRadius: 0,
            px: isMobile ? 2 : 6,
            pt: isMobile ? 2 : 2,
          }}>
            <CardContent sx={{ p: isMobile ? 1 : 2 }}>
              <Grid container spacing={isMobile ? 1.5 : 5} alignItems="center">
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size={isMobile ? "small" : "medium"}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search fontSize={isMobile ? "small" : "medium"} />
                        </InputAdornment>
                      ),
                      sx: {
                        height: isMobile ? 35 : 40,
                        fontSize: isMobile ? "14px" : "17px"
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    select
                    fullWidth
                    label="Category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    SelectProps={{ native: true }}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      "& .MuiInputBase-root": {
                        height: isMobile ? 35 : 40,
                        fontSize: isMobile ? "8px" : "17px"
                      },
                      "& label": {
                        fontSize: isMobile ? "12px" : "17px",
                        top: isMobile ? "-3px" : "-5px"
                      }
                    }}
                    inputProps={{
                      style: { fontSize: isMobile ? "12px" : "17px" }
                    }}
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Sort By"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    SelectProps={{ native: true }}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      "& .MuiInputBase-root": {
                        height: isMobile ? 35 : 40,
                        fontSize: isMobile ? "8px" : "17px"
                      },
                      "& label": {
                        fontSize: isMobile ? "12px" : "17px",
                        top: isMobile ? "-3px" : "-5px"
                      }
                    }}
                    inputProps={{
                      style: { fontSize: isMobile ? "12px" : "17px" }
                    }}
                  >
                    <option value="recent">Most Recent</option>
                    <option value="popular">Most Popular</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                  </TextField>
                </Grid>
              </Grid>

              <Typography variant="body2" color="text.secondary" mt={2} sx={{ fontSize: isMobile ? "12px" : "inherit" }}>
                Showing {filteredProducts.length} of {products.length} products
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card sx={{ p: isMobile ? 3 : 5, textAlign: "center", boxShadow: "none" }}>
            <Typography variant="h6" color="text.secondary" sx={{ fontSize: isMobile ? "16px" : "inherit" }}>
              No products found
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={isMobile ? 1.5 : 3} sx={{ px: isMobile ? 2 : 7, pb: 8 }}>
            {filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  {/* Product Card */}
                  <Card
                    sx={{
                      width: isMobile ? "100%" : 270,
                      height: isMobile ? 320 : 400,
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: "none",
                      border: "1px solid #e0e0e0",
                      cursor: "pointer",
                      overflow: "hidden",
                      position: "relative",
                      transition: "transform 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                      },
                    }}
                    onClick={() => navigate(`/supplier/${supplierId}/product/${product.id}`)}
                  >
                    {/* Stock Sticker - Top Right */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        backgroundColor: "#1e1e1e",
                        color: "white",
                        padding: isMobile ? "4px 12px" : "6px 20px",
                        borderTopLeftRadius: isMobile ? "10px" : "15px",
                        borderBottomLeftRadius: isMobile ? "10px" : "15px",
                        fontSize: isMobile ? "12px" : "15px",
                        fontWeight: "bold",
                        zIndex: 1,
                      }}
                    >
                      Stock: {product.stock_quantity}
                    </Box>

                    <CardMedia
                      component="img"
                      height={isMobile ? 180 : 250}
                      image={product.main_image ? IMAGE_BASE_URL + product.main_image : "/placeholder-product.png"}
                      alt={product.title}
                      sx={{
                        objectFit: "contain",
                        backgroundColor: "#f5f5f5",
                        p: 1,
                      }}
                    />

                    <CardContent sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      p: isMobile ? 1 : 2,
                    }}>
                      {/* Title */}
                      <Typography
                        sx={{
                          fontSize: isMobile ? "14px" : "17px",
                          fontWeight: "bold",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          minHeight: isMobile ? "36px" : "48px",
                        }}
                        gutterBottom
                        title={product.title}
                      >
                        {product.title}
                      </Typography>

                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mt="auto"
                      >
                        <Typography variant="h5" color="primary" fontWeight="bold" sx={{ fontSize: isMobile ? "16px" : "inherit" }}>
                          ${Number(product.supplier_sold_price || 0).toFixed(2)}
                        </Typography>
                        {product.category && (
                          <Chip
                            label={product.category}
                            size={isMobile ? "small" : "small"}
                            color="default"
                            sx={{ fontSize: isMobile ? "11px" : "inherit" }}
                          />
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

      </Container>
    </Box>
  );
}