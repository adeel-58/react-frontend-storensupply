import { Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      sx={{
        height: "100vh",
        px: 2, // padding on smaller screens
        backgroundColor: "#f9fafb", // light neutral background
      }}
    >
      <Typography variant="h3" gutterBottom fontWeight="bold">
        Welcome to My E-Commerce Platform
      </Typography>

      <Typography variant="h6" color="text.secondary" gutterBottom>
        Explore products, connect with suppliers, and grow your business with ease.
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Button
          component={Link}
          to="/signup"
          variant="contained"
          color="primary"
          sx={{ mr: 2 }}
        >
          Get Started
        </Button>

        <Button
          component={Link}
          to="/login"
          variant="outlined"
          color="primary"
        >
          Login
        </Button>
      </Box>
    </Box>
  );
}
