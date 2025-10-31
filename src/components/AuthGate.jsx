// src/components/AuthGate.jsx
import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import AuthModal from "./AuthModal";
import { useAuth } from "../context/AuthContext";

export default function AuthGate({ children }) {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading) setOpen(!user);
  }, [user, loading]);

  if (loading) return null; // avoid flicker while checking auth

  return (
    <>
      {/* Main website content (blurred when modal open). page background is #E0E0E0 */}
      <Box
        sx={{
          minHeight: "100vh",
          background: "#E0E0E0",
          filter: open ? "blur(4px)" : "none",
          transition: "filter 0.25s ease",
          pointerEvents: open ? "none" : "auto", // block clicks while modal open
        }}
      >
        {children}
      </Box>

      {/* Light overlay with blur; overlay is scrollable so page can be scrolled visually */}
      {open && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: (theme) => theme.zIndex.modal - 1,
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            overflowY: "auto",   // allows scroll while modal is open
            pointerEvents: "auto",
          }}
        />
      )}

      {/* Modal (unskippable) */}
      <AuthModal open={open} />
    </>
  );
}
