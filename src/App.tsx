import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { CustomerMarketplace } from './components/CustomerMarketplace';
import { MealCustomizerModal } from './components/MealCustomizerModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { VendorDashboard } from './components/VendorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { FoodItem } from './types';
import { ShieldCheck } from 'lucide-react';
import chowgridLogo from './assets/chowgrid-logo.png';

const MainAppContent: React.FC = () => {
  const { role, addToCart, setActiveTrackOrderId } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomizerItem, setSelectedCustomizerItem] = useState<FoodItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      {/* Header */}
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrderTracker={() => setIsOrderTrackerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {role === 'customer' && (
          <CustomerMarketplace
            searchTerm={searchTerm}
            onSelectItem={(item) => setSelectedCustomizerItem(item)}
          />
        )}

        {role === 'vendor' && <VendorDashboard />}

        {role === 'admin' && <AdminDashboard />}
      </main>

      {/* Clean Human Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={chowgridLogo} alt="ChowGrid" className="w-8 h-8 object-contain rounded-lg border border-slate-100" />
            <div>
              <span className="font-bold text-slate-900 font-['Outfit']">ChowGrid</span>
              <span className="text-slate-400 mx-1.5">•</span>
              <span className="text-slate-500 italic">Good Food. Great Choices.</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dual OTP Verified Delivery</span>
            </span>
            <span>•</span>
            <span>Accra, Ghana</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <MealCustomizerModal
        item={selectedCustomizerItem}
        onClose={() => setSelectedCustomizerItem(null)}
        onAddToCart={(item, selectedModifiers, quantity, specialInstructions) => {
          addToCart(item, selectedModifiers, quantity, specialInstructions);
          setIsCartOpen(true);
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(orderId) => {
          setActiveTrackOrderId(orderId);
          setIsOrderTrackerOpen(true);
        }}
      />

      <OrderTrackingModal
        isOpen={isOrderTrackerOpen}
        onClose={() => setIsOrderTrackerOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
