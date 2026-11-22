import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  ArrowRight,
  AlertCircle,
  Sparkles,
  CheckCircle,
  Smartphone,
  Building2,
  Lock,
  XCircle,
  Check,
} from 'lucide-react';

export default function CartSummary() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, subtotal, tax, deliveryFee, total } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Customer delivery details form
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '9876543210',
    street: '221B Baker Street, Flat 4',
    city: 'Mumbai',
    pincode: '400001',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [pendingOrderDetails, setPendingOrderDetails] = useState(null);

  // Razorpay Gateway Simulator State
  const [paymentTab, setPaymentTab] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'instant'
  const [upiId, setUpiId] = useState('user@okhdfcbank');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [cardForm, setCardForm] = useState({
    number: '4111 1111 1111 1111',
    expiry: '12/28',
    cvv: '123',
    name: 'Mario Rossi',
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. Trigger Payment Flow
  const handleInitiateOrder = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage('Your pizza box is empty. Please add items to proceed.');
      return;
    }

    if (!formData.name || !formData.phone || !formData.street || !formData.city || !formData.pincode) {
      setErrorMessage('Please fill in all delivery destination details.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await API.post('/orders/create', {
        items: cartItems,
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: {
            street: formData.street,
            city: formData.city,
            pincode: formData.pincode,
          },
        },
      });

      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to create order');
      }

      const orderData = res.data;
      setPendingOrderDetails(orderData);

      // Check if standard Razorpay JS SDK is loaded and real API key is configured
      if (typeof window.Razorpay === 'function' && orderData.isRealKey) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amountPaise,
          currency: 'INR',
          name: 'Pizzeria Bella',
          description: `Order #${orderData.orderNumber} - Handcrafted Pizzas`,
          image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&auto=format&fit=crop&q=80',
          order_id: orderData.razorpayOrderId.startsWith('order_test_') ? undefined : orderData.razorpayOrderId,
          handler: async function (response) {
            await finalizePayment({
              orderId: orderData.orderId,
              razorpayOrderId: response.razorpay_order_id || orderData.razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
          },
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: '#f97316',
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        try {
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (failResp) {
            setErrorMessage(`Payment failed: ${failResp.error.description || 'Unknown error'}`);
            setLoading(false);
            setTestModalOpen(true);
          });
          rzp.open();
        } catch (rzpErr) {
          console.warn('Razorpay SDK modal error, showing fallback test modal:', rzpErr);
          setTestModalOpen(true);
        }
      } else {
        // Open the Razorpay Interactive Test Gateway
        setTestModalOpen(true);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Error creating order');
    } finally {
      setLoading(false);
    }
  };

  // 2. Finalize Payment & Stock Decrement
  const finalizePayment = async ({ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, testModeSuccess }) => {
    setIsProcessingPayment(true);
    setLoading(true);
    try {
      const res = await API.post('/orders/verify-payment', {
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        testModeSuccess,
      });

      if (res.data.success) {
        try {
          confetti({
            particleCount: 130,
            spread: 90,
            origin: { y: 0.6 },
          });
        } catch {}

        clearCart();
        navigate(`/orders/${res.data.order._id}`);
      } else {
        setErrorMessage(res.data.message || 'Payment verification failed');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Payment verification failed');
    } finally {
      setIsProcessingPayment(false);
      setLoading(false);
      setTestModalOpen(false);
    }
  };

  // 3. Handle Simulator Payment Execution
  const handleSimulatedPay = (method) => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      const randomHex = Math.random().toString(36).substring(2, 10).toUpperCase();
      const mockPayId = `pay_${method.toUpperCase()}_${randomHex}`;
      finalizePayment({
        orderId: pendingOrderDetails.orderId,
        razorpayOrderId: pendingOrderDetails.razorpayOrderId,
        razorpayPaymentId: mockPayId,
        testModeSuccess: true,
      });
    }, 900);
  };

  const handleSimulatedFailure = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setTestModalOpen(false);
      setErrorMessage('❌ Payment was declined or cancelled by issuing bank (Simulated Razorpay Failure). Cart preserved.');
    }, 600);
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto text-sunset-500 shadow-sunset-sm border border-orange-100">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-orange-900">Your Pizza Box is Empty</h2>
        <p className="text-orange-500 max-w-md mx-auto text-sm leading-relaxed">
          No wood-fired pies have been added yet. Choose from our signature specialties or sculpt your own recipe in the studio.
        </p>
        <div className="flex justify-center gap-4 pt-3">
          <Link
            to="/custom-builder"
            className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-sunset-rose via-sunset-500 to-sunset-gold hover:from-rose-600 hover:to-orange-500 text-white font-extrabold text-xs shadow-sunset-sm hover:scale-105 active:scale-95 transition-all"
          >
            ✨ Sculpt Custom Pizza
          </Link>
          <Link
            to="/"
            className="px-7 py-3.5 rounded-2xl bg-white text-stone-800 font-bold text-xs border border-orange-200 hover:border-sunset-300 hover:bg-orange-50 transition-all"
          >
            Browse Signature Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-orange-200 pb-4">
        <span className="text-xs uppercase font-mono font-bold tracking-widest text-sunset-600">
          Artisanal Checkout
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-orange-900 mt-1">
          Review Order & Confirm Payment
        </h1>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Itemized Pizza Box */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-orange-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-sunset-500" />
              Box Contents ({cartItems.length} items)
            </h2>
            <button
              onClick={clearCart}
              className="text-xs text-orange-400 hover:text-rose-600 transition-colors"
            >
              Empty Box
            </button>
          </div>

          <div className="space-y-3.5">
            {cartItems.map((item, index) => (
              <div
                key={index}
                className="p-5 rounded-3xl glass-checkout-card shadow-card-soft hover:shadow-sunset-sm hover:border-sunset-300 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-lg text-orange-900">{item.name}</span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-sunset-700">
                      {item.itemType === 'custom' ? 'Custom Studio' : 'Specialty'}
                    </span>
                  </div>

                  <div className="text-xs text-orange-500 space-y-0.5">
                    <div>
                      <span className="text-orange-400">Crust:</span> {item.base?.name} •{' '}
                      <span className="text-orange-400">Sauce:</span> {item.sauce?.name} •{' '}
                      <span className="text-orange-400">Cheese:</span> {item.cheese?.name}
                    </div>
                    {item.veggies && item.veggies.length > 0 && (
                      <div className="text-emerald-700">
                        <span className="text-orange-400">Toppings:</span>{' '}
                        {item.veggies.map((v) => v.name).join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-orange-100">
                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm p-1.5 rounded-xl border border-orange-200/70 shadow-xs">
                    <button
                      onClick={() => updateQuantity(index, item.quantity - 1)}
                      className="p-1 hover:bg-orange-100/70 rounded text-orange-600 hover:text-orange-900 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-orange-900 w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(index, item.quantity + 1)}
                      className="p-1 hover:bg-orange-100/70 rounded text-orange-600 hover:text-orange-900 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-serif font-extrabold text-sunset-700">₹{item.itemTotal}</div>
                    <div className="text-[10px] text-orange-400">(₹{item.unitPrice} each)</div>
                  </div>

                  <button
                    onClick={() => removeFromCart(index)}
                    className="p-2 text-orange-400 hover:text-rose-600 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              to="/custom-builder"
              className="text-xs font-bold text-sunset-600 hover:text-sunset-700 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Sculpt another custom pizza in studio
            </Link>
          </div>
        </div>

        {/* Right: Delivery Destination & Razorpay Checkout */}
        <div className="lg:col-span-5 space-y-6">
          {/* Destination Form */}
          <div className="glass-checkout-card rounded-3xl p-6 sm:p-7 space-y-4 shadow-card-soft relative overflow-hidden">
            <h3 className="font-serif font-bold text-orange-900 text-base flex items-center gap-2 border-b border-orange-200/50 pb-3">
              <MapPin className="w-4 h-4 text-sunset-500" />
              Delivery Destination
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-orange-600 block mb-1 font-mono uppercase tracking-wider text-[10px] font-bold">
                  Contact Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className="w-full bg-white/65 hover:bg-white/85 focus:bg-white/95 backdrop-blur-md border border-orange-200/80 focus:border-sunset-500 rounded-xl px-3.5 py-2.5 text-orange-950 font-medium focus:outline-none transition-all shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-orange-600 block mb-1 font-mono uppercase tracking-wider text-[10px] font-bold">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit phone"
                    className="w-full bg-white/65 hover:bg-white/85 focus:bg-white/95 backdrop-blur-md border border-orange-200/80 focus:border-sunset-500 rounded-xl px-3.5 py-2.5 text-orange-950 font-medium focus:outline-none transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="text-orange-600 block mb-1 font-mono uppercase tracking-wider text-[10px] font-bold">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="w-full bg-white/65 hover:bg-white/85 focus:bg-white/95 backdrop-blur-md border border-orange-200/80 focus:border-sunset-500 rounded-xl px-3.5 py-2.5 text-orange-950 font-medium focus:outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-orange-600 block mb-1 font-mono uppercase tracking-wider text-[10px] font-bold">
                    Street Address & Flat
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="House/Street"
                    className="w-full bg-white/65 hover:bg-white/85 focus:bg-white/95 backdrop-blur-md border border-orange-200/80 focus:border-sunset-500 rounded-xl px-3.5 py-2.5 text-orange-950 font-medium focus:outline-none transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="text-orange-600 block mb-1 font-mono uppercase tracking-wider text-[10px] font-bold">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="Pincode"
                    className="w-full bg-white/65 hover:bg-white/85 focus:bg-white/95 backdrop-blur-md border border-orange-200/80 focus:border-sunset-500 rounded-xl px-3.5 py-2.5 text-orange-950 font-medium focus:outline-none transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="glass-checkout-card rounded-3xl p-6 sm:p-7 space-y-4 shadow-card-soft relative overflow-hidden">
            <h3 className="font-serif font-bold text-orange-900 text-base border-b border-orange-200/50 pb-3">
              Order Receipt
            </h3>

            <div className="space-y-2.5 text-xs text-orange-700">
              <div className="flex justify-between">
                <span className="text-orange-500">Cart Subtotal</span>
                <span className="font-bold text-orange-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-500">GST (5%)</span>
                <span className="font-bold text-orange-900">₹{tax}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-500">Delivery Fee</span>
                <span className="font-bold text-orange-900">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE (&gt; ₹500)</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-orange-200/50 flex justify-between items-center text-base">
                <span className="font-bold text-orange-900">Grand Total:</span>
                <span className="text-3xl font-serif font-extrabold text-sunset-700">₹{total}</span>
              </div>
            </div>

            {/* Razorpay Trigger */}
            <div className="pt-2 space-y-3">
              <div className="p-4 bg-orange-100/60 backdrop-blur-md rounded-2xl text-[11px] text-orange-950 flex items-start gap-2.5 border border-orange-200/70">
                <ShieldCheck className="w-4 h-4 text-sunset-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Razorpay Test Mode:</strong> Clicking below opens the checkout dialog. Clicking <strong>Success</strong> confirms your order and decrements inventory!
                </span>
              </div>

              <button
                disabled={loading}
                onClick={handleInitiateOrder}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-sunset-rose via-sunset-500 to-sunset-gold hover:from-rose-600 hover:to-orange-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sunset-md hover:shadow-sunset-lg transition-all hover:scale-102 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Connecting to Payment Gateway...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Pay ₹{total} via Razorpay (Test Mode)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          AUTHENTIC RAZORPAY TEST GATEWAY MODAL (GLASS FADE)
      ══════════════════════════════════════════════════════ */}
      {testModalOpen && pendingOrderDetails && (
        <div className="fixed inset-0 z-50 glass-modal-overlay flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="glass-modal-card rounded-3xl max-w-lg w-full overflow-hidden my-8 animate-scale-up text-stone-900 relative">
            
            {/* Ambient decorative glow spheres inside modal */}
            <div className="absolute -top-16 -right-16 w-52 h-52 bg-gradient-to-br from-sunset-500/20 via-amber-400/15 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-gradient-to-tr from-emerald-500/15 via-teal-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Razorpay Brand Header (Translucent Sapphire Glass) */}
            <div className="glass-modal-header text-white p-6 relative overflow-hidden">
              {/* Top ambient glowing accent line */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300" />

              <div className="flex items-center justify-between pb-3 border-b border-white/15 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    ₹
                  </div>
                  <span className="font-mono text-xs font-black tracking-wider text-blue-200 uppercase">
                    Razorpay Gateway
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black bg-gradient-to-r from-amber-400 to-amber-300 text-stone-950 shadow-xs">
                    TEST MODE
                  </span>
                </div>
                <button
                  onClick={() => !isProcessingPayment && setTestModalOpen(false)}
                  disabled={isProcessingPayment}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all text-xs"
                  title="Close payment gateway"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-end justify-between pt-3 relative z-10">
                <div>
                  <h3 className="font-serif font-black text-lg text-white">Pizzeria Bella</h3>
                  <p className="text-xs text-blue-200/80 font-mono">Order #{pendingOrderDetails.orderNumber}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-blue-300 uppercase tracking-widest font-mono block">Amount Payable</span>
                  <span className="text-2xl font-serif font-black text-white font-mono">₹{pendingOrderDetails.amount}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector Tabs (Translucent Frosted Pill) */}
            <div className="flex border-b border-orange-200/40 bg-white/40 backdrop-blur-md overflow-x-auto text-xs font-bold p-1.5 gap-1.5">
              {[
                { id: 'upi', label: '📱 UPI / QR' },
                { id: 'card', label: '💳 Cards' },
                { id: 'netbanking', label: '🏦 Netbanking' },
                { id: 'instant', label: '⚡ 1-Click Fast' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPaymentTab(tab.id)}
                  disabled={isProcessingPayment}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-center whitespace-nowrap transition-all border ${
                    paymentTab === tab.id
                      ? 'bg-white/90 backdrop-blur-md text-orange-950 font-black shadow-xs border-orange-400/50'
                      : 'border-transparent text-stone-600 hover:text-stone-950 hover:bg-white/40'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 relative z-10">

              {/* ── TAB 1: UPI ── */}
              {paymentTab === 'upi' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { name: 'Google Pay', icon: '🟢 GPay' },
                      { name: 'PhonePe', icon: '🟣 PhonePe' },
                      { name: 'Paytm UPI', icon: '🔵 Paytm' },
                    ].map((app) => (
                      <button
                        key={app.name}
                        onClick={() => setUpiId(`${formData.phone}@${app.name.toLowerCase().replace(' ', '')}`)}
                        className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all backdrop-blur-md ${
                          upiId.includes(app.name.toLowerCase().replace(' ', ''))
                            ? 'bg-orange-500/15 border-orange-500 text-orange-950 shadow-xs ring-1 ring-orange-400 scale-[1.02]'
                            : 'bg-white/60 hover:bg-white/90 border-white/80 text-stone-700 hover:scale-[1.02]'
                        }`}
                      >
                        <div className="text-sm">{app.icon}</div>
                        <div className="text-[10px] text-stone-500 mt-1">{app.name}</div>
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="text-stone-700 text-[11px] font-mono font-black uppercase tracking-wider block mb-1">
                      UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. yourname@okhdfcbank"
                      className="w-full bg-white/65 hover:bg-white/85 focus:bg-white/95 backdrop-blur-md border border-white/90 focus:border-sunset-500 rounded-xl px-4 py-2.5 text-xs text-stone-900 font-mono font-bold shadow-inner focus:outline-none transition-all"
                    />
                  </div>

                  <p className="text-[11px] text-stone-500 font-medium">
                    Test Mode: Simulated Razorpay UPI collect request will approve automatically.
                  </p>
                </div>
              )}

              {/* ── TAB 2: CARDS ── */}
              {paymentTab === 'card' && (
                <div className="space-y-3.5">
                  <div className="p-3 bg-blue-500/10 backdrop-blur-md border border-blue-300/40 rounded-2xl text-[11px] text-blue-950 font-bold flex items-center justify-between">
                    <span>💳 Razorpay Official Test Card Loaded</span>
                    <span className="text-[10px] font-mono bg-blue-200/80 px-2 py-0.5 rounded-full font-bold">VISA</span>
                  </div>

                  <div>
                    <label className="text-stone-700 text-[10px] font-mono font-black uppercase tracking-wider block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardForm.number}
                      onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                      className="w-full bg-white/65 hover:bg-white/85 focus:bg-white/95 backdrop-blur-md border border-white/90 focus:border-sunset-500 rounded-xl px-3.5 py-2 text-xs text-stone-900 font-mono font-bold shadow-inner focus:outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-stone-700 text-[10px] font-mono font-black uppercase tracking-wider block mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={cardForm.expiry}
                        onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                        className="w-full bg-white/65 hover:bg-white/85 focus:bg-white/95 backdrop-blur-md border border-white/90 focus:border-sunset-500 rounded-xl px-3.5 py-2 text-xs text-stone-900 font-mono font-bold shadow-inner focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-stone-700 text-[10px] font-mono font-black uppercase tracking-wider block mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        maxLength="3"
                        value={cardForm.cvv}
                        onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                        className="w-full bg-white/65 hover:bg-white/85 focus:bg-white/95 backdrop-blur-md border border-white/90 focus:border-sunset-500 rounded-xl px-3.5 py-2 text-xs text-stone-900 font-mono font-bold shadow-inner focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-stone-700 text-[10px] font-mono font-black uppercase tracking-wider block mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardForm.name}
                      onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                      className="w-full bg-white/65 hover:bg-white/85 focus:bg-white/95 backdrop-blur-md border border-white/90 focus:border-sunset-500 rounded-xl px-3.5 py-2 text-xs text-stone-900 font-bold shadow-inner focus:outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* ── TAB 3: NETBANKING ── */}
              {paymentTab === 'netbanking' && (
                <div className="space-y-3.5">
                  <label className="text-stone-700 text-[11px] font-mono font-black uppercase tracking-wider block">
                    Select Popular Bank
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Punjab National'].map((bank) => (
                      <button
                        key={bank}
                        onClick={() => setSelectedBank(bank)}
                        className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between backdrop-blur-md ${
                          selectedBank === bank
                            ? 'bg-orange-500/15 border-orange-500 text-orange-950 font-black shadow-xs ring-1 ring-orange-400 scale-[1.02]'
                            : 'bg-white/60 hover:bg-white/90 border-white/80 text-stone-700 hover:scale-[1.02]'
                        }`}
                      >
                        <span>{bank}</span>
                        {selectedBank === bank && <Check className="w-3.5 h-3.5 text-orange-600 stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── TAB 4: 1-CLICK INSTANT ── */}
              {paymentTab === 'instant' && (
                <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-rose-500/10 backdrop-blur-md p-5 rounded-2xl border border-orange-200/70 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 text-white flex items-center justify-center font-bold text-xl mx-auto shadow-sunset-xs">
                    ⚡
                  </div>
                  <h4 className="font-serif font-black text-stone-950 text-base">Instant Sandbox Checkout</h4>
                  <p className="text-xs text-stone-600 max-w-sm mx-auto font-medium">
                    Simulates a verified 200 OK Razorpay payment in 1 click, decrements kitchen ingredient stocks, and generates live tracking.
                  </p>
                </div>
              )}

              {/* Processing Spinner State */}
              {isProcessingPayment && (
                <div className="p-4 bg-orange-100/80 backdrop-blur-md border border-orange-300/70 rounded-2xl flex items-center justify-center gap-3 text-orange-950 font-bold text-xs animate-pulse shadow-sm">
                  <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                  <span>Authorizing ₹{pendingOrderDetails.amount} with Razorpay Sandbox...</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-orange-200/40">
                <button
                  disabled={isProcessingPayment}
                  onClick={() => handleSimulatedPay(paymentTab)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  Pay ₹{pendingOrderDetails.amount} (Simulate Success)
                </button>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    disabled={isProcessingPayment}
                    onClick={handleSimulatedFailure}
                    className="text-[11px] text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 p-1 hover:underline disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Simulate Payment Failure
                  </button>

                  <span className="text-[10px] text-stone-500 font-mono flex items-center gap-1 font-semibold">
                    <ShieldCheck className="w-3 h-3 text-stone-500" />
                    256-bit SSL Encrypted
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}

