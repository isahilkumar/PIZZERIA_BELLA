import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import socket from '../../api/socket';
import {
  Boxes,
  ClipboardList,
  Mail,
  ChefHat,
  LogOut,
  ChevronRight,
} from 'lucide-react';

export default function AdminLayout() {
  const { user, isAdmin, logout, loading } = useAuth();
  const [activeOrder, setActiveOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, loading, navigate]);

  // Load active kitchen order and listen in real time
  useEffect(() => {
    if (!isAdmin) return;

    const fetchOngoingOrders = async () => {
      try {
        const res = await API.get('/orders/admin/all');
        if (res.data.success && res.data.orders.length > 0) {
          const ongoing = res.data.orders.find(
            (o) => o.status !== 'Delivered' && o.status !== 'Cancelled'
          );
          if (ongoing) {
            setActiveOrder(ongoing);
          }
        }
      } catch (err) {
        console.error('Error fetching admin ongoing orders:', err);
      }
    };

    fetchOngoingOrders();

    socket.emit('join_admin_room');

    const handleNewOrder = (newOrder) => {
      setActiveOrder(newOrder);
    };

    const handleOrderUpdated = (updated) => {
      if (updated.status === 'Delivered' || updated.status === 'Cancelled') {
        fetchOngoingOrders();
      } else {
        setActiveOrder(updated);
      }
    };

    socket.on('new_incoming_order', handleNewOrder);
    socket.on('order_status_updated_global', handleOrderUpdated);

    return () => {
      socket.off('new_incoming_order', handleNewOrder);
      socket.off('order_status_updated_global', handleOrderUpdated);
    };
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-orange-500 font-mono text-xs font-bold uppercase tracking-wider">Verifying Admin Privileges...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen text-stone-900 pb-16 relative">
      {/* Ambient Glass Backdrop */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#faf8f5]">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-orange-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-rose-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-amber-300/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Top Admin Bar - Frosted Glass */}
      <div className="glass-admin-nav sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-sunset-xs">
                <ChefHat className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-serif font-black text-sm text-stone-950 flex items-center gap-2">
                  Kitchen Command Center
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-black bg-rose-500/15 text-rose-700 border border-rose-300/60 uppercase tracking-wider backdrop-blur-md">
                    OPERATIONS
                  </span>
                </span>
                <span className="text-[11px] text-stone-600 font-semibold">
                  Logged in as <strong className="text-stone-900 font-black">{user?.name}</strong> ({user?.email})
                </span>
              </div>
            </div>

            {/* Navigation Tabs - Glass Capsules */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <NavLink
                to="/admin/inventory"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all whitespace-nowrap backdrop-blur-md ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-sunset-xs'
                      : 'bg-white/50 text-stone-700 hover:text-stone-950 hover:bg-white/80 border border-white/80'
                  }`
                }
              >
                <Boxes className="w-3.5 h-3.5" />
                Inventory Stock
              </NavLink>

              <NavLink
                to="/admin/orders"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all whitespace-nowrap backdrop-blur-md ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-sunset-xs'
                      : 'bg-white/50 text-stone-700 hover:text-stone-950 hover:bg-white/80 border border-white/80'
                  }`
                }
              >
                <ClipboardList className="w-3.5 h-3.5" />
                Kitchen Order Panel
              </NavLink>

              <NavLink
                to="/admin/emails"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all whitespace-nowrap backdrop-blur-md ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-sunset-xs'
                      : 'bg-white/50 text-stone-700 hover:text-stone-950 hover:bg-white/80 border border-white/80'
                  }`
                }
              >
                <Mail className="w-3.5 h-3.5" />
                Stock Alert & Email Log
              </NavLink>

              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-black text-stone-600 hover:text-rose-700 hover:bg-rose-50/80 border border-stone-200/80 hover:border-rose-300 transition-all flex items-center gap-1 ml-2 backdrop-blur-md"
                title="Sign out of admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Kitchen Order Alert Banner in Admin Portal - Glass Accent */}
      {activeOrder && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="relative overflow-hidden rounded-3xl glass-admin-card p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center gap-3.5">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
              </span>
              <div>
                <span className="font-bold text-sm text-stone-900">
                  Live Kitchen Order #{activeOrder.orderNumber}:
                </span>{' '}
                <span className="text-orange-700 font-extrabold text-sm ml-1 uppercase tracking-wide">
                  {activeOrder.status}
                </span>
              </div>
            </div>
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white text-xs font-black transition-all shadow-sunset-sm hover:scale-105 active:scale-95"
            >
              Track Live Timeline 🛵
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Outlet */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
