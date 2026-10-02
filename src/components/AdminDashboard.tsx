import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, VendorApplication } from '../types';
import {
  Users,
  User,
  Store as StoreIcon,
  Bike,
  CreditCard,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  TrendingUp,
  Search,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  FileText,
  BadgeCheck,
  Trash2,
  Filter,
  Eye,
  X,
  Clock,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    stores,
    orders,
    applications,
    users,
    reviewApplication,
    toggleStoreLock,
    updateOrderStatus,
    updateUserRole,
    deleteUserAccount,
    renewSubscription,
  } = useApp();

  // Tab State
  const [activeTab, setActiveTab] = useState<'applications' | 'users' | 'stores' | 'deliveries'>('applications');

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | UserRole>('all');
  const [appStatusFilter, setAppStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [storeSearch, setStoreSearch] = useState('');
  const [selectedAppDetails, setSelectedAppDetails] = useState<VendorApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [appToReject, setAppToReject] = useState<VendorApplication | null>(null);

  // Financial & Operational Metrics
  const pendingApps = applications.filter((a) => a.status === 'pending');
  const activeStores = stores.filter((s) => s.subscriptionStatus !== 'suspended');
  const totalGMV = orders.reduce((sum, o) => sum + o.total, 0);
  const subscriptionMRR = stores.reduce(
    (sum, s) => sum + (s.subscriptionStatus === 'active' ? s.monthlyFee : 0),
    0
  );

  // Filtered Lists
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone.includes(userSearch);
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredApps = applications.filter((a) => {
    if (appStatusFilter === 'all') return true;
    return a.status === appStatusFilter;
  });

  const filteredStores = stores.filter((s) =>
    s.name.toLowerCase().includes(storeSearch.toLowerCase()) ||
    s.category.toLowerCase().includes(storeSearch.toLowerCase()) ||
    s.address.toLowerCase().includes(storeSearch.toLowerCase())
  );

  const handleOpenRejectModal = (app: VendorApplication) => {
    setAppToReject(app);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!appToReject) return;
    reviewApplication(appToReject.id, 'rejected', rejectionReason || 'Application requirements not satisfied');
    setIsRejectModalOpen(false);
    setAppToReject(null);
    setRejectionReason('');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Top Header & Platform Badge */}
      <div className="bg-linear-to-r from-slate-900 via-slate-900 to-orange-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-600 rounded-2xl text-white shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight">
                  ChowGrid Command Center
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/30">
                  Superadmin
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Multi-tenant vendor onboarding, KYC validation, user accounts, and platform governance
              </p>
            </div>
          </div>
        </div>

        {/* Live System Status Pill */}
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-md border border-white/10 text-xs self-start md:self-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">Supabase Realtime Live</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Approvals */}
        <div
          onClick={() => setActiveTab('applications')}
          className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-orange-500 shadow-xs space-y-2 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Pending KYC Approvals</span>
            <div className="p-2 bg-amber-50 group-hover:bg-amber-100 rounded-xl text-amber-700 transition">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">{pendingApps.length}</div>
          <p className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
            <span>Requires review & store setup</span>
          </p>
        </div>

        {/* Total Platform Members */}
        <div
          onClick={() => setActiveTab('users')}
          className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-orange-500 shadow-xs space-y-2 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Registered Users</span>
            <div className="p-2 bg-blue-50 group-hover:bg-blue-100 rounded-xl text-blue-700 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">{users.length}</div>
          <p className="text-[11px] text-blue-700 font-bold">
            {users.filter((u) => u.role === 'customer').length} Customers • {users.filter((u) => u.role === 'vendor').length} Vendors
          </p>
        </div>

        {/* Active Kitchens */}
        <div
          onClick={() => setActiveTab('stores')}
          className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-orange-500 shadow-xs space-y-2 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active Partner Stores</span>
            <div className="p-2 bg-emerald-50 group-hover:bg-emerald-100 rounded-xl text-emerald-700 transition">
              <StoreIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {activeStores.length} <span className="text-sm font-normal text-slate-400">/ {stores.length}</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-bold">₵{subscriptionMRR.toFixed(2)} monthly MRR</p>
        </div>

        {/* Total GMV */}
        <div
          onClick={() => setActiveTab('deliveries')}
          className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-orange-500 shadow-xs space-y-2 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Food Volume (GMV)</span>
            <div className="p-2 bg-orange-50 group-hover:bg-orange-100 rounded-xl text-orange-700 transition">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">₵{totalGMV.toFixed(2)}</div>
          <p className="text-[11px] text-orange-700 font-bold">{orders.length} total customer orders</p>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 flex-shrink-0 cursor-pointer ${
            activeTab === 'applications'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Vendor Applications ({applications.length})</span>
          {pendingApps.length > 0 && (
            <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
              {pendingApps.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 flex-shrink-0 cursor-pointer ${
            activeTab === 'users'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stores')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 flex-shrink-0 cursor-pointer ${
            activeTab === 'stores'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <StoreIcon className="w-4 h-4" />
          <span>Stores & Subscriptions ({stores.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('deliveries')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 flex-shrink-0 cursor-pointer ${
            activeTab === 'deliveries'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>Live Operations & OTPs ({orders.length})</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: VENDOR APPLICATIONS & KYC REVIEW */}
      {/* ==================================================================== */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-slate-900 font-['Outfit']">
                Vendor KYC & Restaurant Onboarding Queue
              </h3>
              <p className="text-xs text-slate-500">
                Review applicant identity (Ghana Card), kitchen physical address, MoMo payout setup, and approve store launch.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setAppStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                    appStatusFilter === st
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {filteredApps.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-700">No applications matching filter</h4>
              <p className="text-xs text-slate-400">All submitted applications have been processed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 hover:border-slate-300 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="font-black text-slate-900 text-lg font-['Outfit']">
                        {app.businessName}
                      </h4>
                      <span
                        className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border ${
                          app.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : app.status === 'pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        ● {app.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        Applied: {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-1.5 gap-x-4 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>Applicant: <strong className="text-slate-900">{app.applicantName}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>MoMo Phone: <strong className="text-slate-900">{app.phone}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>Email: <strong className="text-slate-900">{app.email}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-700">
                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>Ghana Card: <strong className="text-slate-900 font-mono">{app.ghanaCardNumber}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                        <span>Kitchen Address: {app.storeAddress}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-700">
                        <StoreIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>Cuisine: <strong className="text-orange-700">{app.foodType}</strong></span>
                      </div>
                    </div>

                    {app.notes && (
                      <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <strong className="text-slate-700">Notes / Menu:</strong> {app.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {app.status === 'pending' && (
                      <>
                        <button
                          onClick={() => reviewApplication(app.id, 'approved')}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve & Launch Store</span>
                        </button>

                        <button
                          onClick={() => handleOpenRejectModal(app)}
                          className="px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {app.status === 'approved' && (
                      <button
                        onClick={() => reviewApplication(app.id, 'suspended')}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Suspend Store
                      </button>
                    )}

                    {app.status === 'rejected' && (
                      <button
                        onClick={() => reviewApplication(app.id, 'approved')}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Re-evaluate & Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: USER DIRECTORY & MEMBERS */}
      {/* ==================================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-slate-900 font-['Outfit']">
                Registered Platform Members ({filteredUsers.length})
              </h3>
              <p className="text-xs text-slate-500">
                View all registered accounts, manage user roles (Customer, Vendor, Admin), and oversee permissions.
              </p>
            </div>

            {/* Search & Role Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search name, phone, email..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value as any)}
                className="w-full sm:w-auto bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-orange-500"
              >
                <option value="all">All Roles</option>
                <option value="customer">Customers</option>
                <option value="vendor">Vendors</option>
                <option value="admin">Administrators</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Contact Info</th>
                    <th className="p-4">Delivery Location</th>
                    <th className="p-4">Account Role</th>
                    <th className="p-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const userOrdersCount = orders.filter((o) => o.customerId === u.id).length;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                              alt={u.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                              <span className="text-[10px] text-slate-400 font-mono">{u.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 space-y-0.5">
                          <div className="flex items-center gap-1 text-slate-800 font-semibold">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{u.phone}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{u.email}</span>
                          </div>
                        </td>

                        <td className="p-4 text-slate-600 max-w-[200px] truncate">
                          {u.deliveryAddress || 'Accra, Ghana'}
                        </td>

                        <td className="p-4">
                          <select
                            value={u.role}
                            onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                            className={`font-bold text-xs rounded-xl px-2.5 py-1 border transition cursor-pointer ${
                              u.role === 'admin'
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : u.role === 'vendor'
                                ? 'bg-orange-50 text-orange-800 border-orange-200'
                                : 'bg-slate-100 text-slate-800 border-slate-200'
                            }`}
                          >
                            <option value="customer">Customer</option>
                            <option value="vendor">Vendor</option>
                            <option value="admin">Administrator</option>
                          </select>
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete account "${u.name}"?`)) {
                                deleteUserAccount(u.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete user account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: STORES & SUBSCRIPTIONS */}
      {/* ==================================================================== */}
      {activeTab === 'stores' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-slate-900 font-['Outfit']">
                All Marketplace Stores & Subscriptions
              </h3>
              <p className="text-xs text-slate-500">
                Lock/unlock active kitchens, monitor 7-day grace periods, and review monthly rental collections.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={storeSearch}
                onChange={(e) => setStoreSearch(e.target.value)}
                placeholder="Filter stores by name or area..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStores.map((store) => (
              <div
                key={store.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 bg-slate-50 flex-shrink-0"
                  />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-900 text-base font-['Outfit']">{store.name}</h4>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                          store.subscriptionStatus === 'active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : store.subscriptionStatus === 'grace_period'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {store.subscriptionStatus.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">{store.address} • {store.category}</p>
                    
                    <div className="flex items-center gap-3 text-xs pt-1">
                      <span className="font-bold text-orange-700 font-mono">₵{store.monthlyFee}.00/mo fee</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">Rating: ★ {store.rating} ({store.reviewCount})</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => renewSubscription(store.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-bold rounded-lg transition cursor-pointer"
                    >
                      Extend Subscription (+30 Days)
                    </button>
                  </div>

                  <button
                    onClick={() => toggleStoreLock(store.id)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      store.subscriptionStatus === 'suspended'
                        ? 'bg-rose-50 border-rose-300 text-rose-700'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {store.subscriptionStatus === 'suspended' ? <Lock className="w-3.5 h-3.5 text-rose-600" /> : <Unlock className="w-3.5 h-3.5 text-emerald-600" />}
                    <span>{store.subscriptionStatus === 'suspended' ? 'Unlock Store' : 'Emergency Lock'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: LIVE OPERATIONS & DUAL OTP MONITOR */}
      {/* ==================================================================== */}
      {activeTab === 'deliveries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 font-['Outfit']">
                Real-time Orders & Dual OTP Handshake Monitor
              </h3>
              <p className="text-xs text-slate-500">
                Track live order fulfillment, pickup OTP handovers to dispatch riders, and customer delivery completions.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-black text-slate-900 text-base">{order.orderNumber}</span>
                    <span
                      className={`uppercase font-black text-[10px] px-2.5 py-0.5 rounded-full ${
                        order.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                    <span className="text-slate-500">• {order.storeName}</span>
                    <span className="text-slate-400 font-mono">({new Date(order.createdAt).toLocaleTimeString()})</span>
                  </div>

                  <p className="text-slate-700">
                    Customer: <strong className="text-slate-900">{order.customerName}</strong> ({order.customerPhone}) → {order.deliveryAddress}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-slate-600 pt-1">
                    <span className="bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200">
                      Pickup OTP: <strong className="text-orange-700 font-mono text-sm">{order.pickupOtp}</strong>
                    </span>
                    <span className="bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      Delivery OTP: <strong className="text-emerald-700 font-mono text-sm">{order.deliveryOtp}</strong>
                    </span>
                    <span>Total Bill: <strong className="text-slate-900 font-mono text-sm">₵{order.total.toFixed(2)}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold text-xs transition cursor-pointer"
                    >
                      Force Complete Delivery
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {isRejectModalOpen && appToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">
                Reject Vendor Application
              </h3>
              <button onClick={() => setIsRejectModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Please specify the reason for rejecting <strong>"{appToReject.businessName}"</strong> (e.g. invalid Ghana Card, missing health clearance, unverified location).
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Ghana Card photo unclear, please re-submit with clear government ID..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
