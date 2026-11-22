import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// User Pages
import Home from './pages/Home';
import CustomBuilder from './pages/CustomBuilder';
import CartSummary from './pages/CartSummary';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import JoinClub from './pages/JoinClub';
import Welcome from './pages/Welcome';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminInventory from './pages/admin/AdminInventory';
import AdminOrders from './pages/admin/AdminOrders';
import AdminEmails from './pages/admin/AdminEmails';

export default function App() {
  const location = useLocation();
  const isFullScreenPage =
    location.pathname === '/' ||
    location.pathname === '/welcome' ||
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/join-club' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/admin/login' ||
    location.pathname.startsWith('/reset-password') ||
    location.pathname.startsWith('/verify-email');

  const hideFooter =
    location.pathname === '/welcome' ||
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/forgot-password' ||
    location.pathname.startsWith('/reset-password') ||
    location.pathname.startsWith('/verify-email') ||
    location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen text-orange-900 selection:bg-sunset-400 selection:text-white">
      <Navbar />

      <main className={`flex-1 ${isFullScreenPage ? '' : 'pt-24 sm:pt-28'}`}>
        <Routes>
          {/* Public & Customer Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/custom-builder" element={<CustomBuilder />} />
          <Route path="/checkout" element={<CartSummary />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/join-club" element={<JoinClub />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Dedicated Admin Portal Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/inventory" replace />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="emails" element={<AdminEmails />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!hideFooter && <Footer />}
    </div>
  );
}

