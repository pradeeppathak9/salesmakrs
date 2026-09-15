import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import SalespersonLayout from "./components/SalespersonLayout";
import RetailerLayout from "./components/RetailerLayout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Products from "./pages/Products";
import Retailers from "./pages/Retailers";
import Salespersons from "./pages/Salespersons";
import Orders from "./pages/Orders";
import SalespersonLogin from "./pages/salesperson/Login";
import SalespersonPlaceOrder from "./pages/salesperson/PlaceOrder";
import SalespersonMyOrders from "./pages/salesperson/MyOrders";
import RetailerLogin from "./pages/retailer/Login";
import RetailerPlaceOrder from "./pages/retailer/PlaceOrder";
import RetailerMyOrders from "./pages/retailer/MyOrders";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          element={
            <ProtectedRoute role="distributor">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/orders" element={<Orders />} />
          <Route path="/products" element={<Products />} />
          <Route path="/retailers" element={<Retailers />} />
          <Route path="/salespersons" element={<Salespersons />} />
        </Route>

        <Route path="/sales/login" element={<SalespersonLogin />} />
        <Route
          element={
            <ProtectedRoute role="salesperson">
              <SalespersonLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/sales/place-order" element={<SalespersonPlaceOrder />} />
          <Route path="/sales/orders" element={<SalespersonMyOrders />} />
        </Route>

        <Route path="/retailer/login" element={<RetailerLogin />} />
        <Route
          element={
            <ProtectedRoute role="retailer">
              <RetailerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/retailer/place-order" element={<RetailerPlaceOrder />} />
          <Route path="/retailer/orders" element={<RetailerMyOrders />} />
        </Route>

        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
    </AuthProvider>
  );
}
