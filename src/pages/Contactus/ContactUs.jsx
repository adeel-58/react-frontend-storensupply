// ContactUs.jsx
import React, { useState } from "react";
import { Box, Grid, Typography, TextField, Button } from "@mui/material";
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
        pt: 15,
        pb: 15,
      }}
    >
      <Grid container spacing={4} alignItems="center">
        {/* LEFT SIDE */}
        <Grid
          item
          xs={12}
          md={5}
          sx={{ textAlign: "center", width: "50%", pt: 0, mt: -6 }}
        >
          <Typography
            variant="h3"
            sx={{ fontWeight: "bold", mb: 8, fontSize: "35px" }}
          >
            Contact Us
          </Typography>
          <Box
            component="img"
            src="/contact.png"
            alt="Contact"
            sx={{ width: "100%", maxWidth: 220 }}
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
              gap: 3,
              width: "100%",
            }}
          >
            {/* Full Name */}
            <Box>
              <Typography sx={labelStyle}>Full Name</Typography>
              <TextField
                fullWidth
                variant="outlined"
                name="name"
                value={formData.name}
                onChange={handleChange}
                sx={{ width: "500px", ...inputStyle }}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Box>

            {/* Email + Phone */}
            <Box sx={{ display: "flex", gap: 4 }}>
              <Box sx={{ width: "100%" }}>
                <Typography sx={labelStyle}>Email</Typography>
                <TextField
                  fullWidth
                  type="email"
                  variant="outlined"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  sx={{ width: "220px", ...inputStyle }}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Box>

              <Box sx={{ width: "100%" }}>
                <Typography sx={labelStyle}>Phone</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  sx={{ width: "250px", ...inputStyle }}
                  error={!!errors.phone}
                  helperText={errors.phone}
                />
              </Box>
            </Box>

            {/* Message */}
            <Box>
              <Typography sx={labelStyle}>Message</Typography>
              <TextField
                fullWidth
                multiline
                rows={5}
                variant="outlined"
                name="message"
                value={formData.message}
                onChange={handleChange}
                sx={{ width: "500px", ...inputStyle }}
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
                width: "fit-content",
                alignSelf: "flex-end",
                mt: 2,
                fontSize: "17px",
                fontWeight: 500,
                color: "white",
                backgroundColor: "#000",
                px: 4,
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
