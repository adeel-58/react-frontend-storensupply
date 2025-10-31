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
      const url = `https://wa.me/${product.store.whatsapp}?text=${encodeURIComponent(message)}`;
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
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: "#ffffffff", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">


        <Container maxWidth="lg" sx={{ px: 4, mt: 8 }}>
          <Grid
            container
            spacing={4}
            justifyContent="center"
            alignItems="flex-start"
          >
            {/* Left Side - Product Images */}
            <Grid item xs={12} md={6.5} sx={{mt:4}}>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Box
                  sx={{
                    width: "100%",
                    height: 480,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#fff",
                    borderRadius: 2,       // ✅ Visible rounded corners
                    overflow: "hidden",         // ✅ Required to clip image corners
                    p: 0,
                    border: "1px solid #eee",   // Optional: makes radius visible
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
            <Grid item xs={12} md={6.5} sx={{ width: "60%" }}>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Card sx={{ boxShadow: "none", p: 0 }}>
                  <CardContent>
                    {/* Title + Price Row */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        sx={{
                          maxWidth: "70%",
                          wordBreak: "break-word",
                          whiteSpace: "normal",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {product?.title}
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        ${Number(product?.price || 0).toFixed(2)}
                      </Typography>
                    </Stack>

                    {/* Category & Stock */}
                    <Typography sx={{ mt: 1, fontSize: "16px", color: "gray" }}>
                      {product?.category} &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; Stock:{" "}
                      {product?.stock_quantity}
                    </Typography>

                    <Divider sx={{ my: 2, width: "80px", borderWidth: "2px", borderColor: "#C7A22C" }} />



                    {/* Product details */}
                    <Typography sx={{ mt: 8, fontWeight: "bold", fontSize: "23px" }}>Product details</Typography>
                    <Box sx={{ mt: 2 }}>
                      <Stack spacing={1}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", bgcolor: "#F5F5F5", p: 1, borderRadius: 1 }}>
                          <Typography>Country:</Typography>
                          <Typography>{product?.country || "-"}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", bgcolor: "#F5F5F5", p: 1, borderRadius: 1 }}>
                          <Typography>Condition:</Typography>
                          <Typography>New</Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", bgcolor: "#F5F5F5", p: 1, borderRadius: 1 }}>
                          <Typography>Availability:</Typography>
                          <Typography sx={{ color: product?.stock_quantity > 0 ? "green" : "red" }}>
                            {product?.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                          </Typography>
                        </Box>
                        {product?.ebay_link && (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              bgcolor: "#F5F5F5",
                              p: 1,
                              borderRadius: 1,
                            }}
                          >
                            <Typography>eBay link:</Typography>
                            <a
                              href={
                                product.ebay_link.startsWith("http://") ||
                                  product.ebay_link.startsWith("https://")
                                  ? product.ebay_link
                                  : `https://${product.ebay_link}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#C7A22C", textDecoration: "none", fontWeight: "500" }}
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
                      startIcon={<WhatsApp />}
                      onClick={handleContactSupplier}
                      sx={{
                        mt: 3,
                        bgcolor: "#C7A22C",
                        color: "#000",
                        fontWeight: "bold",
                        py: 1.2,
                        "&:hover": { bgcolor: "#b4931f" },
                      }}
                    >
                      CONTACT SUPPLIER ON WHATSAPP
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Container>

        <Box sx={{ px: 7, mb: 5 }}>
          <Card
            sx={{
              boxShadow: 0,
              backgroundColor: "#E8E8E8",
              borderRadius: 0,
              mt: 4,

            }}
          >
            {/* Black Top Border */}
            <Box sx={{ height: 15, backgroundColor: "#000", }} />

            <CardContent sx={{ px: 8 }}>
              <Typography
                variant="h6"
                sx={{

                  textAlign: "left",
                  mb: 2,
                  mt: 1,
                  fontSize: "20px",
                }}
              >
                Supplier Information
              </Typography>

              {/* Supplier Row */}
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                {/* Left side - Supplier info */}
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    src={
                      product?.store?.logo
                        ? IMAGE_BASE_URL + product.store.logo
                        : "/default-store.png"
                    }
                    alt={product?.store?.name}
                    sx={{ width: 55, height: 55 }}
                  />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: "500", fontSize: "25px" }}>
                      {product?.store?.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "black" }}>
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
                    fontSize: "15px",
                    textTransform: "uppercase",
                    "&:hover": { background: "transparent" },
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