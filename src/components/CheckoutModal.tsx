import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  ShieldCheck,
  CreditCard,
  MapPin,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { cart, cartSubtotal, cartDeliveryFee, cartTotal, placeOrder, currentUser } = useApp();

  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.deliveryAddress || '');
  const [customerNotes, setCustomerNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<
    'momo_mtn' | 'momo_telecel' | 'card' | 'cash_on_delivery'
  >('momo_mtn');

  // Sync if currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      if (!customerName) setCustomerName(currentUser.name || '');
      if (!customerPhone) setCustomerPhone(currentUser.phone || '');
      if (!deliveryAddress) setDeliveryAddress(currentUser.deliveryAddress || '');
    }
  }, [currentUser]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || cart.length === 0) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      setErrorMessage('Please fill in all required delivery contact fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    setTimeout(() => {
      try {
        const order = placeOrder({
          customerName,
          customerPhone,
          deliveryAddress,
          paymentMethod,
          customerNotes,
        });

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        setIsSubmitting(false);
        onClose();
        onOrderSuccess(order.id);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to place order.');
        setIsSubmitting(false);
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-['Outfit']">Checkout</h3>
              <p className="text-xs text-slate-500">Provide delivery details and payment method</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
              {errorMessage}
            </div>
          )}

          {/* Delivery Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span>1. Delivery Destination</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-medium">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-medium">Phone Number (Ghana) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +233 24 000 0000"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-600 font-medium">Street Address / Digital GhanaPost GPS *</label>
              <input
                type="text"
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="e.g. GA-183-9022, 14 East Legon, Accra"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-600 font-medium">Delivery Notes / Landmark</label>
              <input
                type="text"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="e.g. Near Shell filling station, black gate"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-orange-600" />
              <span>2. Payment Method</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* MTN MoMo */}
              <label
                className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition ${
                  paymentMethod === 'momo_mtn'
                    ? 'bg-amber-50/80 border-amber-400 text-amber-950'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="momo_mtn"
                  checked={paymentMethod === 'momo_mtn'}
                  onChange={() => setPaymentMethod('momo_mtn')}
                  className="hidden"
                />
                <div className="w-8 h-8 rounded-xl bg-yellow-400 text-slate-900 flex items-center justify-center font-bold text-xs">
                  MTN
                </div>
                <div className="text-xs">
                  <div className="font-bold">MTN Mobile Money</div>
                  <div className="text-[10px] text-slate-500">Prompt on phone</div>
                </div>
              </label>

              {/* Telecel Cash */}
              <label
                className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition ${
                  paymentMethod === 'momo_telecel'
                    ? 'bg-red-50/80 border-red-300 text-red-950'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="momo_telecel"
                  checked={paymentMethod === 'momo_telecel'}
                  onChange={() => setPaymentMethod('momo_telecel')}
                  className="hidden"
                />
                <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xs">
                  TEL
                </div>
                <div className="text-xs">
                  <div className="font-bold">Telecel Cash</div>
                  <div className="text-[10px] text-slate-500">Instant prompt</div>
                </div>
              </label>

              {/* Bank Card */}
              <label
                className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition ${
                  paymentMethod === 'card'
                    ? 'bg-blue-50/80 border-blue-300 text-blue-950'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="hidden"
                />
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  CARD
                </div>
                <div className="text-xs">
                  <div className="font-bold">Visa / Mastercard</div>
                  <div className="text-[10px] text-slate-500">Card payment</div>
                </div>
              </label>

              {/* Cash On Delivery */}
              <label
                className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash_on_delivery"
                  checked={paymentMethod === 'cash_on_delivery'}
                  onChange={() => setPaymentMethod('cash_on_delivery')}
                  className="hidden"
                />
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  💵
                </div>
                <div className="text-xs">
                  <div className="font-bold">Cash on Delivery</div>
                  <div className="text-[10px] text-slate-500">Pay rider on delivery</div>
                </div>
              </label>
            </div>
          </div>

          {/* Price Locking Notice */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">Price Locked:</span> Your order amount is guaranteed and protected against menu changes.
            </div>
          </div>

          {/* Summary */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Ordering from:</span>
              <span className="font-bold text-slate-900">{cart[0].storeName}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Items Total ({cart.reduce((a, b) => a + b.quantity, 0)} items):</span>
              <span className="font-mono text-slate-900 font-bold">₵{cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Fee:</span>
              <span className="font-mono text-slate-900 font-bold">₵{cartDeliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200 font-['Outfit']">
              <span>Total:</span>
              <span className="text-orange-600 font-mono">₵{cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-2xl text-sm shadow-sm transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Confirming Order...</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                <span>Place Order (₵{cartTotal.toFixed(2)})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
