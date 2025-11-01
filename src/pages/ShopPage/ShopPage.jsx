import React, { useState, useEffect } from "react";
import {
    Box,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Typography,
    TextField,
    InputAdornment,
    Chip,
    Stack,
    Button,
    CardHeader,
    CircularProgress,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const IMAGE_BASE_URL = "";

const ShopPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get("search") || "";
        const cat = params.get("category") || "all";
        setSearchQuery(q);
        setSelectedCategory(cat);
    }, [location.search]);

    // Data
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    // Filters
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [sortBy, setSortBy] = useState("recent");
    const [country, setCountry] = useState("");

    const [loading, setLoading] = useState(false);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get("http://localhost:3000/api/shop");
            if (data.success && Array.isArray(data.products)) {
                setProducts(data.products);
                setFilteredProducts(data.products);

                const cats = [...new Set(data.products.map(p => p.category).filter(Boolean))];
                setCategories(cats);
            }
        } catch (error) {
            console.error("Error loading products:", error);
        } finally {
            setLoading(false);
        }
    };

    const filterProducts = () => {
        let filtered = [...products];

        if (searchQuery) {
            filtered = filtered.filter(p =>
                (p.product_name || "").toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedCategory !== "all") {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        if (country) {
            filtered = filtered.filter(p => p.country === country);
        }

        switch (sortBy) {
            case "price_low":
                filtered.sort((a, b) => a.selling_price - b.selling_price);
                break;
            case "price_high":
                filtered.sort((a, b) => b.selling_price - a.selling_price);
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

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [searchQuery, selectedCategory, sortBy, country, products]);

    const openProduct = (p) => {
        navigate(`/supplier/${p.supplier_id}/product/${p.product_id}`);
    };

    const openSupplier = (id) => {
        navigate(`/supplier/${id}`);
    };

    return (
        <Box sx={{
            py: isMobile ? 4 : 8,
            px: isMobile ? 2 : { xs: 2, md: 6 },
            minHeight: "100vh",
            bgcolor: "#fff"
        }}>
            <Typography variant="h4" sx={{
                mb: isMobile ? 3 : 4,
                fontWeight: 700,
                textAlign: "center",
                fontSize: isMobile ? "22px" : "inherit",
            }}>
                View All Products
            </Typography>

            {/* FILTERS */}
            <Card sx={{ mb: isMobile ? 3 : 4, boxShadow: "none" }}>
                <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                    <Grid container spacing={isMobile ? 1.5 : 3} alignItems="center">
                        <Grid item xs={12} md={4}>
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
                                    },
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={2}>
                            <TextField
                                select
                                fullWidth
                                label="Country"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                SelectProps={{ native: true }}
                                size={isMobile ? "small" : "medium"}
                                sx={{
                                    "& .MuiInputBase-root": {
                                        height: isMobile ? 35 : 40,
                                        fontSize: isMobile ? "14px" : "17px",
                                        minWidth: "120px"
                                    },
                                    "& label": {
                                        fontSize: isMobile ? "12px" : "13px",
                                        top: isMobile ? "-25px" : "-29px"
                                    },
                                }}
                                inputProps={{ style: { fontSize: isMobile ? "14px" : "17px" } }}
                            >
                                <option value="">All</option>
                                <option value="USA">USA</option>
                                <option value="China">China</option>
                                <option value="UK">UK</option>
                            </TextField>
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
                                        fontSize: isMobile ? "14px" : "17px"
                                    },
                                    "& label": {
                                        fontSize: isMobile ? "12px" : "17px",
                                        top: isMobile ? "-23px" : "-5px"
                                    },
                                }}
                                inputProps={{ style: { fontSize: isMobile ? "14px" : "17px" } }}
                            >
                                <option value="all">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
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
                                        fontSize: isMobile ? "14px" : "17px"
                                    },
                                    "& label": {
                                        fontSize: isMobile ? "12px" : "17px",
                                        top: isMobile ? "-23px" : "-5px"
                                    },
                                }}
                                inputProps={{ style: { fontSize: isMobile ? "14px" : "17px" } }}
                            >
                                <option value="recent">Most Recent</option>
                                <option value="popular">Most Popular</option>
                                <option value="price_low">Price: Low to High</option>
                                <option value="price_high">Price: High to Low</option>
                            </TextField>
                        </Grid>
                    </Grid>

                    <Typography variant="body2" sx={{
                        mt: 2,
                        fontSize: isMobile ? "12px" : "inherit"
                    }}>
                        Showing {filteredProducts.length} of {products.length} products
                    </Typography>
                </CardContent>
            </Card>

            {/* PRODUCT GRID */}
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <CircularProgress size={60} />
                </Box>
            ) : filteredProducts.length === 0 ? (
                <Card sx={{ p: isMobile ? 3 : 5, textAlign: "center", boxShadow: "none" }}>
                    <Typography variant="h6" color="text.secondary" sx={{ fontSize: isMobile ? "16px" : "inherit" }}>
                        No products found
                    </Typography>
                </Card>
            ) : (
                <Grid container spacing={isMobile ? 1.5 : 3}>
                    {filteredProducts.map((product) => (
                        <Grid item xs={6} sm={6} md={4} key={product.product_id}>
                            <Box sx={{ display: "flex", justifyContent: "center" }}>
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
                                    onClick={() => openProduct(product)}
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
                                        image={product.product_image || "/placeholder-product.png"}
                                        alt={product.product_name}
                                        sx={{
                                            objectFit: "contain",
                                            backgroundColor: "#f5f5f5",
                                            p: 1
                                        }}
                                    />

                                    <CardContent sx={{
                                        flexGrow: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                        p: isMobile ? 1 : 2,
                                    }}>
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
                                            title={product.product_name}
                                        >
                                            {product.product_name}
                                        </Typography>

                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            mb={1}
                                            mt="auto"
                                        >
                                            <Typography
                                                variant="h5"
                                                color="primary"
                                                fontWeight="bold"
                                                sx={{ fontSize: isMobile ? "16px" : "inherit" }}
                                            >
                                                ${Number(product.selling_price).toFixed(2)}
                                            </Typography>
                                            {product.category && (
                                                <Chip
                                                    label={product.category}
                                                    size={isMobile ? "small" : "medium"}
                                                    color="default"
                                                    sx={{ fontSize: isMobile ? "11px" : "inherit" }}
                                                />
                                            )}
                                        </Stack>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mt: 1,
                                                textDecoration: "underline",
                                                cursor: "pointer",
                                                fontSize: isMobile ? "12px" : "inherit"
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openSupplier(product.supplier_id);
                                            }}
                                        >
                                            Supplier: {product.supplier_name || "A"}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default ShopPage;