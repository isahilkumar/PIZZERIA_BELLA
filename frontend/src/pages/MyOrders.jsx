import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { Clock, Pizza, ChevronRight, ShoppingBag, AlertCircle } from 'lucide-react';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get('/orders/my-orders');
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-4 border-sunset-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-orange-500 font-mono text-xs">Loading order history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-orange-200 pb-4">
        <span className="text-xs uppercase font-mono font-bold tracking-widest text-sunset-600">
          Order History
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-orange-900 mt-1">
          My Pizza Orders
        </h1>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-14 text-center space-y-4 border border-orange-200 shadow-card-soft">
          <ShoppingBag className="w-12 h-12 text-orange-400 mx-auto" />
          <h3 className="text-2xl font-serif font-bold text-orange-900">No Orders Placed Yet</h3>
          <p className="text-orange-500 text-sm max-w-sm mx-auto leading-relaxed">
            You haven't ordered any pizzas yet. Browse our signature specials or sculpt your own recipe.
          </p>
          <div className="pt-2">
            <Link
              to="/custom-builder"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-sunset-rose via-sunset-500 to-sunset-gold hover:from-rose-600 hover:to-orange-500 text-white font-extrabold text-xs shadow-sunset-sm hover:scale-105 active:scale-95 transition-all"
            >
              Start Custom Order
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isDelivered = order.status === 'Delivered';

            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl p-6 shadow-card-soft border border-orange-200 hover:border-sunset-300 hover:shadow-sunset-sm transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-serif font-bold text-orange-900 text-lg">#{order.orderNumber}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isDelivered
                          ? 'bg-orange-100 text-orange-800 border border-orange-200'
                          : 'bg-sunset-100 text-sunset-700 border border-sunset-300 animate-pulse'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <p className="text-xs text-orange-500">
                    {new Date(order.createdAt).toLocaleDateString()} at{' '}
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                    {order.items.length} item(s)
                  </p>

                  <div className="text-xs text-orange-600">
                    {order.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-orange-100">
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-orange-400 uppercase tracking-widest font-bold">Total Paid</div>
                    <div className="text-xl font-serif font-extrabold text-sunset-700">₹{order.pricing.total}</div>
                  </div>

                  <Link
                    to={`/orders/${order._id}`}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sunset-rose to-sunset-500 hover:from-rose-600 hover:to-orange-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sunset-sm active:scale-95"
                  >
                    Track Live
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

