// ContactUs.jsx
import React, { useState } from "react";
import { Box, Grid, Typography, TextField, Button, useMediaQuery, useTheme } from "@mui/material";
import axios from "axios";

const labelStyle = { fontSize: "17px", fontWeight: 500, mb: 0.5 };

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#e0e0e0",
    borderRadius: "6px",
    "& fieldset": { border: "none" },
    "&:hover fieldset": { border: "none" },
    "&.Mui-focused fieldset": { border: "none" },
  },
  "& .MuiInputBase-input": {
    padding: "10px",
  },
};

const WEB3_ACCESS_KEY = "8d86369e-1a6f-4a92-aa25-33f778745ca4"; // 🔑 Replace with your actual Web3Forms Access Key

const ContactUs = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    let temp = {};
    temp.name = formData.name ? "" : "Full name is required.";
    temp.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ? ""
      : "Valid email is required.";
    temp.phone = /^[0-9]{10,15}$/.test(formData.phone)
      ? ""
      : "Enter valid phone number (10–15 digits).";
    temp.message = formData.message ? "" : "Message cannot be empty.";
    setErrors(temp);
    return Object.values(temp).every((x) => x === "");
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const form = new FormData();
      form.append("access_key", WEB3_ACCESS_KEY);
      form.append("name", formData.name);
      form.append("email", formData.email);
      form.append("phone", formData.phone);
      form.append("message", formData.message);

      const response = await axios.post("https://api.web3forms.com/submit", form);
      if (response.data.success) {
        alert("Your message has been sent successfully!");
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        alert("Something went wrong. Please try again later.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send message. Please check your network or key.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        backgroundColor: "white",
        minHeight: "100vh",
        pt: isMobile ? 8 : 15,
        pb: isMobile ? 8 : 15,
        px: isMobile ? 2 : 0,
      }}
    >
      <Grid
        container
        spacing={isMobile ? 2 : 4}
        alignItems="center"
        sx={{
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        {/* LEFT SIDE - Image */}
        <Grid
          item
          xs={12}
          md={5}
          sx={{
            textAlign: "center",
            width: isMobile ? "100%" : "50%",
            pt: 0,
            mt: isMobile ? 0 : -6,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              mb: isMobile ? 4 : 8,
              fontSize: isMobile ? "24px" : "35px",
            }}
          >
            Contact Us
          </Typography>
          <Box
            component="img"
            src="/contact.png"
            alt="Contact"
            sx={{
              width: "100%",
              maxWidth: isMobile ? 150 : 220,
              height: "auto",
            }}
          />
        </Grid>

        {/* RIGHT SIDE - FORM */}
        <Grid item xs={12} md={7}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: isMobile ? 2 : 3,
              width: "100%",
              px: isMobile ? 0 : 4,
            }}
          >
            {/* Full Name */}
            <Box>
              <Typography sx={{
                ...labelStyle,
                fontSize: isMobile ? "14px" : "17px",
              }}>
                Full Name
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                name="name"
                value={formData.name}
                onChange={handleChange}
                size={isMobile ? "small" : "medium"}
                sx={{
                  width: isMobile ? "100%" : "500px",
                  ...inputStyle,
                }}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Box>

            {/* Email + Phone */}
            <Box sx={{
              display: "flex",
              gap: isMobile ? 2 : 4,
              flexDirection: isMobile ? "column" : "row",
            }}>
              <Box sx={{ width: "100%" }}>
                <Typography sx={{
                  ...labelStyle,
                  fontSize: isMobile ? "14px" : "17px",
                }}>
                  Email
                </Typography>
                <TextField
                  fullWidth
                  type="email"
                  variant="outlined"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    width: isMobile ? "100%" : "220px",
                    ...inputStyle,
                  }}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Box>

              <Box sx={{ width: "100%" }}>
                <Typography sx={{
                  ...labelStyle,
                  fontSize: isMobile ? "14px" : "17px",
                }}>
                  Phone
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    width: isMobile ? "100%" : "250px",
                    ...inputStyle,
                  }}
                  error={!!errors.phone}
                  helperText={errors.phone}
                />
              </Box>
            </Box>

            {/* Message */}
            <Box>
              <Typography sx={{
                ...labelStyle,
                fontSize: isMobile ? "14px" : "17px",
              }}>
                Message
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={isMobile ? 4 : 5}
                variant="outlined"
                name="message"
                value={formData.message}
                onChange={handleChange}
                size={isMobile ? "small" : "medium"}
                sx={{
                  width: isMobile ? "100%" : "500px",
                  ...inputStyle,
                }}
                error={!!errors.message}
                helperText={errors.message}
              />
            </Box>

            {/* Button */}
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                width: isMobile ? "100%" : "fit-content",
                alignSelf: isMobile ? "stretch" : "flex-end",
                mt: isMobile ? 1 : 2,
                fontSize: isMobile ? "14px" : "17px",
                fontWeight: 500,
                color: "white",
                backgroundColor: "#000",
                px: isMobile ? 2 : 4,
                py: isMobile ? 1.2 : 1,
                "&:hover": { backgroundColor: "#1a1a1a" },
              }}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContactUs;