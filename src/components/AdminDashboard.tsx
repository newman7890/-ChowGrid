import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Store as StoreIcon,
  Bike,
  CreditCard,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    stores,
    orders,
    applications,
    reviewApplication,
    toggleStoreLock,
    updateOrderStatus,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'applications' | 'stores' | 'deliveries'>('applications');

  const pendingApps = applications.filter((a) => a.status === 'pending');
  const activeStores = stores.filter((s) => s.subscriptionStatus !== 'suspended');
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const subscriptionMRR = stores.reduce((sum, s) => sum + (s.subscriptionStatus === 'active' ? s.monthlyFee : 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 font-['Outfit']">Platform Administration</h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200">
              Superadmin
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Vendor approvals, store controls, subscription revenue & delivery oversight
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Pending Approvals</span>
            <Users className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{pendingApps.length}</div>
          <p className="text-[11px] text-orange-700 font-medium">Requires KYC review</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active Stores</span>
            <StoreIcon className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{activeStores.length} / {stores.length}</div>
          <p className="text-[11px] text-emerald-700 font-medium">Active & listed</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Monthly Subscription MRR</span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">₵{subscriptionMRR.toFixed(2)}</div>
          <p className="text-[11px] text-blue-700 font-medium">Vendor store fees</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Food GMV</span>
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">₵{totalRevenue.toFixed(2)}</div>
          <p className="text-[11px] text-orange-700 font-medium">{orders.length} food deliveries</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'applications'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Vendor Applications ({applications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stores')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'stores'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <StoreIcon className="w-3.5 h-3.5" />
          <span>Stores & Subscriptions ({stores.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('deliveries')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'deliveries'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Bike className="w-3.5 h-3.5" />
          <span>Live Operations Feed ({orders.length})</span>
        </button>
      </div>

      {/* Tab 1: Vendor Applications */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 font-['Outfit']">Vendor Approval Queue</h3>
            <span className="text-xs text-slate-500">KYC verification & business registration check</span>
          </div>

          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-slate-900 text-base font-['Outfit']">{app.businessName}</h4>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        app.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700">
                    Applicant: <strong className="text-slate-900">{app.applicantName}</strong> • {app.phone} • {app.email}
                  </p>

                  <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                    <span>GhanaCard: <strong className="text-slate-700 font-mono">{app.ghanaCardNumber}</strong></span>
                    <span>Address: {app.storeAddress}</span>
                    <span>Cuisine: {app.foodType}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {app.status !== 'approved' && (
                    <button
                      onClick={() => reviewApplication(app.id, 'approved')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Store</span>
                    </button>
                  )}

                  {app.status !== 'rejected' && app.status !== 'approved' && (
                    <button
                      onClick={() => reviewApplication(app.id, 'rejected')}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold rounded-xl text-xs transition flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}

                  {app.status === 'approved' && (
                    <button
                      onClick={() => reviewApplication(app.id, 'suspended')}
                      className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:text-rose-600 rounded-xl text-xs"
                    >
                      Suspend
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Store Management & Subscriptions */}
      {activeTab === 'stores' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 font-['Outfit']">All Platform Stores</h3>
            <span className="text-xs text-slate-500">Lock, unlock, and manage store subscriptions</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stores.map((store) => (
              <div
                key={store.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-50"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm font-['Outfit']">{store.name}</h4>
                    <p className="text-xs text-slate-500">{store.address}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-orange-700">
                        Monthly Rent: ₵{store.monthlyFee}/mo
                      </span>
                      <span className="text-[10px] text-slate-300">•</span>
                      <span className="text-[10px] text-slate-500">Status: {store.subscriptionStatus}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleStoreLock(store.id)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                    store.subscriptionStatus === 'suspended'
                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {store.subscriptionStatus === 'suspended' ? <Lock className="w-4 h-4 text-rose-600" /> : <Unlock className="w-4 h-4 text-emerald-600" />}
                  <span>{store.subscriptionStatus === 'suspended' ? 'Locked' : 'Active'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Live Operations Feed */}
      {activeTab === 'deliveries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 font-['Outfit']">Real-time Orders & OTP Monitor</h3>
            <span className="text-xs text-slate-500">Track dual OTP handshakes and delivery resolution</span>
          </div>

          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">{order.orderNumber}</span>
                    <span className="uppercase font-bold text-[10px] px-2 py-0.5 rounded bg-orange-100 text-orange-800">
                      {order.status.replace('_', ' ')}
                    </span>
                    <span className="text-slate-500">• {order.storeName}</span>
                  </div>

                  <p className="text-slate-700">
                    Customer: <strong className="text-slate-900">{order.customerName}</strong> ({order.customerPhone}) → {order.deliveryAddress}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-slate-500 pt-1">
                    <span>Pickup OTP: <strong className="text-orange-600 font-mono">{order.pickupOtp}</strong></span>
                    <span>Delivery OTP: <strong className="text-emerald-600 font-mono">{order.deliveryOtp}</strong></span>
                    <span>Total: <strong className="text-slate-900 font-mono">₵{order.total.toFixed(2)}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {order.status !== 'delivered' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold text-xs transition"
                    >
                      Admin Force Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
