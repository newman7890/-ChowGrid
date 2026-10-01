import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  User,
  MapPin,
  CreditCard,
  Bell,
  Lock,
  Store,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  DollarSign,
  ChefHat,
  FileText,
  Sparkles,
  AlertCircle,
  BadgeCheck,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    currentUser,
    role,
    stores,
    activeVendorStoreId,
    applications,
    submitVendorApplication,
    setIsAuthModalOpen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'payments' | 'notifications' | 'seller_application' | 'store_settings'>('profile');

  // Customer Profile State
  const [name, setName] = useState(currentUser?.name || 'Kwame Mensah');
  const [email, setEmail] = useState(currentUser?.email || 'kwame.mensah@gmail.com');
  const [phone, setPhone] = useState(currentUser?.phone || '+233 24 991 2233');

  // Seller Application Form State
  const [appBusinessName, setAppBusinessName] = useState('');
  const [appCategory, setAppCategory] = useState('Waakye & Local Dishes');
  const [appAddress, setAppAddress] = useState('');
  const [appGhanaCard, setAppGhanaCard] = useState('');
  const [appPhone, setAppPhone] = useState(currentUser?.phone || '+233 ');
  const [appEmail, setAppEmail] = useState(currentUser?.email || '');
  const [appApplicantName, setAppApplicantName] = useState(currentUser?.name || '');
  const [appMomoPayout, setAppMomoPayout] = useState('+233 ');
  const [appSubmitted, setAppSubmitted] = useState(false);

  // Saved Addresses State
  const [addresses, setAddresses] = useState<
    { id: string; label: string; address: string; isDefault: boolean }[]
  >([
    {
      id: 'addr-1',
      label: 'Home',
      address: 'House 14, East Legon Hills, Accra (Near Shell)',
      isDefault: true,
    },
    {
      id: 'addr-2',
      label: 'Work / Office',
      address: 'Silver Star Tower, Airport City, 4th Floor',
      isDefault: false,
    },
  ]);
  const [newAddrLabel, setNewAddrLabel] = useState('Other');
  const [newAddrText, setNewAddrText] = useState('');
  const [showAddAddress, setShowAddAddress] = useState(false);

  // Notification Preferences
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [whatsappReceipts, setWhatsappReceipts] = useState(true);
  const [promoEmails, setPromoEmails] = useState(false);

  // Vendor Store Settings State
  const currentStore = stores.find((s) => s.id === activeVendorStoreId) || stores[0];
  const [storeName, setStoreName] = useState(currentStore.name);
  const [storeTagline, setStoreTagline] = useState(currentStore.tagline);
  const [storePhone, setStorePhone] = useState(currentStore.phone);
  const [storeAddress, setStoreAddress] = useState(currentStore.address);
  const [prepTime, setPrepTime] = useState(currentStore.prepTimeEstimate);
  const [openingHours, setOpeningHours] = useState(currentStore.scheduledHours);
  const [payoutMomo, setPayoutMomo] = useState('+233 24 123 4567');

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Check if current user has an application
  const myApplication = applications.find(
    (a) =>
      a.phone === currentUser?.phone ||
      a.email === currentUser?.email ||
      a.applicantName.toLowerCase() === currentUser?.name.toLowerCase()
  );

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setPhone(currentUser.phone);
      setAppApplicantName(currentUser.name);
      setAppPhone(currentUser.phone);
      setAppEmail(currentUser.email);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSellerApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appBusinessName.trim() || !appAddress.trim() || !appGhanaCard.trim()) {
      return;
    }

    submitVendorApplication({
      applicantName: appApplicantName || name,
      businessName: appBusinessName,
      phone: appPhone || phone,
      email: appEmail || email,
      storeAddress: appAddress,
      ghanaCardNumber: appGhanaCard,
      foodType: appCategory,
      notes: `MoMo Payout Number: ${appMomoPayout}`,
    });

    setAppSubmitted(true);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrText.trim()) return;

    setAddresses((prev) => [
      ...prev,
      {
        id: `addr-${Date.now()}`,
        label: newAddrLabel,
        address: newAddrText.trim(),
        isDefault: prev.length === 0,
      },
    ]);
    setNewAddrText('');
    setShowAddAddress(false);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  };

  return (
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-8 flex flex-col md:flex-row min-h-[520px] md:min-h-[580px] max-h-[92vh] md:max-h-[85vh]">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-['Outfit']">Settings</h3>
            <p className="text-[11px] text-slate-500">Preferences & account settings</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Horizontal Tab Strip (Hidden on Desktop) */}
        <div className="md:hidden flex items-center gap-1.5 p-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === 'profile'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === 'addresses'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Addresses</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === 'payments'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Payments</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === 'notifications'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alerts</span>
          </button>

          <button
            onClick={() => setActiveTab('seller_application')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === 'seller_application'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Apply as Seller</span>
            {myApplication && (
              <span className="text-[9px] px-1 py-0.2 rounded font-bold uppercase bg-amber-200 text-amber-900">
                {myApplication.status}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              onClose();
              setIsAuthModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 flex-shrink-0 bg-orange-50 text-orange-700 border border-orange-200"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Vendor Portal</span>
          </button>

          {role === 'vendor' && (
            <button
              onClick={() => setActiveTab('store_settings')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 flex-shrink-0 ${
                activeTab === 'store_settings'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Store</span>
            </button>
          )}
        </div>

        {/* Desktop Left Settings Sidebar (Hidden on Mobile) */}
        <div className="hidden md:flex w-64 bg-slate-50 border-r border-slate-200 p-6 flex-col justify-between flex-shrink-0">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-['Outfit']">Settings</h3>
              <p className="text-xs text-slate-500">Preferences & account settings</p>
            </div>

            <nav className="space-y-1 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center gap-2.5 ${
                  activeTab === 'profile'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Personal Profile</span>
              </button>

              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center gap-2.5 ${
                  activeTab === 'addresses'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Saved Addresses</span>
              </button>

              <button
                onClick={() => setActiveTab('payments')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center gap-2.5 ${
                  activeTab === 'payments'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Payment Methods</span>
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center gap-2.5 ${
                  activeTab === 'notifications'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>Notifications & SMS</span>
              </button>

              <button
                onClick={() => setActiveTab('seller_application')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center justify-between gap-2 ${
                  activeTab === 'seller_application'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ChefHat className="w-4 h-4" />
                  <span>Apply as Seller</span>
                </div>
                {myApplication && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                      myApplication.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : myApplication.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {myApplication.status}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  onClose();
                  setIsAuthModalOpen(true);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center gap-2.5 text-slate-700 hover:bg-orange-50 hover:text-orange-700 font-semibold border border-dashed border-slate-200"
              >
                <Store className="w-4 h-4 text-orange-600" />
                <span>Vendor Portal</span>
              </button>

              {role === 'vendor' && (
                <button
                  onClick={() => setActiveTab('store_settings')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center gap-2.5 ${
                    activeTab === 'store_settings'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>Store & Kitchen Profile</span>
                </button>
              )}
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-400">
            <span>ChowGrid v0.1 • Ghana</span>
          </div>
        </div>

        {/* Right Settings Content */}
        <div className="flex-1 p-4 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[calc(92vh-110px)] md:max-h-[85vh]">
          <div>
            {/* Desktop Top Close Button */}
            <div className="hidden md:flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
              <h4 className="text-lg font-bold text-slate-900 font-['Outfit']">
                {activeTab === 'profile' && 'Personal Profile'}
                {activeTab === 'addresses' && 'Saved Delivery Locations'}
                {activeTab === 'payments' && 'Payment Preferences'}
                {activeTab === 'notifications' && 'Notification Settings'}
                {activeTab === 'seller_application' && 'Vendor Partner Application'}
                {activeTab === 'store_settings' && 'Store Configuration'}
              </h4>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Save Toast Feedback */}
            {saveSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Settings saved successfully!</span>
              </div>
            )}

            {/* Tab 1: Personal Profile */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex items-center gap-4 pb-2">
                  <img
                    src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt="Profile"
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs"
                  />
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">{name}</h5>
                    <p className="text-xs text-slate-500 capitalize">{role} Account</p>
                    <button
                      type="button"
                      className="mt-1 text-xs text-orange-600 hover:underline font-semibold"
                    >
                      Change Photo
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-600 font-medium">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-600 font-medium">Ghana Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-600 font-medium">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </form>
            )}

            {/* Tab 2: Saved Addresses */}
            {activeTab === 'addresses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">Manage delivery locations for quick 1-click checkout</p>
                  <button
                    onClick={() => setShowAddAddress(!showAddAddress)}
                    className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Address</span>
                  </button>
                </div>

                {showAddAddress && (
                  <form onSubmit={handleAddAddress} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <h5 className="text-xs font-bold text-slate-800">Add New Address</h5>
                    <div className="grid grid-cols-3 gap-2">
                      {['Home', 'Work', 'Other'].map((lbl) => (
                        <button
                          key={lbl}
                          type="button"
                          onClick={() => setNewAddrLabel(lbl)}
                          className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                            newAddrLabel === lbl
                              ? 'bg-orange-600 text-white border-orange-600'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      required
                      placeholder="e.g. GA-542-8812, House 22, Cantonments, Accra"
                      value={newAddrText}
                      onChange={(e) => setNewAddrText(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddAddress(false)}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-2.5">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${
                        addr.isDefault
                          ? 'bg-orange-50/50 border-orange-300'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl mt-0.5 ${addr.isDefault ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{addr.label}</span>
                            {addr.isDefault && (
                              <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{addr.address}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-xs text-slate-500 hover:text-orange-600 font-medium"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Payment Preferences */}
            {activeTab === 'payments' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">Configure your default Mobile Money wallet or card</p>

                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-yellow-400 text-slate-950 font-bold text-xs flex items-center justify-center">
                        MTN
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-xs">MTN Mobile Money Wallet</span>
                        <p className="text-xs text-slate-500">+233 24 991 2233 • Kwame Mensah</p>
                      </div>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                      Primary
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                        VISA
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-xs">Debit Card</span>
                        <p className="text-xs text-slate-500">•••• •••• •••• 4242 (Expires 08/28)</p>
                      </div>
                    </div>
                    <button className="text-xs text-slate-500 hover:text-slate-800 font-medium">
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">Control how and when ChowGrid communicates with you</p>

                <div className="space-y-3">
                  <label className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-900 text-xs">SMS Delivery Updates & OTP</span>
                      <p className="text-xs text-slate-500">Receive SMS notifications when food is prepared and rider departs</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={smsNotifications}
                      onChange={(e) => setSmsNotifications(e.target.checked)}
                      className="w-4 h-4 text-orange-600 rounded"
                    />
                  </label>

                  <label className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-900 text-xs">WhatsApp Order Receipts</span>
                      <p className="text-xs text-slate-500">Instant PDF receipt sent to your WhatsApp upon successful delivery</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={whatsappReceipts}
                      onChange={(e) => setWhatsappReceipts(e.target.checked)}
                      className="w-4 h-4 text-orange-600 rounded"
                    />
                  </label>

                  <label className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-900 text-xs">Vendor Discounts & Promotions</span>
                      <p className="text-xs text-slate-500">Receive weekly discounts from your favorite local food stores</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={promoEmails}
                      onChange={(e) => setPromoEmails(e.target.checked)}
                      className="w-4 h-4 text-orange-600 rounded"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Tab: Apply as Seller / Vendor Application */}
            {activeTab === 'seller_application' && (
              <div className="space-y-5">
                {/* Existing Application Banner */}
                {myApplication ? (
                  <div className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-orange-600 text-white rounded-xl">
                          <ChefHat className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-900 text-sm font-['Outfit']">
                            {myApplication.businessName}
                          </h5>
                          <p className="text-xs text-slate-500">Submitted on {new Date(myApplication.appliedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          myApplication.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : myApplication.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                        }`}
                      >
                        {myApplication.status === 'pending' ? '⏳ KYC Review Pending' : myApplication.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-white/80 rounded-xl border border-orange-100">
                        <span className="text-slate-500 block font-medium">Food Category</span>
                        <span className="text-slate-900 font-bold">{myApplication.foodType}</span>
                      </div>
                      <div className="p-3 bg-white/80 rounded-xl border border-orange-100">
                        <span className="text-slate-500 block font-medium">Ghana Card ID</span>
                        <span className="text-slate-900 font-bold">{myApplication.ghanaCardNumber}</span>
                      </div>
                      <div className="p-3 bg-white/80 rounded-xl border border-orange-100 sm:col-span-2">
                        <span className="text-slate-500 block font-medium">Kitchen Address</span>
                        <span className="text-slate-900 font-semibold">{myApplication.storeAddress}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-white/90 border border-orange-200/60 rounded-xl text-xs text-slate-600 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-800">Application Under Verification</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Our vendor onboarding team reviews hygiene standards and Ghana Card KYC. Once approved, your store will immediately go live on ChowGrid with full SaaS dashboard access!
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Intro Promo Card */}
                    <div className="p-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-2xl space-y-2 shadow-xs">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-200" />
                        <span className="text-xs font-bold tracking-wider uppercase text-amber-100">ChowGrid Vendor Partner</span>
                      </div>
                      <h5 className="text-base font-bold font-['Outfit']">
                        Start Selling on ChowGrid
                      </h5>
                      <p className="text-xs text-orange-100 leading-relaxed">
                        Flat monthly subscription (₵50–₵100/mo), 0% commission deductions, instant MoMo payouts, and dual-OTP verified delivery security.
                      </p>
                    </div>

                    {/* Application Form */}
                    <form onSubmit={handleSellerApplicationSubmit} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-700 font-bold">Restaurant / Kitchen Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Mama Naa's Authentic Waakye Joint"
                          value={appBusinessName}
                          onChange={(e) => setAppBusinessName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-orange-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-700 font-bold">Main Food Category</label>
                          <select
                            value={appCategory}
                            onChange={(e) => setAppCategory(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-orange-500"
                          >
                            <option value="Waakye & Local Dishes">Waakye & Local Dishes</option>
                            <option value="Jollof & Grills">Jollof & Grills</option>
                            <option value="Banku, Tilapia & Seafood">Banku, Tilapia & Seafood</option>
                            <option value="Fried Rice & Fast Food">Fried Rice & Fast Food</option>
                            <option value="Pastries, Bakery & Drinks">Pastries, Bakery & Drinks</option>
                            <option value="Street Food & Snacks">Street Food & Snacks</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-700 font-bold">Ghana Card Number (KYC) *</label>
                          <input
                            type="text"
                            required
                            placeholder="GHA-712839218-4"
                            value={appGhanaCard}
                            onChange={(e) => setAppGhanaCard(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-orange-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-700 font-bold">Kitchen Pickup Address (Accra / Ghana) *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. GA-234-9912, Boundary Road, East Legon, Accra"
                          value={appAddress}
                          onChange={(e) => setAppAddress(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-orange-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-700 font-bold">Contact Phone Number *</label>
                          <input
                            type="text"
                            required
                            value={appPhone}
                            onChange={(e) => setAppPhone(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-orange-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-700 font-bold">MoMo Payout Number *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. +233 24 000 0000"
                            value={appMomoPayout}
                            onChange={(e) => setAppMomoPayout(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-orange-500"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full mt-2 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-sm"
                      >
                        <ChefHat className="w-4 h-4" />
                        <span>Submit Vendor KYC Application</span>
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}

            {/* Tab 5: Vendor Store Settings (Vendor mode) */}
            {activeTab === 'store_settings' && (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 font-medium">Store Display Name</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-600 font-medium">Tagline / Bio</label>
                  <input
                    type="text"
                    value={storeTagline}
                    onChange={(e) => setStoreTagline(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-600 font-medium">Kitchen Address</label>
                    <input
                      type="text"
                      value={storeAddress}
                      onChange={(e) => setStoreAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-600 font-medium">Standard Prep Time</label>
                    <select
                      value={prepTime}
                      onChange={(e) => setPrepTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                    >
                      <option value="10-15 min">10-15 min (Fast)</option>
                      <option value="15-20 min">15-20 min (Standard)</option>
                      <option value="20-30 min">20-30 min (Complex / Grill)</option>
                      <option value="30-45 min">30-45 min</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-600 font-medium">MoMo Payout Number</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={payoutMomo}
                      onChange={(e) => setPayoutMomo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Kitchen Settings</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
