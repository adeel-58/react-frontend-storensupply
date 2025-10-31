// Plans.jsx
import React from "react";
import { Box, Grid, Card, CardContent, Typography, Button, Divider, List, ListItem, ListItemText } from "@mui/material";

const supplierPlans = [
  {
    id: 1,
    name: "Starter",
    description: "Ideal for small suppliers or new sellers",
    upload_limit: 5,
    top_products: 3,
    type: "free",
    price: 0.0,
    duration_days: 30,
  },
  {
    id: 2,
    name: "Pro",
    description: "Designed for growing businesses and suppliers",
    upload_limit: 30,
    top_products: 5,
    type: "paid",
    price: 5.0,
    duration_days: 30,
  },
  {
    id: 3,
    name: "Premium",
    description: "For established suppliers and high-volume operations",
    upload_limit: 1000000,
    top_products: 10,
    type: "paid",
    price: 8.0,
    duration_days: 30,
  },
];

const gradient = "#D4AF37";

const featureList = [
  "Inventory Management & Low-Stock Alerts",
  "Sales Tracking & Profit Overview",
  "Product Profitability Insights",
  "7-Day Sales Trend Chart",
  "Weekly & Monthly Sales Trends",
  "Top-Selling Products Analytics",
  "Detailed Profit & Margin Reports",
  "Daily, Weekly & Monthly Sales Trends",
  "Full Inventory Analytics: Stock Value, Low Stock, Out-of-Stock & Zero-Sales Products",
  "Public Listing URL with stock visibility",
  "24/7 Customer Support",
  "Custom Dashboard Layout"
];



const Plans = () => {
  return (
    <Box sx={{ py: 8, px: { xs: 2, md: 8 }, fontFamily: "Montserrat, sans-serif" }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 6, textAlign: "center", fontSize:"34px" }}>
        Supplier Plans
      </Typography>
      <Grid container spacing={4} sx={{ justifyContent: "center" }}>
        {supplierPlans.map((plan) => (
          <Grid item key={plan.id} sx={{ width: 350 }}>
            <Card
              sx={{
                textAlign: "center",
                p: 3,
                boxShadow: 3,
                borderRadius: 3,
                position: "relative",
                overflow: "visible",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  width: 90,
                  height: 90,
                  margin: "auto",
                  mt: -6,
                  borderRadius: "50%",
                  background: gradient,
                  border: "5px solid #fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: 3,
                  
                }}
              >
                <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
                  {plan.type === "free" ? "Free" : `$${plan.price}`}
                </Typography>
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {plan.name}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 , fontSize:"18px"}}>
                  {plan.description}
                </Typography>

                <List dense sx={{ textAlign: "center", mb: 2, px: 0, }}>
                  {featureList.map((feature, idx) => (
                    <ListItem key={idx} sx={{ py: 0.2 }}>
                      <ListItemText  primary={feature.replace("best-selling products", `top ${plan.top_products} best-selling products`)} />
                    </ListItem>
                  ))}

                </List>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" sx={{ mb: 1 , fontWeight:"bold" }}>
                  Upload Limit: {plan.upload_limit}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Duration: {plan.duration_days} days
                </Typography>


                <Button
  variant="contained"
  color="primary"
  sx={{ mr: 2, fontSize: "17px", fontWeight: 600 }}
  onClick={() => {
    if (plan.type === "paid") {
      const phoneNumber = "+923467837274";
      const message = encodeURIComponent(`I want to purchase the ${plan.name} plan`);
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
    }
  }}
>
  {plan.type === "free" ? "It's Free" : "Pay Now"}
</Button>





              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Plans;
