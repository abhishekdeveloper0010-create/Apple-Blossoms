import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// =====================================================
// COMMON COMPONENTS
// =====================================================

import Header from "./components/Header";
import Footer from "./components/Footer";

// =====================================================
// PUBLIC PAGES
// =====================================================

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import ShippingPolicy from "./pages/ShippingPolicy";
import ReturnRefundPolicy from "./pages/ReturnRefundPolicy";
import ProductDetail from "./pages/ProductDetail";

// =====================================================
// AUTH PAGES
// =====================================================

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// =====================================================
// USER PROTECTED PAGES
// =====================================================

import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import OrderTracking from "./pages/OrderTracking";
import Profile from "./pages/Profile";
import Wallet from "./pages/Wallet";
import GiftCards from "./pages/GiftCards";
import MyReturns from "./pages/MyReturns";

// =====================================================
// ADMIN PAGES
// =====================================================

import Admin from "./pages/admin/Admin";
import AddProduct from "./pages/admin/AddProduct";
import OrderManagement from "./pages/admin/OrderManagement";
import ProductInventory from "./pages/admin/ProductInventory";
import CouponManagement from "./pages/admin/CouponManagement";
import GiftCardManagement from "./pages/admin/GiftCardManagement";
import CampaignManagement from "./pages/admin/CampaignManagement";
import ReturnManagement from "./pages/admin/ReturnManagement";
import ShipmentManagement from "./pages/admin/ShipmentManagement";
import NotificationManagement from "./pages/admin/NotificationManagement";

// =====================================================
// STEP 5 : ADMIN PANEL PAGES
// =====================================================

import SalesDashboard from "./pages/admin/SalesDashboard";
import RevenueReports from "./pages/admin/RevenueReports";
import CustomerManagement from "./pages/admin/CustomerManagement";
import PaymentDetails from "./pages/admin/PaymentDetails";
import CategoryManagement from "./pages/admin/CategoryManagement";
import ImageManagement from "./pages/admin/ImageManagement";

// =====================================================
// CHECK TOKEN
// =====================================================

const isTokenValid = () => {
  const token = localStorage.getItem("token");

  // No token
  if (!token) {
    return false;
  }

  try {
    // =================================================
    // JWT FORMAT CHECK
    // =================================================

    const parts = token.split(".");

    if (parts.length !== 3) {
      return false;
    }

    // =================================================
    // DECODE JWT PAYLOAD
    // =================================================

    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
    );

    // =================================================
    // JWT EXPIRY CHECK
    // =================================================

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      return false;
    }

    return true;
  } catch (error) {
    console.error("TOKEN CHECK ERROR:", error);

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return false;
  }
};

// =====================================================
// GET STORED USER
// =====================================================

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch (error) {
    console.error("GET USER ERROR:", error);

    return null;
  }
};

// =====================================================
// PROTECTED ROUTE
// =====================================================
// Login required
// =====================================================

function ProtectedRoute({ children }) {
  const authenticated = isTokenValid();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// =====================================================
// PUBLIC ONLY ROUTE
// =====================================================
// Logged-in user login/register page par nahi ja sakta
// =====================================================

function PublicOnlyRoute({ children }) {
  const authenticated = isTokenValid();

  if (authenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// =====================================================
// ADMIN ROUTE
// =====================================================
// Sirf admin user access kar sakta hai
// =====================================================

function AdminRoute({ children }) {
  // ===================================================
  // LOGIN CHECK
  // ===================================================

  if (!isTokenValid()) {
    return <Navigate to="/login" replace />;
  }

  // ===================================================
  // GET USER
  // ===================================================

  const user = getStoredUser();

  // ===================================================
  // ADMIN ROLE CHECK
  // ===================================================

  if (user?.role === "admin") {
    return children;
  }

  // Normal user ko home par bhejo
  return <Navigate to="/" replace />;
}

// =====================================================
// APP
// =====================================================

function App() {
  return (
    <BrowserRouter>
      {/* =================================================
          HEADER
      ================================================= */}

      <Header />

      {/* =================================================
          ROUTES
      ================================================= */}

      <Routes>
        {/* =================================================
            PUBLIC ROUTES
        ================================================= */}

        <Route path="/" element={<Home />} />

        <Route path="/shop" element={<Shop />} />

        <Route path="/product/:id" element={<ProductDetail />} />

        <Route path="/about" element={<About />} />

        <Route path="/contact" element={<Contact />} />

        <Route path="/terms" element={<Terms />} />

        <Route path="/privacy" element={<Privacy />} />

        {/* =================================================
            STEP 6 : POLICY PAGES
        ================================================= */}

        <Route
          path="/shipping-policy"
          element={<ShippingPolicy />}
        />

        <Route
          path="/return-refund-policy"
          element={<ReturnRefundPolicy />}
        />

        {/* =================================================
            LOGIN
        ================================================= */}

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />

        {/* =================================================
            REGISTER
        ================================================= */}

        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />

        {/* =================================================
            FORGOT PASSWORD
        ================================================= */}

        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* =================================================
            RESET PASSWORD
        ================================================= */}

        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* =================================================
            USER PROTECTED ROUTES
        ================================================= */}

        {/* CART */}

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        {/* CHECKOUT */}

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        {/* WISHLIST */}

        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />

        {/* ORDER TRACKING */}

        <Route
          path="/order-tracking"
          element={
            <ProtectedRoute>
              <OrderTracking />
            </ProtectedRoute>
          }
        />

        {/* PROFILE */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            ADMIN DASHBOARD
        ================================================= */}

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />

        {/* =================================================
            ADMIN - ADD PRODUCT
        ================================================= */}

      <Route
  path="/admin/products/add"
  element={
    <AdminRoute>
      <AddProduct />
    </AdminRoute>
  }
/>

        {/* =================================================
            ADMIN - PRODUCT INVENTORY
        ================================================= */}

        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <ProductInventory />
            </AdminRoute>
          }
        />

        {/* =================================================
            ADMIN - ORDER MANAGEMENT
        ================================================= */}

        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <OrderManagement />
            </AdminRoute>
          }
        />

        {/* =================================================

            ADMIN - COUPON MANAGEMENT
        ================================================= */}

        <Route
          path="/admin/coupons"
          element={
            <AdminRoute>
              <CouponManagement />
            </AdminRoute>
          }
        />

        {/* =================================================

            ADMIN - GIFT CARD MANAGEMENT
        ================================================= */}

        <Route
          path="/admin/gift-cards"
          element={
            <AdminRoute>
              <GiftCardManagement />
            </AdminRoute>
          }
        />

        {/* =================================================

            ADMIN - CAMPAIGN MANAGEMENT
        ================================================= */}

        <Route
          path="/admin/campaigns"
          element={
            <AdminRoute>
              <CampaignManagement />
            </AdminRoute>
          }
        />

        {/* =================================================

            ADMIN - RETURN MANAGEMENT (STEP 4)
        ================================================= */}

        <Route
          path="/admin/returns"
          element={
            <AdminRoute>
              <ReturnManagement />
            </AdminRoute>
          }
        />

        {/* =================================================

            ADMIN - SHIPMENT & TRACKING (STEP 4)
        ================================================= */}

        <Route
          path="/admin/shipments"
          element={
            <AdminRoute>
              <ShipmentManagement />
            </AdminRoute>
          }
        />

        {/* =================================================

            ADMIN - NOTIFICATIONS (STEP 4)
        ================================================= */}

        <Route
          path="/admin/notifications"
          element={
            <AdminRoute>
              <NotificationManagement />
            </AdminRoute>
          }
        />

        {/* =================================================

            ADMIN - SALES DASHBOARD (STEP 5)
        ================================================= */}

        <Route
          path="/admin/sales-dashboard"
          element={
            <AdminRoute>
              <SalesDashboard />
            </AdminRoute>
          }
        />

        {/* =================================================

            ADMIN - REVENUE REPORTS (STEP 5)
        ================================================= */}

        <Route
          path="/admin/reports"
          element={
            <AdminRoute>
              <RevenueReports />
            </AdminRoute>
          }
        />

        {/* =================================================

            ADMIN - CUSTOMER MANAGEMENT (STEP 5)
        ================================================= */}

        <Route
          path="/admin/customers"
          element={
            <AdminRoute>
              <CustomerManagement />
            </AdminRoute>
          }
        />

        {/* =================================================

            ADMIN - PAYMENT DETAILS (STEP 5)
        ================================================= */}

        <Route
          path="/admin/payments"
          element={
            <AdminRoute>
              <PaymentDetails />
            </AdminRoute>
          }
        />

        {/* =================================================

            ADMIN - CATEGORY MANAGEMENT (STEP 5)
        ================================================= */}

        <Route
          path="/admin/categories"
          element={
            <AdminRoute>
              <CategoryManagement />
            </AdminRoute>
          }
        />

        {/* =================================================

            ADMIN - IMAGE MANAGEMENT (STEP 5)
        ================================================= */}

        <Route
          path="/admin/images"
          element={
            <AdminRoute>
              <ImageManagement />
            </AdminRoute>
          }
        />

        {/* =================================================

            USER - WALLET
        ================================================= */}

        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <Wallet />
            </ProtectedRoute>
          }
        />

        {/* =================================================

            USER - GIFT CARDS
        ================================================= */}

        <Route
          path="/gift-cards"
          element={
            <ProtectedRoute>
              <GiftCards />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            USER - MY RETURNS (STEP 4)
        ================================================= */}

        <Route
          path="/my-returns"
          element={
            <ProtectedRoute>
              <MyReturns />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            FALLBACK ROUTE
        ================================================= */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* =================================================
          FOOTER
      ================================================= */}

      <Footer />
    </BrowserRouter>
  );
}

// =====================================================
// EXPORT
// =====================================================

export default App;
