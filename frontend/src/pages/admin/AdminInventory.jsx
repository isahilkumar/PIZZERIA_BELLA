import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import {
  Boxes,
  Plus,
  Minus,
  Edit2,
  AlertTriangle,
  CheckCircle,
  Bell,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Search,
  Sparkles,
} from 'lucide-react';

export default function AdminInventory() {
  const [inventory, setInventory] = useState({
    base: [],
    sauce: [],
    cheese: [],
    veggie: [],
  });
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing Item Modal state
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    stockQuantity: 0,
    threshold: 20,
    price: 0,
    badge: '',
    description: '',
  });

  // Stock check trigger state
  const [checkingStock, setCheckingStock] = useState(false);
  const [stockCheckResult, setStockCheckResult] = useState(null);
  const [actionNotice, setActionNotice] = useState('');

  const fetchInventory = async () => {
    try {
      const res = await API.get('/inventory');
      if (res.data.success) {
        setInventory(res.data.grouped);
        setAllItems(res.data.items);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleQuickAdjust = async (item, amount) => {
    const newQty = Math.max(0, item.stockQuantity + amount);
    try {
      const res = await API.put(`/inventory/${item._id}`, {
        stockQuantity: newQty,
      });
      if (res.data.success) {
        setActionNotice(`Updated ${item.name} stock to ${newQty}`);
        setTimeout(() => setActionNotice(''), 3000);
        fetchInventory();
      }
    } catch (err) {
      alert('Failed to update stock');
    }
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditFormData({
      name: item.name,
      stockQuantity: item.stockQuantity,
      threshold: item.threshold,
      price: item.price,
      badge: item.badge || '',
      description: item.description || '',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const res = await API.put(`/inventory/${editingItem._id}`, editFormData);
      if (res.data.success) {
        setEditingItem(null);
        setActionNotice(`Saved changes for ${editingItem.name}`);
        setTimeout(() => setActionNotice(''), 3000);
        fetchInventory();
      }
    } catch (err) {
      alert('Error updating item details');
    }
  };

  const handleTriggerStockCheck = async () => {
    setCheckingStock(true);
    setStockCheckResult(null);
    try {
      const res = await API.post('/inventory/check-alerts');
      if (res.data.success) {
        setStockCheckResult(res.data.result);
      }
    } catch (err) {
      alert('Failed to execute stock check: ' + (err.response?.data?.message || err.message));
    } finally {
      setCheckingStock(false);
    }
  };

  const displayedItems = allItems.filter((item) => {
    if (activeTab !== 'all' && item.category !== activeTab) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const lowStockCount = allItems.filter((i) => i.stockQuantity < i.threshold).length;

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-orange-500 font-mono text-xs font-bold uppercase tracking-wider">Loading Kitchen Inventory Stocks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-stone-900">
      {/* Toast alert notice */}
      {actionNotice && (
        <div className="bg-emerald-900 text-white px-5 py-3 rounded-2xl font-black text-xs shadow-xl flex items-center gap-2.5 animate-slide-up border border-emerald-700">
          <CheckCircle className="w-4 h-4 text-emerald-400 stroke-[3]" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Top Overview & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-orange-200/80 pb-6">
        <div>
          <span className="text-xs uppercase font-mono font-black tracking-widest text-orange-600 block">
            Real-Time Ingredient Levels
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-stone-950 mt-1 tracking-tight">
            Kitchen Inventory Dashboard
          </h1>
          <p className="text-stone-600 text-xs font-semibold mt-1">
            Tracking bases, sauces, cheeses, and vegetables. Quantities automatically decrement after every completed order.
          </p>
        </div>

        {/* Action: Trigger Stock Alert Check */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchInventory}
            className="p-3 bg-white hover:bg-orange-50 rounded-xl text-stone-700 hover:text-stone-950 border border-orange-200 shadow-xs transition-colors"
            title="Refresh Stock Table"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleTriggerStockCheck}
            disabled={checkingStock}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white font-black text-xs flex items-center gap-2 shadow-sunset-sm transition-transform active:scale-95 disabled:opacity-50"
          >
            <Bell className={`w-4 h-4 ${checkingStock ? 'animate-spin' : ''}`} />
            {checkingStock ? 'Scanning Inventory...' : 'Run Stock Check & Notify'}
          </button>
        </div>
      </div>

      {/* Low Stock Alert Result Card */}
      {stockCheckResult && (
        <div className="bg-white rounded-3xl p-6 shadow-sunset-sm border border-rose-300 space-y-4">
          <div className="flex items-center justify-between border-b border-orange-100 pb-3">
            <div className="flex items-center gap-2 text-rose-700 font-black text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Node-Cron Automated Stock Check Result</span>
            </div>
            <button
              onClick={() => setStockCheckResult(null)}
              className="text-xs text-stone-500 hover:text-stone-900 font-bold"
            >
              Dismiss
            </button>
          </div>

          <p className="text-xs text-stone-700 font-semibold">{stockCheckResult.message}</p>

          {stockCheckResult.hasLowStock && (
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-orange-800">
                Found {stockCheckResult.count} item(s) below configured safety threshold:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {stockCheckResult.lowStockItems.map((item) => (
                  <div
                    key={item._id}
                    className="p-3 bg-rose-50 rounded-xl text-xs flex justify-between items-center border border-rose-200"
                  >
                    <div>
                      <span className="font-serif font-black text-stone-950 block">{item.name}</span>
                      <span className="text-[10px] text-stone-600 font-bold capitalize">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-rose-700 block font-mono">{item.stockQuantity} left</span>
                      <span className="text-[10px] text-stone-500 font-bold">(Threshold: {item.threshold})</span>
                    </div>
                  </div>
                ))}
              </div>

              {stockCheckResult.emailResult?.previewUrl && (
                <div className="pt-2">
                  <a
                    href={stockCheckResult.emailResult.previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-100 text-orange-800 border border-orange-300 text-xs font-black hover:bg-orange-200 transition-colors"
                  >
                    <span>View Dispatched Alert Email Preview</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-admin-subcard p-5 rounded-2xl shadow-sm">
          <div className="text-[10px] font-mono font-black text-stone-500 uppercase tracking-widest">Total Ingredients</div>
          <div className="text-3xl font-serif font-black text-stone-950 mt-1 font-mono">{allItems.length}</div>
          <div className="text-[11px] text-stone-500 font-bold mt-0.5">Bases, Sauces, Cheeses, Veggies</div>
        </div>

        <div className="glass-admin-subcard p-5 rounded-2xl shadow-sm">
          <div className="text-[10px] font-mono font-black text-amber-700 uppercase tracking-widest">Low Stock Warnings</div>
          <div className="text-3xl font-serif font-black text-amber-600 mt-1 font-mono">{lowStockCount}</div>
          <div className="text-[11px] text-amber-700 font-bold mt-0.5">Below safety threshold</div>
        </div>

        <div className="glass-admin-subcard p-5 rounded-2xl shadow-sm">
          <div className="text-[10px] font-mono font-black text-emerald-800 uppercase tracking-widest">Auto-Decrement</div>
          <div className="text-3xl font-serif font-black text-emerald-700 mt-1">Active</div>
          <div className="text-[11px] text-stone-500 font-bold mt-0.5">Decrements per order payment</div>
        </div>

        <div className="glass-admin-subcard p-5 rounded-2xl shadow-sm">
          <div className="text-[10px] font-mono font-black text-blue-800 uppercase tracking-widest">Node-Cron Monitor</div>
          <div className="text-3xl font-serif font-black text-blue-700 mt-1">Running</div>
          <div className="text-[11px] text-stone-500 font-bold mt-0.5">Every 15 min stock scan</div>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl overflow-x-auto glass-admin-subcard">
          {[
            { id: 'all', label: `All (${allItems.length})` },
            { id: 'base', label: `Bases (${inventory.base.length})` },
            { id: 'sauce', label: `Sauces (${inventory.sauce.length})` },
            { id: 'cheese', label: `Cheeses (${inventory.cheese.length})` },
            { id: 'veggie', label: `Vegetables (${inventory.veggie.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap backdrop-blur-md ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-sunset-xs'
                  : 'bg-white/50 text-stone-800 hover:text-stone-950 hover:bg-white/80 border border-white/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ingredient..."
            className="w-full glass-admin-subcard rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-950 font-bold focus:outline-none focus:border-orange-500 placeholder:text-stone-400 shadow-xs"
          />
        </div>
      </div>

      {/* Inventory Table — BOLD, CRISP, HIGH CONTRAST */}
      <div className="glass-admin-card rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950/90 backdrop-blur-md text-white uppercase tracking-widest font-mono text-[10px] border-b border-white/10">
              <tr>
                <th className="p-4 font-black">Ingredient Name</th>
                <th className="p-4 font-black">Category</th>
                <th className="p-4 font-black">Portion Price</th>
                <th className="p-4 font-black">Current Stock</th>
                <th className="p-4 font-black">Safety Threshold</th>
                <th className="p-4 font-black">Status</th>
                <th className="p-4 font-black text-right">Quick Stock Adjust</th>
                <th className="p-4 font-black text-center">Edit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100/50 bg-white/45 backdrop-blur-md">
              {displayedItems.map((item) => {
                const isOut = item.stockQuantity === 0;
                const isLow = item.stockQuantity < item.threshold;

                return (
                  <tr key={item._id} className="hover:bg-orange-50/50 transition-colors">
                    {/* Column 1: Name & Description */}
                    <td className="p-4 font-bold text-stone-950">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-black text-sm text-stone-950">{item.name}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-300">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-600 font-semibold block line-clamp-1 mt-0.5">
                        {item.description}
                      </span>
                    </td>

                    {/* Column 2: Category */}
                    <td className="p-4 capitalize text-stone-800 font-black text-xs">
                      {item.category}
                    </td>

                    {/* Column 3: Portion Price */}
                    <td className="p-4 font-serif font-black text-orange-600 text-sm font-mono">
                      ₹{item.price}
                    </td>

                    {/* Column 4: Current Stock */}
                    <td className="p-4 font-mono font-black text-sm">
                      <span className={isOut ? 'text-rose-600' : isLow ? 'text-amber-700' : 'text-stone-950'}>
                        {item.stockQuantity} {item.unit || 'units'}
                      </span>
                    </td>

                    {/* Column 5: Safety Threshold */}
                    <td className="p-4 text-stone-700 font-black text-xs font-mono">
                      {item.threshold} units
                    </td>

                    {/* Column 6: Status */}
                    <td className="p-4">
                      {isOut ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3 stroke-[2.5]" /> Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3 stroke-[2.5] text-amber-600 animate-pulse" /> Low Stock
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3 stroke-[2.5] text-emerald-600" /> In Stock
                        </span>
                      )}
                    </td>

                    {/* Column 7: Quick Adjust Buttons */}
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1 bg-orange-50 p-1 rounded-xl border border-orange-200">
                        <button
                          onClick={() => handleQuickAdjust(item, -5)}
                          className="px-2 py-1 rounded-lg bg-white hover:bg-rose-100 text-rose-700 font-black text-xs border border-orange-200 shadow-xs transition-colors"
                          title="Decrement 5"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => handleQuickAdjust(item, -1)}
                          className="px-2 py-1 rounded-lg bg-white hover:bg-rose-100 text-rose-700 font-black text-xs border border-orange-200 shadow-xs transition-colors"
                          title="Decrement 1"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleQuickAdjust(item, 1)}
                          className="px-2 py-1 rounded-lg bg-white hover:bg-emerald-100 text-emerald-800 font-black text-xs border border-orange-200 shadow-xs transition-colors"
                          title="Add 1"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => handleQuickAdjust(item, 10)}
                          className="px-2 py-1 rounded-lg bg-white hover:bg-emerald-100 text-emerald-800 font-black text-xs border border-orange-200 shadow-xs transition-colors"
                          title="Restock +10"
                        >
                          +10
                        </button>
                      </div>
                    </td>

                    {/* Column 8: Edit Details */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-2 rounded-xl bg-orange-50 hover:bg-gradient-to-r hover:from-orange-500 hover:to-rose-500 hover:text-white text-stone-700 border border-orange-200 transition-all shadow-xs"
                        title="Edit Item & Threshold"
                      >
                        <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT INVENTORY MODAL - Luxury Frosted Glass */}
      {editingItem && (
        <div className="fixed inset-0 z-50 glass-modal-overlay flex items-center justify-center p-4">
          <div className="glass-modal-card rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-scale-up text-stone-900 border border-white/80">
            <div className="flex justify-between items-center border-b border-orange-200/40 pb-4">
              <div>
                <h3 className="font-serif font-black text-lg text-stone-950">Manual Stock & Threshold Editor</h3>
                <p className="text-xs text-orange-600 font-mono font-bold">Editing: {editingItem.name}</p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-stone-400 hover:text-stone-900 text-sm font-black p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="text-stone-700 block mb-1 font-mono uppercase tracking-wider text-[10px] font-black">
                  Item Name
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full bg-orange-50/50 rounded-xl px-3.5 py-2.5 text-stone-950 font-bold focus:outline-none focus:border-orange-500 border border-orange-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-700 block mb-1 font-mono uppercase tracking-wider text-[10px] font-black">
                    Current Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.stockQuantity}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, stockQuantity: Number(e.target.value) })
                    }
                    className="w-full bg-orange-50/50 rounded-xl px-3.5 py-2.5 text-stone-950 font-black focus:outline-none focus:border-orange-500 border border-orange-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-stone-700 block mb-1 font-mono uppercase tracking-wider text-[10px] font-black">
                    Safety Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editFormData.threshold}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, threshold: Number(e.target.value) })
                    }
                    className="w-full bg-orange-50/50 rounded-xl px-3.5 py-2.5 text-stone-950 font-black focus:outline-none focus:border-orange-500 border border-orange-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-700 block mb-1 font-mono uppercase tracking-wider text-[10px] font-black">
                    Portion Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.price}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, price: Number(e.target.value) })
                    }
                    className="w-full bg-orange-50/50 rounded-xl px-3.5 py-2.5 text-stone-950 font-black focus:outline-none focus:border-orange-500 border border-orange-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-stone-700 block mb-1 font-mono uppercase tracking-wider text-[10px] font-black">
                    Badge / Tag
                  </label>
                  <input
                    type="text"
                    value={editFormData.badge}
                    onChange={(e) => setEditFormData({ ...editFormData, badge: e.target.value })}
                    placeholder="e.g. Popular, Vegan"
                    className="w-full bg-orange-50/50 rounded-xl px-3.5 py-2.5 text-stone-950 font-bold focus:outline-none focus:border-orange-500 border border-orange-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-700 block mb-1 font-mono uppercase tracking-wider text-[10px] font-black">
                  Description
                </label>
                <textarea
                  rows="2"
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, description: e.target.value })
                  }
                  className="w-full bg-orange-50/50 rounded-xl px-3.5 py-2.5 text-stone-950 font-semibold focus:outline-none focus:border-orange-500 border border-orange-200"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-orange-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white font-black shadow-sunset-sm"
                >
                  Save Stock & Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
