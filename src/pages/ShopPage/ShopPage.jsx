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
} from "@mui/material";
import { Search } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
//import queryString from "query-string"; // optional: for easier parsing
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
const IMAGE_BASE_URL = "";

const ShopPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get("search") || "";
        const cat = params.get("category") || "all"; // NEW: get category
        setSearchQuery(q);
        setSelectedCategory(cat);
    }, [location.search]);

    // Data
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    // Filters
    //  const [searchQuery, setSearchQuery] = useState("");
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
        <Box sx={{ py: 8, px: { xs: 2, md: 6 }, minHeight: "100vh", bgcolor: "#fff" }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, textAlign: "center" }}>
                View All Products
            </Typography>

            {/* FILTERS */}
            <Card sx={{ mb: 4, boxShadow: "none", }}>
                <CardContent>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={4}>
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
                                    sx: { height: 40, fontSize: "17px" },
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
                                sx={{
                                    "& .MuiInputBase-root": { height: 40, fontSize: "17px", minWidth: "120px" },
                                    "& label": { fontSize: "13px", top: "-29px" },
                                }}
                                inputProps={{ style: { fontSize: "17px" } }}
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
                                sx={{
                                    "& .MuiInputBase-root": { height: 40, fontSize: "17px" },
                                    "& label": { fontSize: "17px", top: "-5px" },
                                }}
                                inputProps={{ style: { fontSize: "17px" } }}
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
                                sx={{
                                    "& .MuiInputBase-root": { height: 40, fontSize: "17px" },
                                    "& label": { fontSize: "17px", top: "-5px" },
                                }}
                                inputProps={{ style: { fontSize: "17px" } }}
                            >
                                <option value="recent">Most Recent</option>
                                <option value="popular">Most Popular</option>
                                <option value="price_low">Price: Low to High</option>
                                <option value="price_high">Price: High to Low</option>
                            </TextField>
                        </Grid>
                    </Grid>

                    <Typography variant="body2" sx={{ mt: 2 }}>
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
                <Card sx={{ p: 5, textAlign: "center", boxShadow: "none" }}>
                    <Typography variant="h6" color="text.secondary">
                        No products found
                    </Typography>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    {filteredProducts.map((product) => (
                        <Grid item xs={12} sm={6} md={4} key={product.product_id}>
                            <Box sx={{ display: "flex", justifyContent: "center" }}>
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
                                        image={product.product_image || "/placeholder-product.png"}
                                        alt={product.product_name}
                                        sx={{ objectFit: "contain", backgroundColor: "#f5f5f5", p: 1 }}
                                    />

                                    <CardContent sx={{ flexGrow: 1 }}>
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
                                            title={product.product_name}
                                        >
                                            {product.product_name}
                                        </Typography>

                                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                            <Typography variant="h5" color="primary" fontWeight="bold">
                                                ${Number(product.selling_price).toFixed(2)}
                                            </Typography>
                                            {product.category && <Chip label={product.category} size="small" color="default" />}
                                        </Stack>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mt: 1, textDecoration: "underline", cursor: "pointer" }}
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
