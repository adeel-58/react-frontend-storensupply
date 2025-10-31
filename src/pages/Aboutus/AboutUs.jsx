import React from "react";
import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";
const AboutUs = () => {
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#fff", // ✅ FULL white background
        pt: 15,
        pb: 0,
        px: { xs: 3, md: 10 },    // ✅ Responsive clean padding
        minHeight: "100vh",
        pb: 10,
      }}
    >
      {/* ✅ Row 1 — Icon */}
      <Box sx={{ mb: 0, display: "flex", justifyContent: "flex-start", ml: 4 }}>
        <img
          src="/aboutus.png"
          alt="About Us Icon"
          style={{ width: "50px", height: "45px" }}
        />
      </Box>

      {/* ✅ Row 2 — Heading */}
      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", mb: 5, textAlign: "left", fontSize: "50px" }}
      >
        Hi There
      </Typography>

      {/* ✅ Row 3 — Paragraph */}
      <Typography
        sx={{
          fontSize: "18px",
          lineHeight: "1.8",
          color: "#444",
          maxWidth: "900px", // ✅ Keeps text narrow for readability
          textAlign: "left",
          mb: 4,
        }}
      >
        StorenSupply was founded with a simple mission: to make online selling smarter, faster, and more efficient for suppliers and e-commerce businesses. Our platform provides a comprehensive suite of tools designed to streamline every aspect of product management and sales.<br /><br />

        Whether you’re uploading products, setting prices, tracking inventory, or analyzing profit margins, StorenSupply centralizes all your operations in a single, intuitive dashboard. Our system gives suppliers direct control over their catalog, enabling them to optimize sales, reduce errors, and make data-driven decisions effortlessly.<br /><br />

        Beyond basic management, StorenSupply integrates modern analytics to help sellers understand trends, track top-performing products, and improve their profitability. With AI-powered insights and real-time reporting, businesses can stay ahead in the competitive e-commerce landscape.<br /><br />

        We are committed to empowering suppliers and online retailers of all sizes, offering flexible plans that scale with your business. At StorenSupply, our goal is to simplify your workflow, save you time, and unlock growth opportunities so you can focus on what matters most: delivering quality products to your customers.<br />
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Link
          to="/features"
          style={{
            textDecoration: "underline",
            color: "#D4AF37",
            fontWeight: 600,
            fontSize: "16px",
          }}
        >
          See All Features
        </Link>
      </Box>


      {/* ✅ Row 4 — Circles Decorative */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 2,
          mt: 4,
          pr: { xs: 2, md: 8 },
        }}
      >
        <Box
          sx={{
            width: 75,
            height: 75,
            borderRadius: "50%",
            backgroundColor: "#d1ac28",
          }}
        />
        <Box
          sx={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            backgroundColor: "black",
            mt: 4,
          }}
        />
        <Box
          sx={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            backgroundColor: "black",
            mt: 4,
          }}
        />
      </Box>
    </Box>
  );
};

export default AboutUs;
