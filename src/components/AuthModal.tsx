import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import chowgridLogo from '../assets/chowgrid-logo.png';
import {
  X,
  Lock,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Store,
  ShieldCheck,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    loginWithCredentials,
    registerCustomer,
  } = useApp();

  const [authMode, setAuthMode] = useState<'login' | 'register' | 'vendor_login' | 'admin_login'>('login');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+233 ');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [feedback, setFeedback] = useState<{ success: boolean; text: string } | null>(null);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setFeedback({ success: false, text: 'Please enter your phone number or email.' });
      return;
    }

    const targetRole = authMode === 'vendor_login' ? 'vendor' : authMode === 'admin_login' ? 'admin' : 'customer';
    const res = loginWithCredentials(identifier, targetRole);
    
    if (res.success) {
      setFeedback({ success: true, text: res.message });
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setFeedback(null);
      }, 700);
    } else {
      setFeedback({ success: false, text: res.message });
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setFeedback({ success: false, text: 'Please provide your full name and phone number.' });
      return;
    }

    const newUser = registerCustomer(name, phone, email, address);
    setFeedback({ success: true, text: `Welcome to ChowGrid, ${newUser.name}!` });
    setTimeout(() => {
      setIsAuthModalOpen(false);
      setFeedback(null);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <img
              src={chowgridLogo}
              alt="ChowGrid"
              className="w-11 h-11 object-contain rounded-xl border border-slate-100 shadow-xs"
            />
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-['Outfit']">
                {authMode === 'register'
                  ? 'Create Account'
                  : authMode === 'vendor_login'
                  ? 'Vendor Partner Portal'
                  : authMode === 'admin_login'
                  ? 'Platform Administration'
                  : 'Welcome to ChowGrid'}
              </h3>
              <p className="text-xs text-slate-500">
                {authMode === 'register'
                  ? 'Sign up for fast ordering & delivery'
                  : authMode === 'vendor_login'
                  ? 'Sign in to manage your kitchen & orders'
                  : authMode === 'admin_login'
                  ? 'Sign in with administrator credentials'
                  : 'Sign in to your customer account'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsAuthModalOpen(false);
              setFeedback(null);
            }}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Feedback */}
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                feedback.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedback.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Form Content */}
          {authMode === 'register' ? (
            /* Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-medium">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kwame Mensah"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-medium">Ghana Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+233 24 991 2233"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-medium">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kwame@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-medium">Delivery Address / Area</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. East Legon Hills, Accra"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl text-sm transition shadow-sm mt-2"
              >
                Create Customer Account
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setFeedback(null);
                  }}
                  className="text-xs text-orange-600 font-semibold hover:underline"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </form>
          ) : (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-medium">
                  {authMode === 'vendor_login'
                    ? 'Vendor Business Email or Phone'
                    : authMode === 'admin_login'
                    ? 'Administrator Email'
                    : 'Ghana Phone Number or Email'}
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    {authMode === 'login' ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      authMode === 'vendor_login'
                        ? 'muni.waakye@gmail.com'
                        : authMode === 'admin_login'
                        ? 'admin@chowgrid.gh'
                        : '+233 24 991 2233 or email'
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-medium">
                  {authMode === 'login' ? 'Password or SMS Code' : 'Password'}
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl text-sm transition shadow-sm mt-2"
              >
                {authMode === 'vendor_login'
                  ? 'Sign In to Vendor Hub'
                  : authMode === 'admin_login'
                  ? 'Sign In to Admin Panel'
                  : 'Sign In'}
              </button>

              {authMode === 'login' && (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setFeedback(null);
                    }}
                    className="text-xs text-orange-600 font-semibold hover:underline"
                  >
                    New to ChowGrid? Create Account
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Partner & Admin Access Links */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            {authMode !== 'login' ? (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setFeedback(null);
                }}
                className="text-slate-600 hover:text-slate-900 font-medium"
              >
                ← Back to Customer Login
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('vendor_login');
                  setFeedback(null);
                }}
                className="text-slate-500 hover:text-orange-600 font-medium flex items-center gap-1.5 mx-auto"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Store Partner / Vendor Portal</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
