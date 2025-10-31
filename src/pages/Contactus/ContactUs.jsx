// ContactUs.jsx
import React from 'react';
import { Box, Grid, Typography, TextField, Button } from '@mui/material';

const labelStyle = { fontSize: "17px", fontWeight: 500, mb: 0.5 };

const inputNoBorder = {
    backgroundColor: "#e0e0e0",
    "& fieldset": { border: "none" },
    "&:hover fieldset": { border: "none" },
    "&.Mui-focused fieldset": { border: "none" }
};

const ContactUs = () => {
    return (
        <Box sx={{ flexGrow: 1, backgroundColor: "white", minHeight: "100vh", pt: 15, pb: 15 }}>
            <Grid container spacing={4} alignItems="center">
                {/* LEFT SIDE */}
                <Grid item xs={12} md={5} sx={{ textAlign: "center", width: "50%", pt: 0, mt: -6 }}>
                    <Typography variant="h3" sx={{ fontWeight: "bold", mb: 8, fontSize: "35px" }}>
                        Contact Us
                    </Typography>
                    <Box component="img" src="/contact.png" alt="Contact" sx={{ width: "100%", maxWidth: 220 }} />
                </Grid>

                {/* RIGHT SIDE - FORM */}
                <Grid item xs={12} md={7}>
                    <Box
                        component="form"
                        sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%" }}
                        onSubmit={(e) => {
                            e.preventDefault();
                            alert("Form submitted!");
                        }}
                    >
                        {/* Full Name */}
                        <Box>
                            <Typography sx={labelStyle}>Full Name</Typography>
                            <TextField
                                fullWidth
                                variant="outlined"
                                required
                                sx={{
                                    width: "500px",                   // Set width
                                    "& .MuiOutlinedInput-root": {
                                        backgroundColor: "#e0e0e0",     // Background color
                                        borderRadius: "6px",            // Optional rounded look
                                        height: "38px",                 // Control height
                                        "& fieldset": {
                                            border: "none",               // ❌ Remove border
                                        },
                                        "&:hover fieldset": {
                                            border: "none",               // No border on hover
                                        },
                                        "&.Mui-focused fieldset": {
                                            border: "none",               // No border on focus
                                        },
                                    },
                                    "& .MuiInputBase-input": {
                                        padding: "10px",                // Adjust inner spacing
                                    },
                                }}
                            />

                        </Box>

                        {/* Email + Subject side by side */}
                        <Box sx={{ display: "flex", gap: 4 }}>
                            <Box sx={{ width: "100%" }}>
                                <Typography sx={labelStyle}>Email</Typography>
                                <TextField fullWidth type="email" required variant="outlined" sx={{
                                    width: "220px",                   // Set width
                                    "& .MuiOutlinedInput-root": {
                                        backgroundColor: "#e0e0e0",     // Background color
                                        borderRadius: "6px",            // Optional rounded look
                                        height: "38px",                 // Control height
                                        "& fieldset": {
                                            border: "none",               // ❌ Remove border
                                        },
                                        "&:hover fieldset": {
                                            border: "none",               // No border on hover
                                        },
                                        "&.Mui-focused fieldset": {
                                            border: "none",               // No border on focus
                                        },
                                    },
                                    "& .MuiInputBase-input": {
                                        padding: "10px",                // Adjust inner spacing
                                    },
                                }} />
                            </Box>

                            <Box sx={{ width: "100%" }}>
                                <Typography sx={labelStyle}>Phone</Typography>
                                <TextField fullWidth required variant="outlined" sx={{
                                    width: "250px",                   // Set width
                                    "& .MuiOutlinedInput-root": {
                                        backgroundColor: "#e0e0e0",     // Background color
                                        borderRadius: "6px",            // Optional rounded look
                                        height: "38px",                 // Control height
                                        "& fieldset": {
                                            border: "none",               // ❌ Remove border
                                        },
                                        "&:hover fieldset": {
                                            border: "none",               // No border on hover
                                        },
                                        "&.Mui-focused fieldset": {
                                            border: "none",               // No border on focus
                                        },
                                    },
                                    "& .MuiInputBase-input": {
                                        padding: "10px",                // Adjust inner spacing
                                    },
                                }} />
                            </Box>
                        </Box>

                        {/* Message */}
                        <Box>
                            <Typography sx={labelStyle}>Message</Typography>
                            <TextField fullWidth multiline rows={5} required variant="outlined" sx={{
                                width: "500px",                   // Set width
                                "& .MuiOutlinedInput-root": {
                                    backgroundColor: "#e0e0e0",     // Background color
                                    borderRadius: "6px",            // Optional rounded look
                                    height: "160px",                 // Control height
                                    "& fieldset": {
                                        border: "none",               // ❌ Remove border
                                    },
                                    "&:hover fieldset": {
                                        border: "none",               // No border on hover
                                    },
                                    "&.Mui-focused fieldset": {
                                        border: "none",               // No border on focus
                                    },
                                },
                                "& .MuiInputBase-input": {
                                    padding: "10px",                // Adjust inner spacing
                                },
                            }} />
                        </Box>

                        {/* Button */}
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                width: "fit-content",
                                alignSelf: "flex-end",
                                mt: 2,
                                fontSize: "17px",
                                fontWeight: 500,
                                color: "white",
                                backgroundColor: "primary",
                                px: 4,
                                "&:hover": { backgroundColor: "#1a1a1a" },
                            }}
                        >
                            Send Message
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ContactUs;
