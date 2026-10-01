import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Bike,
  MapPin,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

interface RiderSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RiderSandboxModal: React.FC<RiderSandboxModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { orders, verifyDeliveryOtp, updateOrderStatus } = useApp();

  const [deliveryOtpInput, setDeliveryOtpInput] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    orders.find((o) => o.status === 'out_for_delivery' || o.status === 'picked_up')?.id || orders[0]?.id || ''
  );
  const [feedback, setFeedback] = useState<{ success: boolean; text: string } | null>(null);

  if (!isOpen) return null;

  const currentOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const handleVerifyDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder) return;

    const res = verifyDeliveryOtp(currentOrder.id, deliveryOtpInput);
    if (res.success) {
      setFeedback({ success: true, text: res.message });
      setDeliveryOtpInput('');
    } else {
      setFeedback({ success: false, text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-100 text-orange-700 rounded-xl">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                Rider Delivery Handshake
              </h3>
              <p className="text-[11px] text-slate-500">Test OTP handshakes & rider steps</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600">Active Delivery Task:</label>
          <select
            value={selectedOrderId}
            onChange={(e) => {
              setSelectedOrderId(e.target.value);
              setFeedback(null);
            }}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500 font-mono font-bold"
          >
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.orderNumber} - {o.storeName} → {o.customerName} ({o.status})
              </option>
            ))}
          </select>
        </div>

        {currentOrder && (
          <div className="space-y-4">
            {/* Delivery Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-sm font-['Outfit']">{currentOrder.orderNumber}</span>
                <span className="uppercase font-bold text-[10px] px-2 py-0.5 rounded bg-orange-100 text-orange-800">
                  {currentOrder.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-1 pt-1 text-slate-700">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Pickup: <strong className="text-slate-900">{currentOrder.storeName}</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Dropoff: <strong className="text-slate-900">{currentOrder.deliveryAddress}</strong> ({currentOrder.customerName})</span>
                </div>
              </div>

              <div className="mt-3 p-2 bg-white rounded-xl border border-slate-200 flex justify-between text-[11px]">
                <span className="text-slate-500">Customer Delivery OTP:</span>
                <span className="font-mono font-bold text-emerald-700">{currentOrder.deliveryOtp}</span>
              </div>
            </div>

            {/* Rider Actions */}
            <div className="space-y-3">
              {currentOrder.status === 'ready_for_pickup' && (
                <button
                  onClick={() => updateOrderStatus(currentOrder.id, 'picked_up')}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition"
                >
                  Step 1: Collect Food at Vendor (Simulate Pickup)
                </button>
              )}

              {currentOrder.status === 'picked_up' && (
                <button
                  onClick={() => updateOrderStatus(currentOrder.id, 'out_for_delivery')}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition"
                >
                  Step 2: Start Trip (Out for Delivery)
                </button>
              )}

              {/* Delivery OTP verification form */}
              {(currentOrder.status === 'out_for_delivery' || currentOrder.status === 'picked_up') && (
                <form onSubmit={handleVerifyDelivery} className="p-4 bg-slate-50 rounded-2xl border border-emerald-300 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <KeyRound className="w-4 h-4 text-emerald-600" />
                    <span>Customer Delivery OTP Handshake</span>
                  </div>

                  <p className="text-[11px] text-slate-600">
                    Ask customer for their 4-digit Delivery Code upon handover:
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      value={deliveryOtpInput}
                      onChange={(e) => setDeliveryOtpInput(e.target.value)}
                      placeholder="Enter Delivery OTP"
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-center font-mono font-bold text-emerald-800 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
                    >
                      Confirm
                    </button>
                  </div>

                  {feedback && (
                    <div
                      className={`p-2 rounded-xl text-xs text-center font-medium ${
                        feedback.success
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-rose-100 text-rose-900 border border-rose-300'
                      }`}
                    >
                      {feedback.text}
                    </div>
                  )}
                </form>
              )}

              {currentOrder.status === 'delivered' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Delivery Completed & Verified</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Rider payout for this delivery (₵12.00) recorded.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
