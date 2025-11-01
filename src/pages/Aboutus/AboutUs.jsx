import React from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Link } from "react-router-dom";

const AboutUs = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#fff",
        pt: isMobile ? 8 : 15,
        pb: 10,
        px: isMobile ? 2 : { xs: 3, md: 10 },
        minHeight: "100vh",
      }}
    >
      {/* Row 1 — Icon */}
      <Box sx={{
        mb: isMobile ? 2 : 0,
        display: "flex",
        justifyContent: "flex-start",
        ml: isMobile ? 0 : 4,
      }}>
        <img
          src="/aboutus.png"
          alt="About Us Icon"
          style={{
            width: isMobile ? "40px" : "50px",
            height: isMobile ? "35px" : "45px",
          }}
        />
      </Box>

      {/* Row 2 — Heading */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          mb: isMobile ? 3 : 5,
          textAlign: "left",
          fontSize: isMobile ? "28px" : "50px",
        }}
      >
        Hi There
      </Typography>

      {/* Row 3 — Paragraph */}
      <Typography
        sx={{
          fontSize: isMobile ? "14px" : "18px",
          lineHeight: isMobile ? "1.6" : "1.8",
          color: "#444",
          maxWidth: "900px",
          textAlign: "left",
          mb: isMobile ? 3 : 4,
        }}
      >
        StorenSupply was founded with a simple mission: to make online selling smarter, faster, and more efficient for suppliers and e-commerce businesses. Our platform provides a comprehensive suite of tools designed to streamline every aspect of product management and sales.<br /><br />

        Whether you're uploading products, setting prices, tracking inventory, or analyzing profit margins, StorenSupply centralizes all your operations in a single, intuitive dashboard. Our system gives suppliers direct control over their catalog, enabling them to optimize sales, reduce errors, and make data-driven decisions effortlessly.<br /><br />

        Beyond basic management, StorenSupply integrates modern analytics to help sellers understand trends, track top-performing products, and improve their profitability. With AI-powered insights and real-time reporting, businesses can stay ahead in the competitive e-commerce landscape.<br /><br />

        We are committed to empowering suppliers and online retailers of all sizes, offering flexible plans that scale with your business. At StorenSupply, our goal is to simplify your workflow, save you time, and unlock growth opportunities so you can focus on what matters most: delivering quality products to your customers.<br />
      </Typography>

      {/* See All Features Link */}
      <Box sx={{ mt: isMobile ? 1.5 : 2 }}>
        <Link
          to="/features"
          style={{
            textDecoration: "underline",
            color: "#D4AF37",
            fontWeight: 600,
            fontSize: isMobile ? "14px" : "16px",
          }}
        >
          See All Features
        </Link>
      </Box>

      {/* Row 4 — Circles Decorative */}
      <Box
        sx={{
          display: "flex",
          justifyContent: isMobile ? "flex-end" : "flex-end",
          alignItems: "center",
          gap: isMobile ? 1.5 : 2,
          mt: isMobile ? 5 : 4,
          pr: isMobile ? 0 : { xs: 2, md: 8 },
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            width: isMobile ? 55 : 75,
            height: isMobile ? 55 : 75,
            borderRadius: "50%",
            backgroundColor: "#d1ac28",
          }}
        />
        <Box
          sx={{
            width: isMobile ? 14 : 18,
            height: isMobile ? 14 : 18,
            borderRadius: "50%",
            backgroundColor: "black",
            mt: isMobile ? 2.5 : 4,
          }}
        />
        <Box
          sx={{
            width: isMobile ? 14 : 18,
            height: isMobile ? 14 : 18,
            borderRadius: "50%",
            backgroundColor: "black",
            mt: isMobile ? 2.5 : 4,
          }}
        />
      </Box>
    </Box>
  );
};

export default AboutUs;