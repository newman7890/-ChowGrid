import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import chowgridLogo from '../assets/chowgrid-logo.png';
import {
  X,
  Lock,
  Phone,
  Mail,
  User,
  MapPin,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Store,
  ShieldCheck,
  ArrowRight,
  Loader2,
  KeyRound,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    loginWithCredentials,
    registerCustomer,
    loginWithOAuth,
    resetPassword,
    users,
    loginAsUser,
  } = useApp();

  // Tab & Flow states
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<UserRole>('customer');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showDemoProfiles, setShowDemoProfiles] = useState(false);

  // Form Fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  // UI status
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; text: string } | null>(null);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setFeedback(null);
    setIsForgotPassword(false);
    setPassword('');
  };

  // Sign In submit
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setFeedback({ success: false, text: 'Please enter your email or Ghana phone number.' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await loginWithCredentials(identifier, password, role);
      if (res.success) {
        setFeedback({ success: true, text: res.message });
        setTimeout(() => {
          handleClose();
        }, 600);
      } else {
        setFeedback({ success: false, text: res.message });
      }
    } catch (err: any) {
      setFeedback({ success: false, text: err.message || 'Unable to sign in. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up submit
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setFeedback({ success: false, text: 'Full name and active phone number are required.' });
      return;
    }

    if (password && password.length < 6) {
      setFeedback({ success: false, text: 'Password must be at least 6 characters.' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const formattedPhone = phone.startsWith('+233') ? phone : `+233 ${phone.replace(/^0/, '')}`;
      const res = await registerCustomer(fullName, formattedPhone, email, address, password, role);
      if (res.success) {
        setFeedback({ success: true, text: res.message });
        setTimeout(() => {
          handleClose();
        }, 600);
      } else {
        setFeedback({ success: false, text: res.message });
      }
    } catch (err: any) {
      setFeedback({ success: false, text: err.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password submit
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setFeedback({ success: false, text: 'Please enter your registered email address.' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await resetPassword(resetEmail);
      if (res.success) {
        setFeedback({ success: true, text: res.message });
        setTimeout(() => {
          setIsForgotPassword(false);
        }, 2000);
      } else {
        setFeedback({ success: false, text: res.message });
      }
    } catch (err: any) {
      setFeedback({ success: false, text: err.message || 'Password reset request failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth submit
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await loginWithOAuth('google');
      if (!res.success) {
        setFeedback({ success: false, text: res.message });
      } else {
        setFeedback({ success: true, text: res.message });
        setTimeout(() => handleClose(), 500);
      }
    } catch (err: any) {
      setFeedback({ success: false, text: err.message || 'Google authentication failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border border-slate-200/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col transition-all">
        
        {/* Top Header & Branding */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">
                <img
                  src={chowgridLogo}
                  alt="ChowGrid Logo"
                  className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-xl"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black tracking-tight text-white font-['Outfit']">
                    Chow<span className="text-orange-400">Grid</span>
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-orange-500/20 text-orange-300 border border-orange-400/30 px-2 py-0.5 rounded-full">
                    Ghana 🇬🇭
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {isForgotPassword
                    ? 'Account Recovery & Password Reset'
                    : tab === 'signup'
                    ? 'Join Ghana’s Premier Food Delivery Network'
                    : 'Sign in to access your orders & favorites'}
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/15 transition-all duration-200 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Persona / Role Selector Pills */}
          {!isForgotPassword && (
            <div className="mt-5 grid grid-cols-3 gap-1.5 p-1 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setRole('customer');
                  setFeedback(null);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  role === 'customer'
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-900/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Customer</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('vendor');
                  setFeedback(null);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  role === 'vendor'
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-900/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Vendor Hub</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('admin');
                  setFeedback(null);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  role === 'admin'
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-900/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-5 overflow-y-auto flex-1">
          
          {/* Main Auth Tabs (Sign In vs Create Account) */}
          {!isForgotPassword && role === 'customer' && (
            <div className="flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  setFeedback(null);
                }}
                className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-all cursor-pointer ${
                  tab === 'signin'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('signup');
                  setFeedback(null);
                }}
                className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-all cursor-pointer ${
                  tab === 'signup'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Feedback Toast */}
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                feedback.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedback.success ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Social Auth (Google) - Only for customer sign in/up */}
          {!isForgotPassword && role === 'customer' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 shadow-xs flex items-center justify-center gap-2.5 transition active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  or with email & phone
                </span>
              </div>
            </div>
          )}

          {/* FORGOT PASSWORD FORM */}
          {isForgotPassword ? (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-orange-600" />
                  <span>Your Account Email</span>
                </label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="e.g. kwame.mensah@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-3 focus:ring-orange-500/15 transition"
                />
                <p className="text-[11px] text-slate-500">
                  We will send an encrypted password recovery link directly to your inbox.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Send Password Reset Link</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setFeedback(null);
                  }}
                  className="text-xs text-slate-600 font-bold hover:text-orange-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>← Back to Sign In</span>
                </button>
              </div>
            </form>
          ) : tab === 'signup' && role === 'customer' ? (
            /* CREATE ACCOUNT FORM (Customer) */
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-orange-600" />
                  <span>Full Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Kwame Mensah"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-orange-600" />
                  <span>Ghana Phone Number (MoMo Enabled) *</span>
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3 rounded-l-2xl border border-r-0 border-slate-200 bg-slate-100 text-xs font-bold text-slate-700 select-none">
                    🇬🇭 +233
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="24 991 2233"
                    className="w-full bg-slate-50 border border-slate-200 rounded-r-2xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-orange-600" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kwame.mensah@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-orange-600" />
                  <span>Create Password (Min 6 Characters)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-3.5 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-600" />
                  <span>Default Delivery Location / Area</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. East Legon Hills, Accra"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* SIGN IN FORM (Customer / Vendor / Admin) */
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    {role === 'customer' ? <Phone className="w-3.5 h-3.5 text-orange-600" /> : <Mail className="w-3.5 h-3.5 text-orange-600" />}
                    <span>
                      {role === 'vendor'
                        ? 'Vendor Business Email or Phone'
                        : role === 'admin'
                        ? 'Administrator Email'
                        : 'Phone Number or Email'}
                    </span>
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    role === 'vendor'
                      ? 'aunty.muni@gmail.com'
                      : role === 'admin'
                      ? 'admin@chowgrid.gh'
                      : '024 991 2233 or kwame@gmail.com'
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-3 focus:ring-orange-500/15 transition"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-orange-600" />
                    <span>Password</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setResetEmail(identifier.includes('@') ? identifier : '');
                      setFeedback(null);
                    }}
                    className="text-xs text-orange-600 font-bold hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-11 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-3 focus:ring-orange-500/15 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {role === 'vendor'
                        ? 'Sign In to Vendor Hub'
                        : role === 'admin'
                        ? 'Access Administration'
                        : 'Sign In to ChowGrid'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ⚡ ONE-CLICK DEMO PERSONAS TOOLBOX */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowDemoProfiles(!showDemoProfiles)}
              className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-between transition cursor-pointer"
            >
              <span className="flex items-center gap-1.5 text-orange-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Click Fast Demo Logins (Testing Sandbox)</span>
              </span>
              {showDemoProfiles ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            {showDemoProfiles && (
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      loginAsUser(u);
                      handleClose();
                    }}
                    className="p-2.5 bg-white border border-slate-200 hover:border-orange-500 hover:bg-orange-50/40 rounded-xl text-left transition group shadow-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={u.name}
                        className="w-6 h-6 rounded-full object-cover border border-slate-200"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-slate-800 truncate group-hover:text-orange-600">
                          {u.name}
                        </p>
                        <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          {u.role}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer / Legal Notice */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 flex-shrink-0">
          <span>Protected by 256-bit Supabase SSL</span>
          <span className="font-semibold">ChowGrid Ghana v2.4</span>
        </div>
      </div>
    </div>
  );
};
