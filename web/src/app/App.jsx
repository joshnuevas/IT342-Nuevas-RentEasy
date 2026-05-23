import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import Home from "../features/listings/Home";
import CreateListing from "../features/listings/CreateListing";
import MyListings from "../features/listings/MyListings";
import ProductDetail from "../features/listings/ProductDetail";
import AdminDashboard from "../features/admin/AdminDashboard";
import AdminProductDetail from "../features/admin/AdminProductDetail";
import Cart from "../features/cart/Cart";
import Checkout from "../features/checkout/Checkout";
import OrderConfirmation from "../features/checkout/OrderConfirmation";
import Profile from "../features/profile/Profile";
import RenterProfile from "../features/profile/RenterProfile";
import ProtectedRoute from "../shared/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

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
          path="/order-confirmation"
          element={
            <ProtectedRoute>
              <OrderConfirmation />
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

        <Route
          path="/renters/:renterId"
          element={
            <ProtectedRoute>
              <RenterProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products/:productId"
          element={
            <ProtectedRoute>
              <ProductDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-listing"
          element={
            <ProtectedRoute>
              <CreateListing />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-listings"
          element={
            <ProtectedRoute>
              <MyListings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/products/:productId"
          element={
            <ProtectedRoute>
              <AdminProductDetail />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
