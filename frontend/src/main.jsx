import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css';

import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import RegisterPage from './pages/register.jsx';
import UserPage from './pages/user.jsx';
import AdminPage from './pages/admin.jsx';
import AdminHomePage from './pages/admin-home.jsx';
import HomePage from './pages/home.jsx';
import LoginPage from './pages/login.jsx';
import ProductDetailPage from './pages/product-detail.jsx';
import { AuthWrapper } from './components/context/auth.context.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import { CartProvider } from './components/context/cart.context.jsx';
import CartPage from './pages/cart.jsx';
import CheckoutPage from './pages/checkout.jsx';
import OrdersPage from './pages/orders.jsx';
import OrderDetailPage from './pages/order-detail.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "user",
        element: <Navigate to="/user/profile" replace />
      },
      {
        path: "user/profile",
        element: <ProtectedRoute allowedRoles={["USER"]}><UserPage /></ProtectedRoute>
      },
      {
        path: "admin",
        element: <ProtectedRoute allowedRoles={["ADMIN"]}><AdminHomePage /></ProtectedRoute>
      },
      {
        path: "admin/profile",
        element: <ProtectedRoute allowedRoles={["ADMIN"]}><AdminPage /></ProtectedRoute>
      },
      {
        path: "products/:id",
        element: <ProtectedRoute allowedRoles={["USER", "ADMIN"]}><ProductDetailPage /></ProtectedRoute>
      },
      {
        path: "cart",
        element: <ProtectedRoute allowedRoles={["USER", "ADMIN"]}><CartPage /></ProtectedRoute>
      },
      {
        path: "checkout",
        element: <ProtectedRoute allowedRoles={["USER", "ADMIN"]}><CheckoutPage /></ProtectedRoute>
      },
      {
        path: "orders",
        element: <ProtectedRoute allowedRoles={["USER", "ADMIN"]}><OrdersPage /></ProtectedRoute>
      },
      {
        path: "orders/:id",
        element: <ProtectedRoute allowedRoles={["USER", "ADMIN"]}><OrderDetailPage /></ProtectedRoute>
      }
    ]
  },
  {
    path: "register",
    element: <RegisterPage />
  },
  {
    path: "login",
    element: <LoginPage />
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthWrapper>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AuthWrapper>
  </React.StrictMode>,
)