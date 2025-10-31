import React from "react";
import { Box, Typography, Grid, Link, IconButton } from "@mui/material";
import { Facebook, Instagram, YouTube, LinkedIn } from "@mui/icons-material";

export default function Footer() {
  return (
    <Box sx={{ bgcolor: "#1a1a1a", color: "white", pt: 7, pb: 3, px: { xs: 2, md: 6 }, fontFamily: "'Open Sans', sans-serif" }}>
      <Grid container spacing={4} columnGap={18} sx={{ pb: 5 }}>

        {/* Company Info */}
        <Grid item xs={12} md={3}>
          <Box
            component="img"
            src="/footer_logo.png"
            alt="My E-Commerce Logo"
            sx={{ width: 250, mb: 2 }}
          />
          <Typography variant="body2" sx={{ lineHeight: 1.8, fontSize: "17px" }}>
            Discover ready-to-ship products, supplier<br /> contact details, wholesale pricing, and<br /> manage your business with smart<br /> dashboards and analytics.
          </Typography>
        </Grid>

        {/* Quick Links */}
        <Grid item xs={12} md={3}>
          <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "17px", mb: 2 }}>
            Quick Links
          </Typography>
          {[
            { text: "Supplier Dashboard", href: "/supplier-profile" },
            { text: "Featured Products", href: "/shop" },
            
            { text: "Features", href: "/features" },
            { text: "Plans", href: "/plans" }
          ].map((link) => (
            <Typography key={link.text} sx={{ mb: 1.2, lineHeight: 1.8 }}>
              <Link href={link.href} color="inherit" underline="hover">{link.text}</Link>
            </Typography>
          ))}
        </Grid>

        {/* Customer Service */}
        <Grid item xs={12} md={3}>
          <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "17px", mb: 2 }}>
            Customer Service
          </Typography>
          {[
            { text: "Terms & Conditions", href: "/terms" },
            { text: "Privacy Policy", href: "/privacy" },
            { text: "Contact Us", href: "/contact-us" },
            { text: "About Us", href: "/about-us" },
            
          ].map((link) => (
            <Typography key={link.text} sx={{ mb: 1.2, lineHeight: 1.8 }}>
              <Link href={link.href} color="inherit" underline="hover">{link.text}</Link>
            </Typography>
          ))}
        </Grid>

        {/* Contact + Social */}
        <Grid item xs={12} md={3}>
          <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "17px", mb: 2 }}>
            Contact Us
          </Typography>
          <Typography variant="body2" sx={{ mb: 1.2, lineHeight: 1.8 }}>Email: storensupply@gmail.com</Typography>
          <Typography variant="body2" sx={{ mb: 1.2, lineHeight: 1.8 }}>WhatsApp: +92 333 8051097</Typography>
          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>Location: Islamabad, Pakistan</Typography>

          {/* Social Icons */}
          <Box sx={{ mt: 1 }}>
            <IconButton sx={{ color: "white" }} component="a" href="https://www.facebook.com" target="_blank"><Facebook /></IconButton>
            <IconButton sx={{ color: "white" }} component="a" href="https://www.instagram.com" target="_blank"><Instagram /></IconButton>
            <IconButton sx={{ color: "white" }} component="a" href="https://www.youtube.com" target="_blank"><YouTube /></IconButton>
            <IconButton sx={{ color: "white" }} component="a" href="https://www.linkedin.com" target="_blank"><LinkedIn /></IconButton>
          </Box>
        </Grid>
      </Grid>

      {/* Divider */}
      <Box sx={{ borderTop: "1px solid #333", mt: 4, pt: 2, textAlign: "center" }}>
        <Typography variant="body2">
          © {new Date().getFullYear()} StorenSupply. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
