import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FoodItem, Order } from '../types';
import {
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CreditCard,
  ChefHat,
  PackageCheck,
  KeyRound,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  X,
} from 'lucide-react';

export const VendorDashboard: React.FC = () => {
  const {
    stores,
    foodItems,
    orders,
    activeVendorStoreId,
    setActiveVendorStoreId,
    updateStoreStatus,
    updateOrderStatus,
    toggleFoodAvailability,
    saveFoodItem,
    deleteFoodItem,
    verifyPickupOtp,
    renewSubscription,
    simulateGracePeriod,
    simulateSubscriptionExpiry,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'subscription' | 'settings'>('orders');
  const [selectedOrderForPickupOtp, setSelectedOrderForPickupOtp] = useState<Order | null>(null);
  const [pickupOtpInput, setPickupOtpInput] = useState('');
  const [otpVerifyMsg, setOtpVerifyMsg] = useState<{ success: boolean; text: string } | null>(null);

  const [editingFood, setEditingFood] = useState<Partial<FoodItem> | null>(null);

  const currentStore = stores.find((s) => s.id === activeVendorStoreId) || stores[0];
  const vendorOrders = orders.filter((o) => o.storeId === currentStore.id);
  const vendorFoods = foodItems.filter((f) => f.storeId === currentStore.id);

  const activeOrders = vendorOrders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'completed' && o.status !== 'cancelled'
  );

  const totalSales = vendorOrders.reduce((sum, o) => sum + o.subtotal, 0);

  const handleVerifyPickup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForPickupOtp) return;

    const result = verifyPickupOtp(selectedOrderForPickupOtp.id, pickupOtpInput);
    if (result.success) {
      setOtpVerifyMsg({ success: true, text: result.message });
      setTimeout(() => {
        setSelectedOrderForPickupOtp(null);
        setPickupOtpInput('');
        setOtpVerifyMsg(null);
      }, 1500);
    } else {
      setOtpVerifyMsg({ success: false, text: result.message });
    }
  };

  const handleSaveFoodForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFood || !editingFood.name || !editingFood.basePrice) return;

    const itemToSave: FoodItem = {
      id: editingFood.id || `food-${Date.now()}`,
      storeId: currentStore.id,
      name: editingFood.name,
      description: editingFood.description || '',
      basePrice: Number(editingFood.basePrice),
      imageUrl: editingFood.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      category: editingFood.category || 'Local Ghanaian',
      isAvailable: editingFood.isAvailable ?? true,
      type: editingFood.type || 'build_your_meal',
      prepTimeMinutes: Number(editingFood.prepTimeMinutes || 15),
      modifierGroups: editingFood.modifierGroups || [],
    };

    saveFoodItem(itemToSave);
    setEditingFood(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Store Selector & Status Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentStore.logoUrl}
            alt={currentStore.name}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 bg-slate-50"
          />
          <div>
            <div className="flex items-center gap-2">
              <select
                value={activeVendorStoreId}
                onChange={(e) => setActiveVendorStoreId(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-900 font-bold rounded-xl px-3 py-1.5 text-base sm:text-lg focus:outline-none focus:border-orange-500 font-['Outfit']"
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-slate-500 mt-1">{currentStore.scheduledHours}</p>
          </div>
        </div>

        {/* Live Store Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => updateStoreStatus(currentStore.id, !currentStore.isOpen)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 border ${
              currentStore.isOpen
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}
          >
            {currentStore.isOpen ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-rose-600" />}
            <span>{currentStore.isOpen ? 'Store OPEN (Accepting Orders)' : 'Store CLOSED (Not Accepting)'}</span>
          </button>

          <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 text-xs">
            <span className="text-slate-500">Total Sales: </span>
            <span className="font-bold text-slate-900 font-mono">₵{totalSales.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Subscription & 7-Day Grace Period Alert */}
      <div
        className={`p-5 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          currentStore.subscriptionStatus === 'active'
            ? 'bg-white border-slate-200 text-slate-800'
            : currentStore.subscriptionStatus === 'grace_period'
            ? 'bg-amber-50 border-amber-300 text-amber-950'
            : 'bg-rose-50 border-rose-300 text-rose-950'
        }`}
      >
        <div className="flex items-start gap-3">
          {currentStore.subscriptionStatus === 'active' ? (
            <CreditCard className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : currentStore.subscriptionStatus === 'grace_period' ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">
                Monthly Vendor Subscription ({`₵${currentStore.monthlyFee}/month`}):
              </span>
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  currentStore.subscriptionStatus === 'active'
                    ? 'bg-emerald-100 text-emerald-800'
                    : currentStore.subscriptionStatus === 'grace_period'
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-rose-200 text-rose-900'
                }`}
              >
                {currentStore.subscriptionStatus === 'active'
                  ? 'Active Plan'
                  : currentStore.subscriptionStatus === 'grace_period'
                  ? '7-Day Grace Period'
                  : 'Store Locked & Suspended'}
              </span>
            </div>

            <p className="text-xs text-slate-600">
              {currentStore.subscriptionStatus === 'active'
                ? `Expires in 20 days (${new Date(currentStore.subscriptionExpiresAt).toLocaleDateString()}). Digital store is active on marketplace.`
                : currentStore.subscriptionStatus === 'grace_period'
                ? `Subscription expired. You are currently in the 7-day grace period. Renew now to prevent automatic store deactivation!`
                : `Store deactivated and hidden from discovery. Renew subscription to reactivate.`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => renewSubscription(currentStore.id)}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
          >
            Renew Store (₵{currentStore.monthlyFee})
          </button>

          <button
            onClick={() => simulateGracePeriod(currentStore.id)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
          >
            Simulate Grace Period
          </button>

          <button
            onClick={() => simulateSubscriptionExpiry(currentStore.id)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
          >
            Simulate Deactivation
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>Live Orders Queue ({activeOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'menu'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>Menu & Modifiers ({vendorFoods.length})</span>
        </button>
      </div>

      {/* Tab 1: Live Orders Queue */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">Incoming & Active Orders</h3>
            <span className="text-xs text-slate-500">Manage preparation, packing, and rider handover</span>
          </div>

          {vendorOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
              <p className="text-slate-500 text-sm">No orders yet for this store.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendorOrders.map((order) => {
                const isFinished = order.status === 'delivered' || order.status === 'completed';

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-3xl border p-5 space-y-4 shadow-xs flex flex-col justify-between ${
                      order.status === 'new'
                        ? 'border-orange-400 ring-2 ring-orange-100'
                        : 'border-slate-200'
                    }`}
                  >
                    <div>
                      {/* Order Number & Status */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-base font-mono">
                              {order.orderNumber}
                            </span>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-orange-100 text-orange-800">
                              {order.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.customerName}
                          </p>
                        </div>

                        <span className="font-mono font-bold text-slate-900 text-base">
                          ₵{order.subtotal.toFixed(2)}
                        </span>
                      </div>

                      {/* Food Items List */}
                      <div className="space-y-2 pt-3 text-xs">
                        {order.items.map((item) => (
                          <div key={item.cartItemId} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                            <div className="flex justify-between font-bold text-slate-900">
                              <span>{item.quantity}x {item.name}</span>
                              <span className="font-mono">₵{item.totalPrice.toFixed(2)}</span>
                            </div>

                            {item.selectedModifiers.length > 0 && (
                              <p className="text-[11px] text-orange-800">
                                ↳ {item.selectedModifiers.map((m) => `${m.quantity > 1 ? `${m.quantity}x ` : ''}${m.optionName}`).join(', ')}
                              </p>
                            )}

                            {item.specialInstructions && (
                              <p className="text-[10px] italic text-slate-600 bg-white p-1.5 rounded border border-slate-200">
                                Note: "{item.specialInstructions}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Pickup OTP Box for vendor */}
                      <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">Pickup OTP expected:</span>
                        <span className="font-mono font-bold text-orange-700 tracking-widest text-sm">
                          {order.pickupOtp}
                        </span>
                      </div>
                    </div>

                    {/* Order Action Pipeline */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      {order.status === 'new' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'accepted')}
                          className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition"
                        >
                          Accept Order & Start
                        </button>
                      )}

                      {order.status === 'accepted' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition"
                        >
                          Mark as Preparing (10-15 min alert)
                        </button>
                      )}

                      {order.status === 'preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'ready_for_pickup')}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
                        >
                          Food Ready! Request Rider Pickup
                        </button>
                      )}

                      {order.status === 'ready_for_pickup' && (
                        <button
                          onClick={() => {
                            setSelectedOrderForPickupOtp(order);
                            setPickupOtpInput('');
                            setOtpVerifyMsg(null);
                          }}
                          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                        >
                          <KeyRound className="w-4 h-4" />
                          <span>Verify Rider Pickup OTP</span>
                        </button>
                      )}

                      {order.status === 'picked_up' && (
                        <div className="text-center text-xs font-semibold text-emerald-700 bg-emerald-50 py-1.5 rounded-lg">
                          ✓ Handed over to {order.riderAssignedName || 'Rider'}
                        </div>
                      )}

                      {isFinished && (
                        <div className="text-center text-xs font-semibold text-slate-500 bg-slate-50 py-1.5 rounded-lg">
                          Order Delivered & Completed
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Menu & Modifiers Manager */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">Menu Listings & Modifiers</h3>
              <p className="text-xs text-slate-500">Configure meals, base prices, proteins and add-ons</p>
            </div>
            <button
              onClick={() =>
                setEditingFood({
                  storeId: currentStore.id,
                  name: '',
                  description: '',
                  basePrice: 20,
                  category: 'Waakye',
                  type: 'build_your_meal',
                  prepTimeMinutes: 15,
                  isAvailable: true,
                  modifierGroups: [
                    {
                      id: `mod-${Date.now()}`,
                      name: 'Select Protein',
                      minSelection: 1,
                      maxSelection: 2,
                      required: true,
                      allowQuantityMultiplier: true,
                      options: [
                        { id: `opt-1`, name: 'Beef / Meat', price: 15, isDefault: true },
                        { id: `opt-2`, name: 'Fish', price: 18 },
                        { id: `opt-3`, name: 'Egg', price: 5 },
                      ],
                    },
                  ],
                })
              }
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create New Food Item</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendorFoods.map((food) => (
              <div
                key={food.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-36 rounded-2xl overflow-hidden bg-slate-100 mb-3">
                    <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-white/95 px-2 py-1 rounded-lg text-xs font-bold text-slate-900 shadow-xs">
                      ₵{food.basePrice.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-base font-['Outfit']">{food.name}</h4>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {food.type === 'build_your_meal' ? 'Build Meal' : 'Fixed Combo'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{food.description}</p>

                  {food.modifierGroups && food.modifierGroups.length > 0 && (
                    <div className="mt-3 text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="font-semibold text-orange-700">Modifier Groups: </span>
                      {food.modifierGroups.map((g) => g.name).join(', ')}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => toggleFoodAvailability(food.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                      food.isAvailable
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {food.isAvailable ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{food.isAvailable ? 'Available' : 'Sold Out'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingFood(food)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteFoodItem(food.id)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pickup OTP Verification Modal */}
      {selectedOrderForPickupOtp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-slate-900 text-base">Verify Rider Pickup OTP</h3>
              </div>
              <button
                onClick={() => setSelectedOrderForPickupOtp(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              The assigned rider will show you their 4-digit Pickup OTP for order{' '}
              <strong className="text-slate-900">{selectedOrderForPickupOtp.orderNumber}</strong>. Enter it below before handing over the food.
            </p>

            <form onSubmit={handleVerifyPickup} className="space-y-4">
              <input
                type="text"
                maxLength={4}
                autoFocus
                value={pickupOtpInput}
                onChange={(e) => setPickupOtpInput(e.target.value)}
                placeholder="e.g. 7284"
                className="w-full text-center text-3xl tracking-widest font-mono font-bold bg-slate-50 border border-slate-300 rounded-2xl py-3 text-orange-600 focus:outline-none focus:bg-white focus:border-orange-500"
              />

              {otpVerifyMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold text-center ${
                    otpVerifyMsg.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {otpVerifyMsg.text}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl text-xs transition"
              >
                Confirm Pickup & Handover
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Create Food Modal */}
      {editingFood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">
                {editingFood.id ? 'Edit Dish Listing' : 'Create New Food Listing'}
              </h3>
              <button onClick={() => setEditingFood(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFoodForm} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-medium">Food Name *</label>
                <input
                  type="text"
                  required
                  value={editingFood.name || ''}
                  onChange={(e) => setEditingFood({ ...editingFood, name: e.target.value })}
                  placeholder="e.g. Special Waakye with Stew"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 font-medium">Base Price (₵) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingFood.basePrice || ''}
                    onChange={(e) => setEditingFood({ ...editingFood, basePrice: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-600 font-medium">Prep Time (mins)</label>
                  <input
                    type="number"
                    min={5}
                    value={editingFood.prepTimeMinutes || 15}
                    onChange={(e) => setEditingFood({ ...editingFood, prepTimeMinutes: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-medium">Dish Description</label>
                <textarea
                  rows={2}
                  value={editingFood.description || ''}
                  onChange={(e) => setEditingFood({ ...editingFood, description: e.target.value })}
                  placeholder="Aromatic rice, black shito, tomato stew..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-medium">Photo URL</label>
                <input
                  type="url"
                  value={editingFood.imageUrl || ''}
                  onChange={(e) => setEditingFood({ ...editingFood, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-medium">Listing Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingFood({ ...editingFood, type: 'build_your_meal' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      editingFood.type === 'build_your_meal'
                        ? 'bg-orange-50 border-orange-500 text-orange-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Build Your Meal
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingFood({ ...editingFood, type: 'fixed' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      editingFood.type === 'fixed'
                        ? 'bg-orange-50 border-orange-500 text-orange-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Fixed Meal Combo
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl text-xs transition shadow-sm mt-2"
              >
                Save & Publish Dish
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
