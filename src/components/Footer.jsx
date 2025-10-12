import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function Footer() {
  return (
    <Box sx={{ bgcolor: "primary.main", color: "white", textAlign: "center", py: 2, mt: 4 }}>
      <Typography variant="body2">
        © {new Date().getFullYear()} My E-Commerce Platform. All rights reserved.
      </Typography>
    </Box>
  );
}
