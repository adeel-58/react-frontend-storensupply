import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import "./index.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "@fontsource/open-sans/300.css";
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/500.css";
import "@fontsource/open-sans/700.css";

const theme = createTheme({
  palette: {
    mode: "light", // ✅ Force light theme
    primary: {
      main: "#D4AF37", // ✅ Gold theme
    },
    background: {
      default: "#E0E0E0", // ✅ Light background
      paper: "#FFFFFF",
    },
    text: {
      primary: "#000000",
      secondary: "#333333",
    },
  },
  typography: {
    fontFamily: "'open-sans', 'Helvetica', 'Arial', sans-serif",
  },
});
// ✅ Create one QueryClient instance for the whole app
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          {/* ✅ Wrap the entire app with QueryClientProvider */}
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
          </ThemeProvider>


        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  </React.StrictMode>
);
