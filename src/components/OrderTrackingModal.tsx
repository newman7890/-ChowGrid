import React from 'react';
import { useApp } from '../context/AppContext';
import { OrderStatus } from '../types';
import {
  X,
  Phone,
  CheckCircle2,
  Bike,
  Store,
  KeyRound,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { orders, activeTrackOrderId, updateOrderStatus, reorder } = useApp();

  const order = orders.find((o) => o.id === activeTrackOrderId) || orders[0];

  if (!isOpen || !order) return null;

  const STATUS_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'new', label: 'Order Placed', desc: 'Sent to vendor kitchen' },
    { key: 'accepted', label: 'Accepted', desc: 'Kitchen acknowledged order' },
    { key: 'preparing', label: 'Preparing Food', desc: 'Cooking fresh to your specs' },
    { key: 'ready_for_pickup', label: 'Ready for Pickup', desc: 'Packed & awaiting rider' },
    { key: 'rider_assigned', label: 'Rider Assigned', desc: 'Rider en route to vendor' },
    { key: 'picked_up', label: 'Food Picked Up', desc: 'Pickup verified at vendor' },
    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Rider is on the way to you' },
    { key: 'delivered', label: 'Delivered', desc: 'Delivery code confirmed' },
  ];

  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === order.status);

  const handleNextSimulationStep = () => {
    if (currentStepIdx < STATUS_STEPS.length - 1) {
      updateOrderStatus(order.id, STATUS_STEPS[currentStepIdx + 1].key);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-base sm:text-lg">
              📦
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-['Outfit']">
                  Order {order.orderNumber}
                </h3>
                <span className="text-[10px] sm:text-xs uppercase px-2 py-0.5 rounded-md font-bold bg-orange-100 text-orange-800 border border-orange-200">
                  {order.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Placed on {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.storeName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto flex-1">
          {/* Customer Delivery OTP Showcase Box */}
          <div className="p-5 bg-orange-50 border border-orange-200 rounded-3xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-orange-600" />
                <span className="text-xs uppercase font-extrabold tracking-wider text-orange-900">
                  Your Delivery Code (OTP)
                </span>
              </div>
              <span className="text-[11px] text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full font-semibold">
                Delivery Verification
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-700 max-w-sm">
                  Give this 4-digit code to the delivery rider <strong className="text-slate-900">only after</strong> you receive and inspect your meal.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto bg-white px-5 py-2.5 rounded-2xl border border-orange-300 shadow-xs">
                <span className="text-2xl sm:text-3xl font-mono font-black tracking-widest text-orange-600">
                  {order.deliveryOtp}
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Status Tracker */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Live Order Progress
              </h4>
              <span className="text-xs text-slate-500 font-medium">
                Est. Delivery: ~{order.estimatedPrepTime + 15} mins
              </span>
            </div>

            {/* Stepper Timeline */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = currentStepIdx > idx;
                const isCurrent = currentStepIdx === idx;

                return (
                  <div key={step.key} className="relative flex items-start gap-4">
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                        isPassed
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-orange-600 text-white ring-4 ring-orange-100'
                          : 'bg-slate-200 border border-slate-300 text-transparent'
                      }`}
                    >
                      {(isPassed || isCurrent) && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div>
                      <div
                        className={`text-sm font-bold font-['Outfit'] ${
                          isCurrent ? 'text-orange-600' : isPassed ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </div>
                      <p className="text-xs text-slate-500">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assigned Rider & Store Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase">
                <Store className="w-4 h-4 text-orange-600" />
                <span>Vendor Details</span>
              </div>
              <p className="text-sm font-bold text-slate-900">{order.storeName}</p>
              <p className="text-xs text-slate-500">Prep Time: ~{order.estimatedPrepTime} mins</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase">
                <Bike className="w-4 h-4 text-orange-600" />
                <span>Assigned Rider</span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {order.riderAssignedName || 'Assigning nearest platform rider...'}
              </p>
              {order.riderPhone && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>{order.riderPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Items Summary */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Order Items</h4>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.cartItemId} className="text-xs flex justify-between border-b border-slate-200 pb-2">
                  <div>
                    <span className="font-semibold text-slate-900">
                      {item.quantity}x {item.name}
                    </span>
                    {item.selectedModifiers.length > 0 && (
                      <p className="text-[11px] text-slate-500">
                        {item.selectedModifiers.map((m) => `${m.quantity > 1 ? `${m.quantity}x ` : ''}${m.optionName}`).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="font-mono text-slate-900 font-bold">₵{item.totalPrice.toFixed(2)}</span>
                </div>
              ))}

              <div className="pt-2 flex justify-between text-xs text-slate-600">
                <span>Subtotal + Delivery:</span>
                <span className="font-mono font-bold text-slate-900">₵{order.total.toFixed(2)} ({order.paymentMethod.toUpperCase()})</span>
              </div>
            </div>
          </div>

          {/* Simulation Helper */}
          <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Order Lifecycle Simulation
              </span>
              <span className="text-[10px] text-slate-500">Advance order step</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleNextSimulationStep}
                disabled={order.status === 'delivered'}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition disabled:opacity-30 flex items-center gap-1"
              >
                <span>Advance Next Stage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  reorder(order.id);
                  onClose();
                }}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Order Again</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
