import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import chowgridLogo from '../assets/chowgrid-logo.png';
import {
  ShoppingBag,
  Store as StoreIcon,
  User,
  ChevronRight,
  Search,
  LogIn,
  LogOut,
  ChevronDown,
  UserCheck,
  Store,
  Settings,
  ShieldCheck,
} from 'lucide-react';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenOrderTracker: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onOpenOrderTracker,
  searchTerm,
  setSearchTerm,
  onOpenSettings,
}) => {
  const {
    role,
    setRole,
    cart,
    orders,
    activeTrackOrderId,
    currentUser,
    logout,
    setIsAuthModalOpen,
  } = useApp();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const activeOrder = orders.find(
    (o) =>
      o.id === activeTrackOrderId &&
      o.status !== 'delivered' &&
      o.status !== 'completed' &&
      o.status !== 'cancelled'
  );

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Logo */}
          <div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group flex-shrink-0 min-w-0"
            onClick={() => setRole('customer')}
          >
            <img
              src={chowgridLogo}
              alt="ChowGrid"
              className="h-9 w-9 sm:h-11 sm:w-11 object-contain rounded-lg sm:rounded-xl shadow-xs border border-slate-100 flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 font-['Outfit'] truncate">
                  Chow<span className="text-orange-600">Grid</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider bg-orange-50 text-orange-700 border border-orange-200 px-1.5 py-0.5 rounded">
                  Ghana
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block truncate">
                Good Food. Great Choices.
              </p>
            </div>
          </div>

          {/* Search Bar (Customer Marketplace Mode - Desktop) */}
          {role === 'customer' && (
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Waakye, Jollof, Banku, Tilapia..."
                  className="w-full bg-slate-100/80 hover:bg-slate-100 border border-slate-200 rounded-full pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 transition"
                />
              </div>
            </div>
          )}

          {/* Right Header Navigation */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {/* If Vendor / Admin: Show Back to Marketplace link */}
            {role !== 'customer' && (
              <button
                onClick={() => setRole('customer')}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                <User className="w-3.5 h-3.5 text-orange-600" />
                <span className="hidden sm:inline">Marketplace</span>
              </button>
            )}

            {/* Live Order Indicator (for Customers) */}
            {activeOrder && (
              <button
                onClick={onOpenOrderTracker}
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-800 rounded-xl text-[11px] sm:text-xs font-semibold hover:bg-orange-100 transition shadow-xs flex-shrink-0"
              >
                <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse flex-shrink-0" />
                <span className="capitalize font-bold">
                  {activeOrder.status.replace('_', ' ')}
                </span>
                <ChevronRight className="w-3 h-3 hidden sm:inline" />
              </button>
            )}

            {/* User Account / Login Button */}
            <div className="relative flex-shrink-0">
              {currentUser ? (
                <div>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl sm:rounded-2xl transition"
                  >
                    <img
                      src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={currentUser.name}
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-slate-300 flex-shrink-0"
                    />
                    <div className="hidden md:block text-left text-xs">
                      <div className="font-bold text-slate-800 leading-tight truncate max-w-[90px]">
                        {currentUser.name}
                      </div>
                      <div className="text-[10px] text-orange-700 uppercase font-semibold">
                        {currentUser.role}
                      </div>
                    </div>
                    <ChevronDown className="w-3 h-3 text-slate-500 hidden sm:block" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 sm:w-60 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 space-y-1">
                      <div className="p-2.5 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser.email || currentUser.phone}</p>
                        <span
                          className={`inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                            currentUser.role === 'admin'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : currentUser.role === 'vendor'
                              ? 'bg-orange-50 text-orange-700 border-orange-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {currentUser.role === 'admin'
                            ? '🛡️ Platform Administrator'
                            : currentUser.role === 'vendor'
                            ? '🍳 Vendor Partner'
                            : 'Customer Account'}
                        </span>
                      </div>

                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            setRole('admin');
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-purple-700 hover:bg-purple-50 rounded-xl transition flex items-center gap-2"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                          <span>Admin Console</span>
                        </button>
                      )}

                      {currentUser.role === 'vendor' && (
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            setRole('vendor');
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-orange-700 hover:bg-orange-50 rounded-xl transition flex items-center gap-2"
                        >
                          <Store className="w-3.5 h-3.5 text-orange-600" />
                          <span>Kitchen Hub</span>
                        </button>
                      )}

                      {currentUser.role === 'customer' && (
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onOpenOrderTracker();
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition flex items-center gap-2"
                        >
                          <span>📦 My Orders</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onOpenSettings();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition flex items-center gap-2"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-600" />
                        <span>Account Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-2 border-t border-slate-100 pt-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl sm:rounded-2xl text-xs font-bold transition shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 sm:px-4 sm:py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl sm:rounded-2xl font-bold flex items-center gap-1.5 sm:gap-2 shadow-sm transition active:scale-95 flex-shrink-0"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              <span className="hidden sm:inline text-sm">Cart</span>
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 sm:static bg-white text-orange-700 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full font-extrabold shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
