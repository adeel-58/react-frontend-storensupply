import Header from "./components/Header";
import Footer from "./components/Footer";
import { Routes, Route } from "react-router-dom";


import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import SellerProfile from "./pages/Seller/SellerProfile";
import SupplierProfile from "./pages/Supplier/SupplierProfile";
import SupplierDashboard from "./pages/Supplier/SupplierDashboard";

// Inside your <Routes>



function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/seller" element={<SellerProfile />} />
          <Route path="/supplier-profile" element={<SupplierProfile />} />
          <Route path="/supplier-dashboard" element={<SupplierDashboard />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
