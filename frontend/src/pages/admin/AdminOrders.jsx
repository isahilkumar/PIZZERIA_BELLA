import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import socket from '../../api/socket';
import {
  ClipboardList,
  Clock,
  Flame,
  Truck,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search,
  MapPin,
  Phone,
  User,
  Sparkles,
  Pizza,
} from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [recentNotification, setRecentNotification] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders/admin/all');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Join admin room
    socket.emit('join_admin_room');

    // Real-time listener for incoming orders
    const handleNewOrder = (newOrder) => {
      console.log('⚡ [Admin Socket] New incoming order arrived:', newOrder.orderNumber);
      setOrders((prev) => [newOrder, ...prev]);
      setRecentNotification(`🍕 New Order Received: #${newOrder.orderNumber} (₹${newOrder.pricing.total})`);
      setTimeout(() => setRecentNotification(''), 5000);
    };

    socket.on('new_incoming_order', handleNewOrder);

    // Real-time listener for global order updates
    const handleOrderUpdated = (updated) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? updated : o))
      );
    };

    socket.on('order_status_updated_global', handleOrderUpdated);

    // Auto-poll every 10s as fallback
    const interval = setInterval(fetchOrders, 10000);

    return () => {
      socket.off('new_incoming_order', handleNewOrder);
      socket.off('order_status_updated_global', handleOrderUpdated);
      clearInterval(interval);
    };
  }, []);

  // Update Status handler
  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await API.put(`/orders/admin/${orderId}/status`, {
        status: newStatus,
        note: `Status updated to ${newStatus} by kitchen admin operator`,
      });

      if (res.data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? res.data.order : o))
        );
        setRecentNotification(`Order #${res.data.order.orderNumber} updated to "${newStatus}" — Broadcasted via WebSocket!`);
        setTimeout(() => setRecentNotification(''), 4000);
      }
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Order Received':
        return 'bg-blue-100 text-blue-900 border border-blue-300 font-black';
      case 'In Kitchen':
        return 'bg-amber-100 text-amber-900 border border-amber-300 font-black animate-pulse';
      case 'Sent to Delivery':
        return 'bg-purple-100 text-purple-900 border border-purple-300 font-black animate-pulse';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-black';
      default:
        return 'bg-stone-100 text-stone-900 font-bold border border-stone-300';
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-orange-600 font-mono text-xs font-bold uppercase tracking-wider">Connecting to Kitchen Order Stream...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-stone-900">
      {/* Toast Alert */}
      {recentNotification && (
        <div className="bg-gradient-to-r from-orange-500 to-rose-500 text-white font-black px-5 py-3.5 rounded-2xl shadow-xl flex items-center justify-between animate-bounce border border-orange-400">
          <div className="flex items-center gap-2.5 text-sm">
            <Sparkles className="w-5 h-5 text-white" />
            <span>{recentNotification}</span>
          </div>
          <span className="text-[10px] font-mono bg-white/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-black">
            Live Streamed
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-orange-200/80 pb-6">
        <div>
          <span className="text-xs uppercase font-mono font-black tracking-widest text-orange-600 block">
            Real-Time Kitchen Dispatch
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-stone-950 mt-1 tracking-tight">
            Order Management Panel
          </h1>
          <p className="text-stone-600 text-xs font-semibold mt-1">
            Incoming customer orders stream live here. Changing an order's status triggers an instant WebSocket update on the customer's dashboard.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-4 py-2.5 glass-admin-subcard hover:bg-white/80 rounded-xl text-stone-900 text-xs font-black flex items-center gap-2 self-start md:self-auto shadow-xs transition-all active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5 text-orange-600" />
          Refresh Orders
        </button>
      </div>

      {/* Status Filter Tabs - Frosted Glass Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 p-1.5 rounded-2xl glass-admin-subcard">
        {[
          { id: 'all', label: `All Orders (${orders.length})` },
          { id: 'Order Received', label: `Order Received (${orders.filter((o) => o.status === 'Order Received').length})` },
          { id: 'In Kitchen', label: `In Kitchen (${orders.filter((o) => o.status === 'In Kitchen').length})` },
          { id: 'Sent to Delivery', label: `Sent to Delivery (${orders.filter((o) => o.status === 'Sent to Delivery').length})` },
          { id: 'Delivered', label: `Delivered (${orders.filter((o) => o.status === 'Delivered').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap backdrop-blur-md ${
              statusFilter === tab.id
                ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-sunset-xs'
                : 'bg-white/50 text-stone-800 hover:text-stone-950 hover:bg-white/85 border border-white/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="glass-admin-card rounded-3xl p-14 text-center space-y-3">
          <ClipboardList className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="text-2xl font-serif font-black text-stone-950">No Orders Found</h3>
          <p className="text-stone-600 text-xs font-semibold max-w-sm mx-auto">
            No orders match the selected filter. Place an order from the customer store to test real-time WebSocket dispatch!
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((order) => {
            const isUpdating = updatingId === order._id;

            return (
              <div
                key={order._id}
                className="glass-admin-card rounded-3xl p-6 sm:p-7 space-y-6 hover:border-orange-400/80 transition-all shadow-xl"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-orange-200/40 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-serif font-black text-xl text-stone-950">#{order.orderNumber}</span>
                    <span className={`px-3 py-1 rounded-full text-xs shadow-xs ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-800 font-black bg-emerald-500/15 border border-emerald-400/50 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                      Razorpay Paid
                    </span>
                  </div>

                  <div className="text-xs text-stone-600 font-mono font-bold">
                    {new Date(order.createdAt).toLocaleTimeString()} ({new Date(order.createdAt).toLocaleDateString()})
                  </div>
                </div>

                {/* Grid: Customer Info & Items */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Customer & Destination */}
                  <div className="md:col-span-4 glass-admin-subcard rounded-2xl p-4.5 text-xs space-y-2">
                    <div className="text-stone-500 font-mono font-black uppercase tracking-widest text-[10px]">
                      Customer & Destination
                    </div>
                    <div className="font-serif font-black text-stone-950 flex items-center gap-1.5 text-sm">
                      <User className="w-3.5 h-3.5 text-orange-600" />
                      {order.customer.name}
                    </div>
                    <div className="text-stone-800 font-black flex items-center gap-1.5 font-mono">
                      <Phone className="w-3.5 h-3.5 text-orange-600" />
                      {order.customer.phone}
                    </div>
                    <div className="text-stone-700 font-semibold flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                      <span>
                        {order.customer.address.street}, {order.customer.address.city} - {order.customer.address.pincode}
                      </span>
                    </div>
                  </div>

                  {/* Pizza Items */}
                  <div className="md:col-span-5 space-y-2.5">
                    <div className="text-stone-500 font-mono font-black uppercase tracking-widest text-[10px]">
                      Kitchen Prep Breakdown
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="p-3.5 glass-admin-subcard rounded-xl text-xs space-y-1">
                          <div className="flex justify-between font-serif font-black text-stone-950">
                            <span>
                              {item.name} <span className="text-orange-600 font-sans text-xs font-bold">(x{item.quantity})</span>
                            </span>
                            <span className="text-orange-600 font-serif font-black font-mono">₹{item.itemTotal}</span>
                          </div>
                          <div className="text-[11px] text-stone-600 font-medium">
                            Crust: <strong className="text-stone-900 font-bold">{item.base.name}</strong> | Sauce: <strong className="text-stone-900 font-bold">{item.sauce.name}</strong> | Cheese: <strong className="text-stone-900 font-bold">{item.cheese.name}</strong>
                          </div>
                          {item.veggies && item.veggies.length > 0 && (
                            <div className="text-[11px] text-emerald-800 font-bold">
                              Toppings: {item.veggies.map((v) => v.name).join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total & Status Actions */}
                  <div className="md:col-span-3 space-y-3.5 glass-admin-subcard rounded-2xl p-4.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-600 font-mono font-bold">Grand Total:</span>
                      <span className="text-2xl font-serif font-black text-orange-600 font-mono">₹{order.pricing.total}</span>
                    </div>

                    <div className="pt-2 border-t border-orange-200/50 space-y-2">
                      <div className="text-[10px] font-mono text-stone-600 uppercase font-black tracking-widest">
                        Update Status Live:
                      </div>

                      {/* Fast Status Transition Buttons */}
                      <div className="flex flex-col gap-1.5">
                        <button
                          disabled={isUpdating || order.status === 'Order Received'}
                          onClick={() => handleUpdateStatus(order._id, 'Order Received')}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-black transition-all text-left flex items-center justify-between backdrop-blur-md ${
                            order.status === 'Order Received'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white/60 hover:bg-blue-50/90 text-stone-800 border border-white/80'
                          }`}
                        >
                          <span>1. Order Received</span>
                          {order.status === 'Order Received' && <CheckCircle className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <button
                          disabled={isUpdating || order.status === 'In Kitchen'}
                          onClick={() => handleUpdateStatus(order._id, 'In Kitchen')}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-black transition-all text-left flex items-center justify-between backdrop-blur-md ${
                            order.status === 'In Kitchen'
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                              : 'bg-white/60 hover:bg-orange-50/90 text-stone-800 border border-white/80'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-orange-600" />
                            2. In Kitchen (Baking)
                          </span>
                          {order.status === 'In Kitchen' && <CheckCircle className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <button
                          disabled={isUpdating || order.status === 'Sent to Delivery'}
                          onClick={() => handleUpdateStatus(order._id, 'Sent to Delivery')}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-black transition-all text-left flex items-center justify-between backdrop-blur-md ${
                            order.status === 'Sent to Delivery'
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-white/60 hover:bg-purple-50/90 text-stone-800 border border-white/80'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-purple-600" />
                            3. Sent to Delivery
                          </span>
                          {order.status === 'Sent to Delivery' && <CheckCircle className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <button
                          disabled={isUpdating || order.status === 'Delivered'}
                          onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-black transition-all text-left flex items-center justify-between backdrop-blur-md ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white/60 hover:bg-emerald-50/90 text-stone-800 border border-white/80'
                          }`}
                        >
                          <span>4. Delivered</span>
                          {order.status === 'Delivered' && <CheckCircle className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
