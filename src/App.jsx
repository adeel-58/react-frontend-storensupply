// src/App.jsx
import { Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Header from "./components/Header";
import Footer from "./components/Footer";
import AuthGate from "./components/AuthGate";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import SellerProfile from "./pages/Seller/SellerProfile";
import SupplierProfile from "./pages/Supplier/SupplierProfile";
import SupplierDashboard from "./pages/Supplier/SupplierDashboard";
import SupplierProfilePage from "./pages/public/SupplierProfilePage";
import ProductDetailPage from "./pages/public/ProductDetailPage";
import AboutUs from "./pages/Aboutus/AboutUs";
import ContactUs from "./pages/Contactus/ContactUs";
import ShopPage from "./pages/ShopPage/ShopPage";
import Plans from "./pages/Plans/Plans";
import FeaturesPage from "./pages/FeaturePage/FeaturesPage";
import ResetPassword from "./pages/ResetPassword/ResetPassword";

function App() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <>
      <Header />
      <Routes>
        {/* Public routes - no AuthGate needed */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/" element={<Home />} />

        {/* All other routes wrapped in AuthGate */}
        <Route
          path="/*"
          element={
            <AuthGate>
              <Routes>


                {/* Protected pages - accessible only if user is set */}
                {user && (
                  <>

                    <Route path="/seller" element={<SellerProfile />} />
                    <Route path="/supplier-profile" element={<SupplierProfile />} />
                    <Route path="/supplier-dashboard" element={<SupplierDashboard />} />
                    <Route path="/supplier/:supplierId" element={<SupplierProfilePage />} />
                    <Route path="/supplier/:supplierId/product/:productId" element={<ProductDetailPage />} />

                    <Route path="/shop" element={<ShopPage />} />

                  </>
                )}
              </Routes>
            </AuthGate>
          }
        />
      </Routes>
      <Footer />
    </>
  );
}

export default App;