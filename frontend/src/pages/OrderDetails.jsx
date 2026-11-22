import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import socket from '../api/socket';
import {
  Clock,
  CheckCircle,
  Flame,
  Truck,
  Pizza,
  MapPin,
  Phone,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdatedNotice, setLastUpdatedNotice] = useState(false);

  useEffect(() => {
    // 1. Fetch initial order data
    const fetchOrder = async () => {
      try {
        const res = await API.get(`/orders/${id}`);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // 2. Join Socket.IO room for real-time live status updates
    socket.emit('join_order_room', id);

    const handleStatusUpdate = (updatedOrder) => {
      if (updatedOrder._id === id) {
        console.log('⚡ [Socket.io] Received order status update:', updatedOrder.status);
        setOrder(updatedOrder);
        setLastUpdatedNotice(true);
        setTimeout(() => setLastUpdatedNotice(false), 4000);
      }
    };

    socket.on('order_status_updated', handleStatusUpdate);

    // 3. Fallback Polling every 8 seconds
    const interval = setInterval(fetchOrder, 8000);

    return () => {
      socket.emit('leave_order_room', id);
      socket.off('order_status_updated', handleStatusUpdate);
      clearInterval(interval);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-4 border-sunset-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-orange-500 font-mono text-xs">Connecting to live kitchen tracker...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-2xl font-serif font-bold text-orange-900">Order Not Found</h2>
        <p className="text-orange-500 text-sm">{error || 'Unable to locate this order.'}</p>
        <Link to="/" className="inline-block px-6 py-2.5 rounded-xl bg-white border border-orange-200 text-orange-700 text-xs font-bold hover:bg-orange-50">
          Return to Menu
        </Link>
      </div>
    );
  }

  // Stepper milestones
  const milestones = [
    {
      title: 'Order Received',
      desc: 'Order confirmed & dough prepped',
      icon: Clock,
      statusKey: 'Order Received',
    },
    {
      title: 'In Kitchen',
      desc: 'Toppings added & stone baking at 900°F',
      icon: Flame,
      statusKey: 'In Kitchen',
    },
    {
      title: 'Sent to Delivery',
      desc: 'Rider is on the way with insulated box',
      icon: Truck,
      statusKey: 'Sent to Delivery',
    },
    {
      title: 'Delivered',
      desc: 'Handed over fresh & piping hot',
      icon: CheckCircle,
      statusKey: 'Delivered',
    },
  ];

  const getStatusIndex = (status) => {
    switch (status) {
      case 'Order Received':
        return 0;
      case 'In Kitchen':
        return 1;
      case 'Sent to Delivery':
        return 2;
      case 'Delivered':
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getStatusIndex(order.status);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Real-time sync alert pill */}
      {lastUpdatedNotice && (
        <div className="bg-orange-50 border border-orange-300 text-sunset-800 font-bold px-5 py-3 rounded-2xl shadow-lg flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-2.5 text-sm">
            <Sparkles className="w-5 h-5 text-sunset-600" />
            <span>Real-time status updated to: "{order.status}"</span>
          </div>
          <span className="text-[10px] font-mono bg-orange-100 text-orange-800 border border-orange-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
            WebSocket Synced
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-orange-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs uppercase font-mono font-bold tracking-widest text-sunset-600">
              Live Order Tracker
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-100 text-orange-800 border border-orange-200">
              <span className="w-1.5 h-1.5 rounded-full bg-sunset-500 animate-ping"></span>
              Socket Connected
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-orange-900 mt-1">
            Order #{order.orderNumber}
          </h1>
          <p className="text-orange-500 text-xs mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Admin test button */}
        <Link
          to="/admin/orders"
          target="_blank"
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-orange-50 border border-orange-200 text-sunset-600 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition-all shadow-sm hover:border-sunset-300"
        >
          <span>Open Kitchen Admin in New Tab</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Hero Tracker Card with Stepper */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-card-soft border border-orange-200 space-y-10 relative overflow-hidden">
        {/* Soft Sunset ambient backglow */}
        <div className="absolute top-0 right-1/4 w-80 h-32 bg-orange-100/50 blur-3xl pointer-events-none rounded-full"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-orange-500">
              Current Kitchen Phase
            </span>
            <div className="text-3xl sm:text-4xl font-serif font-extrabold text-sunset-gradient flex items-center gap-3 mt-0.5">
              {order.status}
              {order.status !== 'Delivered' && (
                <span className="w-3 h-3 rounded-full bg-sunset-500 animate-ping"></span>
              )}
            </div>
          </div>

          <div className="bg-sunset-peach/60 p-4 rounded-2xl border border-orange-200/60 text-right">
            <span className="text-[10px] font-mono font-bold text-orange-500 uppercase tracking-widest block">
              Estimated Delivery
            </span>
            <span className="text-xl font-serif font-extrabold text-orange-900">
              {new Date(order.estimatedDeliveryTime || Date.now() + 30 * 60000).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <span className="text-[10px] text-orange-500 block mt-0.5">30-40 min standard delivery</span>
          </div>
        </div>

        {/* Milestone Stepper */}
        <div className="relative pt-2">
          {/* Connector line desktop */}
          <div className="hidden sm:block absolute top-9 left-14 right-14 h-1.5 bg-orange-100 -z-0 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-sunset-rose via-sunset-500 to-amber-500 transition-all duration-700 shadow-sunset-sm rounded-full"
              style={{ width: `${(currentIndex / (milestones.length - 1)) * 100}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-2 relative z-10">
            {milestones.map((m, idx) => {
              const Icon = m.icon;
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <div
                  key={m.title}
                  className={`flex sm:flex-col items-center sm:text-center gap-4 sm:gap-3 transition-all ${
                    isCurrent
                      ? 'scale-105'
                      : isPast
                      ? 'opacity-90'
                      : 'opacity-40'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all shadow-md ${
                      isCurrent
                        ? 'bg-gradient-to-br from-sunset-rose to-sunset-500 text-white border-white ring-4 ring-sunset-300 shadow-sunset-md'
                        : isPast
                        ? 'bg-sunset-500 text-white border-sunset-400'
                        : 'bg-orange-50 text-orange-400 border-orange-200'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="font-serif font-bold text-sm text-orange-900">{m.title}</div>
                    <div className="text-[11px] text-orange-500 max-w-[170px] sm:mx-auto">
                      {m.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Timeline History */}
        <div className="bg-orange-50 rounded-2xl p-5 space-y-3 border border-orange-200/80">
          <h3 className="text-[10px] font-mono uppercase font-bold tracking-widest text-sunset-700">
            Activity Timeline Log
          </h3>
          <div className="space-y-2 text-xs">
            {order.statusHistory &&
              order.statusHistory.map((sh, idx) => (
                <div key={idx} className="flex items-start gap-3 text-orange-700">
                  <div className="w-2 h-2 rounded-full bg-sunset-500 mt-1.5 shrink-0"></div>
                  <div className="flex-1">
                    <span className="font-bold text-orange-900">{sh.status}</span> — {sh.note}
                  </div>
                  <span className="text-orange-400 font-mono text-[11px]">
                    {new Date(sh.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Grid: Delivery Info & Itemized Bill */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Customer & Address Details */}
        <div className="md:col-span-5 bg-white rounded-3xl p-6 space-y-4 border border-orange-200 shadow-card-soft">
          <h3 className="font-serif font-bold text-orange-900 text-base flex items-center gap-2 border-b border-orange-100 pb-3">
            <MapPin className="w-4 h-4 text-sunset-500" />
            Delivery Destination
          </h3>

          <div className="space-y-3 text-xs text-orange-700">
            <div>
              <span className="text-orange-400 font-mono uppercase text-[10px] block">Recipient:</span>
              <span className="font-serif font-bold text-orange-900 text-sm">{order.customer.name}</span>
            </div>
            <div>
              <span className="text-orange-400 font-mono uppercase text-[10px] block">Phone:</span>
              <span className="font-mono text-orange-800">{order.customer.phone}</span>
            </div>
            <div>
              <span className="text-orange-400 font-mono uppercase text-[10px] block">Address:</span>
              <span className="text-orange-800 leading-relaxed block mt-0.5">
                {order.customer.address.street}, {order.customer.address.city} - {order.customer.address.pincode}
              </span>
            </div>
            <div className="pt-2 border-t border-orange-100 flex items-center gap-2 text-sunset-600">
              <ShieldCheck className="w-4 h-4" />
              <span>Paid via Razorpay (Test ID: {order.payment.razorpayPaymentId || 'Verified'})</span>
            </div>
          </div>
        </div>

        {/* Ordered Items Breakdown */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 space-y-4 border border-orange-200 shadow-card-soft">
          <h3 className="font-serif font-bold text-orange-900 text-base flex items-center gap-2 border-b border-orange-100 pb-3">
            <Pizza className="w-4 h-4 text-sunset-500" />
            Pizza Items ({order.items.length})
          </h3>

          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-orange-50 border border-orange-200/80 space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-serif font-bold text-orange-900">
                    {item.name} <span className="text-sunset-600 text-xs font-sans font-bold">x{item.quantity}</span>
                  </span>
                  <span className="font-serif font-extrabold text-sunset-700">₹{item.itemTotal}</span>
                </div>
                <div className="text-[11px] text-orange-500">
                  Crust: {item.base.name} • Sauce: {item.sauce.name} • Cheese: {item.cheese.name}
                  {item.veggies && item.veggies.length > 0 && (
                    <div className="text-sunset-600 font-medium">
                      Toppings: {item.veggies.map((v) => v.name).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="pt-3 border-t border-orange-100 space-y-1.5 text-xs text-orange-700">
            <div className="flex justify-between">
              <span className="text-orange-500">Subtotal:</span>
              <span>₹{order.pricing.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-500">Taxes (5% GST):</span>
              <span>₹{order.pricing.tax}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-500">Delivery Fee:</span>
              <span>{order.pricing.deliveryFee === 0 ? 'FREE' : `₹${order.pricing.deliveryFee}`}</span>
            </div>
            <div className="pt-2 border-t border-orange-100 flex justify-between text-base font-extrabold text-orange-900">
              <span>Total Paid:</span>
              <span className="text-sunset-700 font-serif text-xl">₹{order.pricing.total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


