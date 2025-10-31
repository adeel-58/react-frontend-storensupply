import { useEffect, useState } from "react";
import { Box, Typography, Button, Card, CardContent, CardMedia } from "@mui/material";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // ✅ Added for animation
import heroImage from "/heroimage.jpg";
import { useNavigate } from "react-router-dom";
export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const heroTexts = [
    {
      title1: "Your Supplier Dashboard,",
      title2: "Smartly Simplified.",
      subtitle: "Upload products, set prices, and track inventory in one place.",
      link1: "/feautres",
      btnText1: "View Features",

    },
    {
      title1: "Find Profitable Products",
      title2: " to Sell Online.",
      subtitle: "Browse thousands of products and get direct access to supplier.",

      link2: "/shop",

      btnText2: "View Products"
    }
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % heroTexts.length);
    }, 9000); // ✅ full 9 seconds delay per slide
    return () => clearTimeout(timer);
  }, [index]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products/random`);
      const data = await response.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(
          data.products.map(product => ({
            ...product,
            product_image: product.product_image || "https://via.placeholder.com/300",
          }))
        );
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="flex-end"
        justifyContent="center"
        textAlign="right"
        sx={{
          height: "100vh",
          px: 2,
          overflow: "hidden",
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center 80%",
          backgroundRepeat: "no-repeat",
          color: "#fff",
          position: "relative",
        }}
      >
        {/* Dark Overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 1,
          }}
        />

        {/* Animated Hero Content */}
        <Box sx={{ position: "relative", zIndex: 2, px: 17, mb: 12 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ x: 300, opacity: 0 }}      // enter from right
              animate={{ x: 0, opacity: 1 }}        // show
              exit={{ x: 300, opacity: 0 }}         // exit to right
              transition={{ duration: 0.8 }}
            >
              <Typography variant="h3" fontWeight="bold" sx={{ fontSize: "50px", mb: 2 }}>
                {heroTexts[index].title1}
              </Typography>
              <Typography variant="h3" fontWeight="bold" sx={{ fontSize: "50px" }}>
                {heroTexts[index].title2}
              </Typography>
              <Typography variant="h6" sx={{ mt: 2, fontSize: "25px" }}>
                {heroTexts[index].subtitle}
              </Typography>

              <Box sx={{ mt: 4 }}>
                {heroTexts[index].link1 && (
                  <Button
                    component={Link}
                    to={heroTexts[index].link1}
                    variant="contained"
                    color="primary"
                    sx={{ mr: 2, fontSize: "17px", fontWeight: 600 }}
                  >
                    {heroTexts[index].btnText1 || "Get Started"}
                  </Button>
                )}

                {heroTexts[index].link2 && (
                  <Button
                    component={Link}
                    to={heroTexts[index].link2}
                    variant="contained"
                    color="primary"
                    sx={{ fontSize: "17px", fontWeight: 600 }}
                  >
                    {heroTexts[index].btnText2 || "Learn More"}
                  </Button>
                )}
              </Box>
            </motion.div>
          </AnimatePresence>


        </Box>
      </Box>

      {/* Featured Products Section */}
      <Box sx={{ py: 8, px: 4, textAlign: "center", fontFamily: "Open Sans, sans-serif" }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "700", fontSize: "35px", mb: 6 }}>
          Featured Products
        </Typography>

        <Box
          display="grid"
          gridTemplateColumns="repeat(4, 1fr)"
          gap={3}
          sx={{ maxWidth: "1200px", margin: "0 auto" }}
        >
          {products.map(product => (
            <Card
              key={product.product_id}
              sx={{
                height: "380px",
                position: "relative", // needed for absolute sticker
                p: 1.5,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
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

              {/* Product Image */}
              <CardMedia
                component="img"
                height="230"
                image={product.product_image}
                alt={product.product_name}
                sx={{ objectFit: "contain", cursor: "pointer" }}
                onClick={() =>
                  navigate(`/supplier/${product.supplier_id}/product/${product.product_id}`)
                }
              />

              {/* Content */}
              <CardContent sx={{ p: 1 }}>
                {/* Product Name */}
                <Typography
                  fontWeight="600"
                  sx={{
                    fontSize: "16px",
                    whiteSpace: "wrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                    mb: 1,
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    navigate(`/supplier/${product.supplier_id}/product/${product.product_id}`)
                  }
                >
                  {product.product_name?.length > 50
                    ? product.product_name.substring(0, 50) + "..."
                    : product.product_name}
                </Typography>

                {/* Supplier */}
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{
                    textDecoration: "underline",
                    cursor: "pointer",
                    mb: 1.2,
                  }}
                  onClick={() =>
                    window.open(`/supplier/${product.supplier_id}`, "_blank")
                  }
                >
                  Supplier: {product.supplier_name}
                </Typography>

                {/* Price */}
                <Typography
                  variant="body1"
                  sx={{ fontSize: "17px", fontWeight: "500" }}
                >
                  Price: ${product.selling_price}
                </Typography>
              </CardContent>

            </Card>

          ))}

        </Box>
        <Box sx={{ mt: 8 }}>
          <Button
            component={Link}
            to="/shop"
            variant="contained"
            color="primary"
            sx={{ mr: 2, fontSize: "17px", fontWeight: 600 }}
            onClick={() => window.scrollTo(0, 0)}
          >
            See All Products
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
          mb: 0,
          mt: 0,
          pt: 0,

        }}
      >
        {/* Background Image */}
        <Box
          component="img"
          src="/background.png"
          alt="About Us Background"
          sx={{
            width: "100%",
            height: "auto",
            display: "block",
            margin: 0,
            padding: 0,
            position: "relative",
            zIndex: 1, // 👈 Background stays behind
            // backgroundColor:"white",
          }}
        />

        {/* Text on top of image */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: { xs: "50%", md: "20%" },
            transform: { xs: "translate(-50%, -50%)", md: "translateY(-50%)" },
            textAlign: { xs: "center", md: "left" },
            //color: "white",
            width: { xs: "90%", md: "40%" },
            zIndex: 2, // 👈 Text comes above image
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2, fontSize: "35px", color: "#1A1A1A" }}>
            About Us
          </Typography>
          <Typography sx={{ mb: 5, lineHeight: 1.6, color: "#1A1A1A", ml: 7, fontWeight: 500, fontSize: "20px" }}>
            At StorenSupply, we empower suppliers<br/> and online sellers with smart, all-in-one<br/> solutions. From managing inventory and<br/> tracking sales to uploading products and<br/> analyzing profitability, our platform streamlines<br/> every step of your e-commerce journey. Simplify<br/> your operations, save time, and grow your business with StorenSupply.
          </Typography>
          <Button
            component={Link}
            to="/about-us"
            variant="contained"
            sx={{ mr: 2, fontSize: "17px", ml: 39, fontWeight: 500, color: "white", backgroundColor: "#1a1a1a" }}
             onClick={() => window.scrollTo(0, 0)}
          >
            Read more
          </Button>
        </Box>
      </Box>



    </Box>
  );
}
