import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
} from 'lucide-react';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenOrderTracker: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onOpenRiderSandbox: () => void;
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setRole('customer')}
          >
            <img
              src="/chowgrid-logo.png"
              alt="ChowGrid"
              className="h-12 w-12 object-contain rounded-xl shadow-xs border border-slate-100"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-['Outfit']">
                  Chow<span className="text-orange-600">Grid</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-orange-50 text-orange-700 border border-orange-200 px-1.5 py-0.5 rounded">
                  Ghana
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Good Food. Great Choices.
              </p>
            </div>
          </div>

          {/* Search Bar (Customer Marketplace Mode) */}
          {role === 'customer' && (
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Waakye, Jollof, Banku, Tilapia, or Vendor..."
                  className="w-full bg-slate-100/80 hover:bg-slate-100 border border-slate-200 rounded-full pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 transition"
                />
              </div>
            </div>
          )}

          {/* Right Header Navigation */}
          <div className="flex items-center gap-3">
            {/* If Customer: Show "Sell on ChowGrid / Vendor Portal" button */}
            {role === 'customer' && (
              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                }}
                className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Vendor Portal</span>
              </button>
            )}

            {/* If Vendor / Admin: Show Back to Marketplace link */}
            {role !== 'customer' && (
              <button
                onClick={() => setRole('customer')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                <User className="w-3.5 h-3.5 text-orange-600" />
                <span>Customer Marketplace</span>
              </button>
            )}

            {/* Settings Quick Access Button */}
            <button
              onClick={onOpenSettings}
              title="Account & App Settings"
              className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition border border-transparent hover:border-slate-200"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Live Order Indicator (for Customers) */}
            {activeOrder && (
              <button
                onClick={onOpenOrderTracker}
                className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 text-orange-800 rounded-xl text-xs font-semibold hover:bg-orange-100 transition shadow-xs"
              >
                <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
                <span className="hidden md:inline">Track {activeOrder.orderNumber}</span>
                <span className="capitalize text-[11px] bg-orange-200/80 text-orange-900 px-1.5 py-0.5 rounded font-bold">
                  {activeOrder.status.replace('_', ' ')}
                </span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}

            {/* User Account / Login Button */}
            <div className="relative">
              {currentUser ? (
                <div>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-2xl transition"
                  >
                    <img
                      src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-300"
                    />
                    <div className="hidden sm:block text-left text-xs">
                      <div className="font-bold text-slate-800 leading-tight truncate max-w-[100px]">
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
                    <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 space-y-1">
                      <div className="p-2.5 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser.email || currentUser.phone}</p>
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
                          {currentUser.role} Account
                        </span>
                      </div>

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
                          setIsAuthModalOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition flex items-center gap-2"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-orange-600" />
                        <span>Switch Persona / Portal</span>
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
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 sm:px-4 sm:py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold flex items-center gap-2 shadow-sm transition active:scale-95"
            >
              <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
              <span className="hidden sm:inline text-sm">Cart</span>
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 sm:static bg-white text-orange-700 text-xs px-2 py-0.5 rounded-full font-extrabold shadow-xs">
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
