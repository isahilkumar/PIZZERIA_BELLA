import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Mail, RefreshCw, ExternalLink, Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function AdminEmails() {
  const [emails, setEmails] = useState([]);
  const [alertStatus, setAlertStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [notice, setNotice] = useState('');

  const fetchEmailData = async () => {
    try {
      const res = await API.get('/inventory/alert-status');
      if (res.data.success) {
        setEmails(res.data.recentEmails || []);
        setAlertStatus(res.data.alertStatus);
      }
    } catch (err) {
      console.error('Failed to load email log:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailData();
  }, []);

  const handleTriggerAlert = async () => {
    setTriggering(true);
    try {
      const res = await API.post('/inventory/check-alerts');
      if (res.data.success) {
        setNotice(res.data.result.message);
        fetchEmailData();
        setTimeout(() => setNotice(''), 4000);
      }
    } catch (err) {
      alert('Failed to trigger alert check');
    } finally {
      setTriggering(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-orange-600 font-mono text-xs font-bold uppercase tracking-wider">Loading Nodemailer Email Records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-stone-900">
      {notice && (
        <div className="bg-emerald-900 text-white font-black px-5 py-3 rounded-2xl text-xs flex items-center gap-2.5 animate-slide-up border border-emerald-700 shadow-md">
          <CheckCircle className="w-4 h-4 text-emerald-400 stroke-[3]" />
          <span>{notice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-orange-200/80 pb-6">
        <div>
          <span className="text-xs uppercase font-mono font-black tracking-widest text-orange-600 block">
            Nodemailer & Node-Cron Monitor
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-stone-950 mt-1 tracking-tight">
            Automated Notifications & Audit Log
          </h1>
          <p className="text-stone-600 text-xs font-semibold mt-1">
            Inspect all emails dispatched by the platform (Verification, Password Reset, Low Stock Admin Alerts, Order Receipts). Ethereal preview links allow live browser inspection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchEmailData}
            className="p-3 bg-white hover:bg-orange-50 rounded-xl text-stone-800 border border-orange-200 shadow-xs transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleTriggerAlert}
            disabled={triggering}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white font-black text-xs flex items-center gap-2 shadow-sunset-sm transition-transform active:scale-95"
          >
            <Bell className="w-4 h-4" />
            {triggering ? 'Checking...' : 'Trigger Low-Stock Alert Email'}
          </button>
        </div>
      </div>

      {/* Cron Info Card */}
      <div className="glass-admin-card rounded-3xl p-6 sm:p-8 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-admin-subcard p-4 rounded-2xl">
          <span className="text-[10px] font-mono uppercase font-black tracking-widest text-stone-500 block">
            Scheduled Job Status
          </span>
          <div className="text-xl font-serif font-black text-emerald-700 flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            Node-Cron Active
          </div>
          <span className="text-xs text-stone-600 font-bold mt-1 block">
            Scanning stock every 15 minutes
          </span>
        </div>

        <div className="glass-admin-subcard p-4 rounded-2xl">
          <span className="text-[10px] font-mono uppercase font-black tracking-widest text-stone-500 block">
            Last Alert Sent
          </span>
          <div className="text-xl font-serif font-black text-stone-950 mt-1">
            {alertStatus?.lastAlertSentAt
              ? new Date(alertStatus.lastAlertSentAt).toLocaleTimeString()
              : 'None yet in this cycle'}
          </div>
          <span className="text-xs text-stone-600 font-bold mt-1 block">
            {alertStatus?.lastAlertItems?.length || 0} item(s) flagged below threshold
          </span>
        </div>

        <div className="glass-admin-subcard p-4 rounded-2xl">
          <span className="text-[10px] font-mono uppercase font-black tracking-widest text-stone-500 block">
            Admin Alert Recipient
          </span>
          <div className="text-base font-serif font-black text-orange-600 font-mono mt-1">
            admin@pizzadelivery.com
          </div>
          <span className="text-xs text-stone-600 font-bold mt-1 block">
            Configured in .env (ADMIN_EMAIL)
          </span>
        </div>
      </div>

      {/* Sent Emails Table */}
      <div className="glass-admin-card rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 bg-stone-950/90 backdrop-blur-md text-white flex justify-between items-center border-b border-white/10">
          <h3 className="font-serif font-black text-white text-base flex items-center gap-2">
            <Mail className="w-4 h-4 text-orange-400" />
            Recent Outgoing Emails ({emails.length})
          </h3>
          <span className="text-xs text-stone-300 font-mono font-bold">Captured in memory for test preview</span>
        </div>

        {emails.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-600 font-bold space-y-2">
            <p>No emails dispatched in this session yet.</p>
            <p>Register a user, place an order, or click "Trigger Low-Stock Alert Email" above!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-900/90 text-white uppercase tracking-widest font-mono text-[10px]">
                <tr>
                  <th className="p-4 font-black">Timestamp</th>
                  <th className="p-4 font-black">Recipient</th>
                  <th className="p-4 font-black">Subject</th>
                  <th className="p-4 font-black text-right">HTML Preview Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100/50 bg-white/45 backdrop-blur-md">
                {emails.map((email, idx) => (
                  <tr key={idx} className="hover:bg-orange-50/50 transition-colors">
                    <td className="p-4 font-mono text-stone-700 font-bold whitespace-nowrap">
                      {new Date(email.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-4 font-black text-stone-950 font-mono">{email.to}</td>
                    <td className="p-4 text-stone-800 font-semibold">{email.subject}</td>
                    <td className="p-4 text-right">
                      {email.previewUrl ? (
                        <a
                          href={email.previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-100 text-orange-800 border border-orange-300 hover:bg-orange-200 font-black transition-colors"
                        >
                          <span>Open Ethereal Preview</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-stone-500 text-[11px] font-mono font-bold">Direct SMTP</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
