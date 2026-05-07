import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import Home from "../features/listings/Home";
import CreateListing from "../features/listings/CreateListing";
import MyListings from "../features/listings/MyListings";
import AdminDashboard from "../features/admin/AdminDashboard";
import Cart from "../features/cart/Cart";
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

        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
