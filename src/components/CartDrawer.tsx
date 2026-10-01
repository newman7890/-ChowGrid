import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Store } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onOpenCheckout,
}) => {
  const { cart, removeFromCart, updateCartQuantity, clearCart, cartSubtotal, cartDeliveryFee, cartTotal } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg font-['Outfit']">Your Cart</h3>
                {cart.length > 0 && (
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-orange-600" />
                    <span>{cart[0].storeName}</span>
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-3xl">
                  🍲
                </div>
                <h4 className="text-base font-bold text-slate-800">Your cart is empty</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Browse dishes from local food vendors, customize your meal options, and add them to your cart.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 text-sm font-['Outfit']">{item.name}</h4>
                        <div className="text-xs font-bold text-slate-900 font-mono mt-0.5">
                          ₵{item.unitCalculatedPrice.toFixed(2)} each
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Modifiers List */}
                    {item.selectedModifiers.length > 0 && (
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1 text-xs">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          Custom Selection:
                        </span>
                        {item.selectedModifiers.map((mod) => (
                          <div
                            key={mod.optionId}
                            className="flex items-center justify-between text-slate-700"
                          >
                            <span>
                              {mod.quantity > 1 ? `${mod.quantity}x ` : ''}
                              {mod.optionName}
                            </span>
                            <span className="text-slate-900 font-mono font-medium">
                              +₵{(mod.unitPrice * mod.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {item.specialInstructions && (
                      <p className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200 italic">
                        "{item.specialInstructions}"
                      </p>
                    )}

                    {/* Quantity & Subtotal Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                        <button
                          onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-slate-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-slate-900"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-slate-900 font-mono">
                        ₵{item.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}

                <button
                  onClick={clearCart}
                  className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 mx-auto pt-2 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear cart</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer with Summary */}
          {cart.length > 0 && (
            <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Food Subtotal</span>
                  <span className="text-slate-900 font-mono font-semibold">₵{cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="text-slate-900 font-mono font-semibold">₵{cartDeliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200 font-['Outfit']">
                  <span>Total</span>
                  <span className="text-orange-600 font-mono">₵{cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenCheckout();
                }}
                className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl text-sm shadow-sm transition flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
