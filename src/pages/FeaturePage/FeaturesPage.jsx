// FeaturesPage.jsx
import React from "react";
import { Box, Grid, Typography, Button } from "@mui/material";

const features = [
 {
    title: "Inventory Management & Low-Stock Alerts",
    description: "Track stock levels, receive low-stock alerts, and manage inventory efficiently.",
    image: "/inventory.png",
  },
  {
    title: "Sales Tracking & Profit Overview",
    description: "Monitor total sales, profits, and margins with easy-to-read reports.",
    image: "/sales.png",
  },
  
 
  {
    title: "Top-Selling Products Analytics",
    description: "Identify top-selling products and optimize inventory accordingly.",
    image: "/best-selling.png",
  },
  {
    title: "Detailed Profit & Margin Reports",
    description: "Get comprehensive reports on profit margins for every product.",
    image: "/profit.png",
  },
  {
    title: "Daily, Weekly & Monthly Sales Trends",
    description: "Track sales across different periods to identify patterns.",
    image: "/sales-trend.png",
  },
  {
    title: "Full Inventory Analytics",
    description: "View stock value, low stock, out-of-stock, and zero-sales products at a glance.",
    image: "/inventory-analytics.png",
  },
  {
    title: "Public Listing URL with Stock Visibility",
    description: "Share your product listings publicly with stock visibility for easy tracking.",
    image: "/profit.png",
  },
];

const FeaturesPage = () => {
  return (
    <Box
      sx={{
        px: { xs: 2, md: 8 },
        py: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "Montserrat, sans-serif",
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 6, textAlign: "center" }}>
        Key Features for Suppliers
      </Typography>

      {features.map((feature, idx) => (
        <Grid
          container
          spacing={4}
          key={idx}
          sx={{
            mb: 6,
            maxWidth: 1000,
            width: "100%",
            flexDirection: { xs: "column", md: idx % 2 === 0 ? "row" : "row-reverse" },
            alignItems: "center",
            mt:0,
            px:7,
          }}
        >
          {/* Image */}
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src={feature.image}
              alt={feature.title}
              sx={{
                width: 450,      // fixed width
                height: 200,     // fixed height
                borderRadius: 2,
                boxShadow: 3,
                objectFit: "contain",
                display: "block",
                margin: "0 0",
              }}
            />
          </Grid>

          {/* Text + Button */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 400, height: "100%" }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 , color:"#D4AF37" }}>
                {feature.title}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, color: "black", fontSize:"17px" }}>
                {feature.description}
              </Typography>
              
            </Box>
          </Grid>
        </Grid>
      ))}
    </Box>
  );
};

export default FeaturesPage;
