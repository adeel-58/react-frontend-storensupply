// Plans.jsx
import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{
      py: isMobile ? 4 : 8,
      px: isMobile ? 2 : { xs: 2, md: 8 },
      fontFamily: "Montserrat, sans-serif"
    }}>
      <Typography variant="h4" sx={{
        fontWeight: 700,
        mb: isMobile ? 4 : 6,
        textAlign: "center",
        fontSize: isMobile ? "24px" : "34px"
      }}>
        Supplier Plans
      </Typography>

      <Grid
        container
        spacing={isMobile ? 2 : 4}
        sx={{
          justifyContent: "center",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "center" : "flex-start",
        }}
      >
        {supplierPlans.map((plan) => (
          <Grid
            item
            key={plan.id}
            sx={{
              width: isMobile ? "100%" : 350,
              maxWidth: isMobile ? "100%" : "350px",
            }}
          >
            <Card
              sx={{
                textAlign: "center",
                p: isMobile ? 2 : 3,
                mt:{xs:3},
                boxShadow: 3,
                borderRadius: 3,
                position: "relative",
                overflow: "visible",
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              {/* Price Circle */}
              <Box
                sx={{
                  width: isMobile ? 70 : 90,
                  height: isMobile ? 70 : 90,
                  margin: "auto",
                  mt: isMobile ? -4 : -6,
                  borderRadius: "50%",
                  background: gradient,
                  border: "5px solid #fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: 3,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: isMobile ? "14px" : "inherit",
                  }}
                >
                  {plan.type === "free" ? "Free" : `$${plan.price}`}
                </Typography>
              </Box>

              <CardContent sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                p: isMobile ? 1.5 : 2,
              }}>
                {/* Plan Name */}
                <Typography variant="h6" sx={{
                  fontWeight: 600,
                  mb: 1.5,
                  fontSize: isMobile ? "18px" : "inherit",
                }}>
                  {plan.name}
                </Typography>

                {/* Description */}
                <Typography variant="body2" sx={{
                  mb: isMobile ? 1.5 : 2,
                  fontSize: isMobile ? "14px" : "18px",
                }}>
                  {plan.description}
                </Typography>

                {/* Features List */}
                <List dense sx={{
                  textAlign: "center",
                  mb: isMobile ? 1.5 : 2,
                  px: 0,
                }}>
                  {featureList.map((feature, idx) => (
                    <ListItem key={idx} sx={{ py: isMobile ? 0.1 : 0.2 }}>
                      <ListItemText
                        primary={feature.replace("best-selling products", `top ${plan.top_products} best-selling products`)}
                        sx={{
                          "& .MuiTypography-root": {
                            fontSize: isMobile ? "11px" : "inherit",
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>

                <Divider sx={{ my: isMobile ? 1.5 : 2 }} />

                {/* Upload Limit */}
                <Typography variant="body2" sx={{
                  mb: 0.5,
                  fontWeight: "bold",
                  fontSize: isMobile ? "12px" : "inherit",
                }}>
                  Upload Limit: {plan.upload_limit}
                </Typography>

                {/* Duration */}
                <Typography variant="body2" sx={{
                  mb: isMobile ? 2 : 2,
                  fontSize: isMobile ? "12px" : "inherit",
                }}>
                  Duration: {plan.duration_days} days
                </Typography>

                {/* Button */}
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    fontSize: isMobile ? "14px" : "17px",
                    fontWeight: 600,
                    mt: "auto",
                    width: isMobile ? "100%" : "auto",
                    py: isMobile ? 0.8 : 1,
                  }}
                  onClick={() => {
                    if (plan.type === "paid") {
                      const phoneNumber = "+923338051097";
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