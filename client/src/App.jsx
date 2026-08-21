import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import About from "./pages/About";
import Contact from "./pages/Contact";
import Wishlist from "./pages/Wishlist";
import OrderTracking from "./pages/OrderTracking";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import ProductDetail from "./pages/ProductDetail";
import Profile from "./pages/Profile";

// =====================================================
// CHECK TOKEN
// =====================================================

const isTokenValid = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return false;
  }

  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return false;
    }

    const payload = JSON.parse(
      atob(
        parts[1]
          .replace(/-/g, "+")
          .replace(/_/g, "/")
      )
    );

    // JWT expiry check
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
// PROTECTED ROUTE
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
// Login/Register page logged-in user ke liye nahi
// =====================================================

function PublicOnlyRoute({ children }) {
  const authenticated = isTokenValid();

  if (authenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// =====================================================
// APP
// =====================================================

function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>

        {/* =================================================
            PUBLIC ROUTES
        ================================================= */}

        <Route path="/" element={<Home />} />

        <Route path="/shop" element={<Shop />} />

        <Route
          path="/product/:id"
          element={<ProductDetail />}
        />

        <Route path="/about" element={<About />} />

        <Route path="/contact" element={<Contact />} />

        <Route path="/terms" element={<Terms />} />

        <Route path="/privacy" element={<Privacy />} />

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

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* =================================================
            RESET PASSWORD
        ================================================= */}

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />

        {/* =================================================
            PROTECTED ROUTES
        ================================================= */}

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />

        <Route
          path="/order-tracking"
          element={
            <ProtectedRoute>
              <OrderTracking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            FALLBACK
        ================================================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;