// src/pages/public/ProductDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Rating,
  Divider,
  IconButton,
  ImageList,
  ImageListItem,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Verified,
  LocationOn,
  WhatsApp,
  ArrowBack,
  Inventory,
  Visibility,
  Category as CategoryIcon,
  Link as LinkIcon,
  Store,
} from "@mui/icons-material";
import { motion } from "framer-motion";

const IMAGE_BASE_URL = "https://storensupply.com";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ProductDetailPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const { supplierId, productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProductDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const fetchProductDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.get(
        `${API_URL}/supplier-profile/${supplierId}/product/${productId}`
      );

      if (data.success) {
        setProduct(data.product);
        setImages(data.images || []);
        setReviews(data.reviews || []);
        setSelectedImage(data.product.main_image);
      }
    } catch (err) {
      console.error("Product fetch error:", err);
      setError(err.response?.data?.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleContactSupplier = () => {
  if (product?.store?.whatsapp) {
    const message = `Hi ${product.store.name}, I'm interested in: ${product.title}`;
    // Remove any non-digit characters from the WhatsApp number
    const cleanNumber = product.store.whatsapp.replace(/\D/g, "");
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
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: "#ffffffff", minHeight: "100vh", py: isMobile ? 2 : 4 }}>
      <Container maxWidth="lg">
        <Container maxWidth="lg" sx={{ px: isMobile ? 2 : 4, mt: isMobile ? 2 : 8 }}>
          <Grid
            container
            spacing={isMobile ? 2 : 4}
            justifyContent="center"
            alignItems="flex-start"
          >
            {/* Left Side - Product Images */}
            <Grid item xs={12} md={6.5} sx={{ mt: isMobile ? 0 : 4 }}>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Box
                  sx={{
                    width: "100%",
                    height: isMobile ? 300 : 470,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#fff",
                    borderRadius: 2,
                    overflow: "hidden",
                    p: 0,
                    border: "1px solid #eee",
                  }}
                >
                  <Box
                    component="img"
                    src={
                      selectedImage
                        ? IMAGE_BASE_URL + selectedImage
                        : product?.main_image
                          ? IMAGE_BASE_URL + product.main_image
                          : "/placeholder-product.png"
                    }
                    alt={product?.title}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </Box>
              </motion.div>
            </Grid>

            {/* Right Side - Product Info */}
            <Grid item xs={12} md={6.5} sx={{ width: isMobile ? "100%" : "60%" }}>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Card sx={{ boxShadow: "none", p: 0 }}>
                  <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                    {/* Title + Price Row */}
                    <Stack
                      direction={isMobile ? "column" : "row"}
                      justifyContent="space-between"
                      alignItems={isMobile ? "flex-start" : "center"}
                      spacing={isMobile ? 1 : 0}
                    >
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        sx={{
                          maxWidth: isMobile ? "100%" : "70%",
                          wordBreak: "break-word",
                          whiteSpace: "normal",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          fontSize: isMobile ? "18px" : "20px",
                        }}
                      >
                        {product?.title}
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        sx={{
                          fontSize: isMobile ? "20px" : "25px",
                          flexShrink: 0,
                        }}
                      >
                        ${Number(product?.price || 0).toFixed(2)}
                      </Typography>
                    </Stack>

                    {/* Category & Stock */}
                    <Typography
                      sx={{
                        mt: 1,
                        fontSize: isMobile ? "14px" : "16px",
                        color: "gray",
                      }}
                    >
                      {product?.category} &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; Stock:{" "}
                      {product?.stock_quantity}
                    </Typography>

                    <Divider
                      sx={{
                        my: isMobile ? 1.5 : 2,
                        width: "80px",
                        borderWidth: "2px",
                        borderColor: "#C7A22C",
                      }}
                    />

                    {/* Product details */}
                    <Typography
                      sx={{
                        mt: isMobile ? 4 : 8,
                        fontWeight: "bold",
                        fontSize: isMobile ? "18px" : "23px",
                      }}
                    >
                      Product details
                    </Typography>

                    <Box sx={{ mt: isMobile ? 1.5 : 2 }}>
                      <Stack spacing={isMobile ? 0.8 : 1}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            bgcolor: "#F5F5F5",
                            p: isMobile ? 0.8 : 1,
                            borderRadius: 1,
                            fontSize: isMobile ? "13px" : "inherit",
                          }}
                        >
                          <Typography sx={{ fontSize: isMobile ? "13px" : "inherit" }}>
                            Country:
                          </Typography>
                          <Typography sx={{ fontSize: isMobile ? "13px" : "inherit" }}>
                            {product?.country || "-"}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            bgcolor: "#F5F5F5",
                            p: isMobile ? 0.8 : 1,
                            borderRadius: 1,
                            fontSize: isMobile ? "13px" : "inherit",
                          }}
                        >
                          <Typography sx={{ fontSize: isMobile ? "13px" : "inherit" }}>
                            Condition:
                          </Typography>
                          <Typography sx={{ fontSize: isMobile ? "13px" : "inherit" }}>
                            New
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            bgcolor: "#F5F5F5",
                            p: isMobile ? 0.8 : 1,
                            borderRadius: 1,
                            fontSize: isMobile ? "13px" : "inherit",
                          }}
                        >
                          <Typography sx={{ fontSize: isMobile ? "13px" : "inherit" }}>
                            Availability:
                          </Typography>
                          <Typography
                            sx={{
                              color: product?.stock_quantity > 0 ? "green" : "red",
                              fontSize: isMobile ? "13px" : "inherit",
                            }}
                          >
                            {product?.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                          </Typography>
                        </Box>

                        {product?.ebay_link && (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              bgcolor: "#F5F5F5",
                              p: isMobile ? 0.8 : 1,
                              borderRadius: 1,
                              flexWrap: isMobile ? "wrap" : "nowrap",
                              gap: isMobile ? 1 : 0,
                            }}
                          >
                            <Typography sx={{ fontSize: isMobile ? "13px" : "inherit" }}>
                              eBay link:
                            </Typography>
                            <a
                              href={
                                product.ebay_link.startsWith("http://") ||
                                  product.ebay_link.startsWith("https://")
                                  ? product.ebay_link
                                  : `https://${product.ebay_link}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "#C7A22C",
                                textDecoration: "none",
                                fontWeight: "500",
                                fontSize: isMobile ? "12px" : "inherit",
                                wordBreak: "break-all",
                              }}
                            >
                              VIEW ON EBAY
                            </a>
                          </Box>
                        )}
                      </Stack>
                    </Box>

                    {/* Contact Supplier Button */}
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={isMobile ? undefined : <WhatsApp />}
                      onClick={handleContactSupplier}
                      sx={{
                        mt: isMobile ? 2 : 3,
                        bgcolor: "#C7A22C",
                        color: "#000",
                        fontWeight: "bold",
                        py: isMobile ? 1 : 1.2,
                        fontSize: isMobile ? "12px" : "14px",
                        "&:hover": { bgcolor: "#b4931f" },
                      }}
                    >
                      {isMobile ? "CONTACT ON WHATSAPP" : "CONTACT SUPPLIER ON WHATSAPP"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Container>

        {/* Supplier Information Section */}
        <Box sx={{ px: isMobile ? 2 : 7, mb: 5, mt: isMobile ? 3 : 4 }}>
          <Card
            sx={{
              boxShadow: 0,
              backgroundColor: "#E8E8E8",
              borderRadius: 0,
              mt: isMobile ? 2 : 4,
            }}
          >
            {/* Black Top Border */}
            <Box sx={{ height: 15, backgroundColor: "#000" }} />

            <CardContent sx={{ px: isMobile ? 3 : 8, py: isMobile ? 2 : 3 }}>
              <Typography
                variant="h6"
                sx={{
                  textAlign: "left",
                  mb: 2,
                  mt: isMobile ? 0.5 : 1,
                  fontSize: isMobile ? "16px" : "20px",
                }}
              >
                Supplier Information
              </Typography>

              {/* Supplier Row */}
              <Stack
                direction={isMobile ? "column" : "row"}
                alignItems={isMobile ? "flex-start" : "center"}
                justifyContent="space-between"
                spacing={isMobile ? 2 : 0}
              >
                {/* Left side - Supplier info */}
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={isMobile ? 1.5 : 2}
                >
                  <Avatar
                    src={
                      product?.store?.logo
                        ? IMAGE_BASE_URL + product.store.logo
                        : "/default-store.png"
                    }
                    alt={product?.store?.name}
                    sx={{
                      width: isMobile ? 45 : 55,
                      height: isMobile ? 45 : 55,
                      flexShrink: 0,
                    }}
                  />
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "500",
                        fontSize: isMobile ? "16px" : "25px",
                      }}
                    >
                      {product?.store?.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "black",
                        fontSize: isMobile ? "12px" : "inherit",
                      }}
                    >
                      {product?.store?.country}
                    </Typography>
                  </Box>
                </Stack>

                {/* Right side - Button */}
                <Button
                  onClick={() => navigate(`/supplier/${supplierId}`)}
                  sx={{
                    color: "#000",
                    fontWeight: "bold",
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                    fontSize: isMobile ? "12px" : "15px",
                    textTransform: "uppercase",
                    "&:hover": { background: "transparent" },
                    width: isMobile ? "100%" : "auto",
                  }}
                >
                  View Store Profile
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}