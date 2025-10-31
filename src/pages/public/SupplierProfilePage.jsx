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
      const url = `https://wa.me/${supplier.whatsapp_number}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
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


        <Box width="100%">
          <Paper
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              px: 8,
              pt: 8,
              mb: 4,
              gap: 4,
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
                width: 180,
                height: 200,
                borderRadius: 2,
                flexShrink: 0,
              }}
              variant="rounded"
            />

            {/* Store Info */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Typography variant="h4" fontWeight="bold">
                  {supplier?.store_name}
                </Typography>
              </Stack>

              <Typography
                color="text.secondary"
                sx={{ mb: 2, lineHeight: 1.6, width: "60%", fontSize: "16px", color: "black" }}
              >
                {supplier?.store_description || "Welcome to our store!"}
              </Typography>

              <Stack direction="row" spacing={5} flexWrap="wrap" sx={{ mb: 3, color: "black" }}>
                {supplier?.country && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2" color="#000000" fontSize={16}>
                      {supplier.country}
                    </Typography>
                  </Stack>
                )}
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="body2" fontSize={16}>
                    Member since {new Date(supplier?.member_since).toLocaleDateString()}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <CategoryIcon fontSize="small" color="action" />
                  <Typography variant="body2" fontSize={16}>
                    {supplier?.total_products} Products
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            {/* ✅ Contact Button on Top Right */}
            <Box>
              <Button
                variant="contained"
                startIcon={<WhatsApp />}
                onClick={handleContactSupplier}
                disabled={!supplier?.whatsapp_number}
                sx={{
                  color: "#000",
                  fontWeight: "bold",
                  width: 200,
                  height: 45,
                  mt: 1,
                  "&:hover": {
                    bgcolor: "#D4AF37",
                  },
                }}
              >
                Contact Supplier
              </Button>
            </Box>
          </Paper>
        </Box>




        <Box width="100%">
          <Card sx={{ boxShadow: "none", borderRadius: 0, px: 6, pt: 2 }}>
            <CardContent>
              <Grid container spacing={5} alignItems="center">
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                      sx: { height: 40, fontSize: "17px" } // reduce height + font
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
                    sx={{
                      "& .MuiInputBase-root": { height: 40, fontSize: "17px" },
                      "& label": { fontSize: "17px", top: "-5px" }
                    }}
                    inputProps={{
                      style: { fontSize: "17px" }
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
                    sx={{
                      "& .MuiInputBase-root": { height: 40, fontSize: "17px" },
                      "& label": { fontSize: "17px", top: "-5px" }
                    }}
                    inputProps={{
                      style: { fontSize: "17px" }
                    }}
                  >
                    <option value="recent">Most Recent</option>
                    <option value="popular">Most Popular</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                  </TextField>
                </Grid>
              </Grid>

              <Typography variant="body2" color="text.secondary" mt={2}>
                Showing {filteredProducts.length} of {products.length} products
              </Typography>
            </CardContent>
          </Card>
        </Box>


        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card sx={{ p: 5, textAlign: "center", boxShadow: "none" }}>
            <Typography variant="h6" color="text.secondary">
              No products found
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={3} sx={{ px: 7, pb: 8 }}>
            {filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  {/* ✅ Fixed Card Size */}
                  <Card
                    sx={{
                      width: 270,
                      height: 400,
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: "none",
                      border: "1px solid #e0e0e0",
                      cursor: "pointer",
                      overflow: "hidden",
                      position: "relative", // needed for absolute sticker
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
                        padding: "6px 20px",
                        borderTopLeftRadius: "15px",
                        borderBottomLeftRadius: "15px",
                        fontSize: "15px",
                        fontWeight: "bold",
                      }}
                    >
                      Stock: {product.stock_quantity}
                    </Box>

                    <CardMedia
                      component="img"
                      height="250"
                      image={product.main_image ? IMAGE_BASE_URL + product.main_image : "/placeholder-product.png"}
                      alt={product.title}
                      sx={{
                        objectFit: "contain",
                        backgroundColor: "#f5f5f5",
                        p: 1,
                      }}
                    />

                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* ✅ Title: font 17px + 2 lines max */}
                      <Typography
                        sx={{
                          fontSize: "17px",
                          fontWeight: "bold",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          minHeight: "48px",
                        }}
                        gutterBottom
                        title={product.title}
                      >
                        {product.title}
                      </Typography>

                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="h5" color="primary" fontWeight="bold">
                          ${Number(product.supplier_sold_price || 0).toFixed(2)}
                        </Typography>
                        {product.category && (
                          <Chip label={product.category} size="small" color="default" />
                        )}
                      </Stack>

                      {/* Removed stock from here since it's now displayed as sticker */}
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