import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FoodItem, Order, ModifierGroup, ModifierOption } from '../types';
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
  CheckCircle2,
  Sparkles,
  Layers,
  ListPlus,
  X,
} from 'lucide-react';

export const VendorDashboard: React.FC = () => {
  const {
    stores,
    foodItems,
    orders,
    currentUser,
    activeVendorStoreId,
    updateStoreStatus,
    updateOrderStatus,
    toggleFoodAvailability,
    saveFoodItem,
    deleteFoodItem,
    verifyPickupOtp,
    renewSubscription,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'subscription' | 'settings'>('orders');
  const [selectedOrderForPickupOtp, setSelectedOrderForPickupOtp] = useState<Order | null>(null);
  const [pickupOtpInput, setPickupOtpInput] = useState('');
  const [otpVerifyMsg, setOtpVerifyMsg] = useState<{ success: boolean; text: string } | null>(null);

  const [editingFood, setEditingFood] = useState<Partial<FoodItem> | null>(null);

  // Strictly lock to current seller's store
  const currentStore =
    stores.find((s) => s.id === currentUser?.vendorStoreId || s.id === activeVendorStoreId) ||
    stores[0];
  const vendorOrders = currentStore ? orders.filter((o) => o.storeId === currentStore.id) : [];
  const vendorFoods = currentStore ? foodItems.filter((f) => f.storeId === currentStore.id) : [];

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

  // Modifier Group & Option Handlers for "Build Your Meal"
  const handleAddModifierGroup = () => {
    if (!editingFood) return;
    const currentGroups = editingFood.modifierGroups || [];
    const newGroup: ModifierGroup = {
      id: `grp-${Date.now()}`,
      name: `Option Group ${currentGroups.length + 1}`,
      minSelection: 1,
      maxSelection: 4,
      required: true,
      allowQuantityMultiplier: true,
      options: [
        { id: `opt-${Date.now()}-1`, name: 'Choice 1', price: 0, isDefault: true },
      ],
    };
    setEditingFood({
      ...editingFood,
      modifierGroups: [...currentGroups, newGroup],
    });
  };

  const handleUpdateGroup = (groupId: string, field: keyof ModifierGroup, value: any) => {
    if (!editingFood || !editingFood.modifierGroups) return;
    setEditingFood({
      ...editingFood,
      modifierGroups: editingFood.modifierGroups.map((g) =>
        g.id === groupId ? { ...g, [field]: value } : g
      ),
    });
  };

  const handleRemoveGroup = (groupId: string) => {
    if (!editingFood || !editingFood.modifierGroups) return;
    setEditingFood({
      ...editingFood,
      modifierGroups: editingFood.modifierGroups.filter((g) => g.id !== groupId),
    });
  };

  const handleAddOption = (groupId: string) => {
    if (!editingFood || !editingFood.modifierGroups) return;
    setEditingFood({
      ...editingFood,
      modifierGroups: editingFood.modifierGroups.map((g) => {
        if (g.id === groupId) {
          const newOpt: ModifierOption = {
            id: `opt-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            name: '',
            price: 5,
            isDefault: false,
          };
          return { ...g, options: [...g.options, newOpt] };
        }
        return g;
      }),
    });
  };

  const handleUpdateOption = (
    groupId: string,
    optionId: string,
    field: keyof ModifierOption,
    value: any
  ) => {
    if (!editingFood || !editingFood.modifierGroups) return;
    setEditingFood({
      ...editingFood,
      modifierGroups: editingFood.modifierGroups.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            options: g.options.map((opt) =>
              opt.id === optionId ? { ...opt, [field]: value } : opt
            ),
          };
        }
        return g;
      }),
    });
  };

  const handleRemoveOption = (groupId: string, optionId: string) => {
    if (!editingFood || !editingFood.modifierGroups) return;
    setEditingFood({
      ...editingFood,
      modifierGroups: editingFood.modifierGroups.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            options: g.options.filter((opt) => opt.id !== optionId),
          };
        }
        return g;
      }),
    });
  };

  // Preset Template Loaders
  const handleLoadPreset = (preset: 'waakye' | 'jollof' | 'banku') => {
    if (!editingFood) return;

    if (preset === 'waakye') {
      setEditingFood({
        ...editingFood,
        type: 'build_your_meal',
        modifierGroups: [
          {
            id: `grp-${Date.now()}-1`,
            name: 'Choose Your Protein',
            minSelection: 1,
            maxSelection: 4,
            required: true,
            allowQuantityMultiplier: true,
            options: [
              { id: `opt-${Date.now()}-1`, name: 'Fried Hard-Boiled Egg', price: 5, isDefault: true },
              { id: `opt-${Date.now()}-2`, name: 'Soft Stewed Wele (Cow Skin)', price: 8, isDefault: true },
              { id: `opt-${Date.now()}-3`, name: 'Tender Stewed Beef (Chofi)', price: 15, isDefault: false },
              { id: `opt-${Date.now()}-4`, name: 'Crispy Fried Fish Chunk', price: 18, isDefault: false },
              { id: `opt-${Date.now()}-5`, name: 'Spicy Fried Guinea Fowl (Akokɔ)', price: 22, isDefault: false },
            ],
          },
          {
            id: `grp-${Date.now()}-2`,
            name: 'Essential Sides & Garnish',
            minSelection: 0,
            maxSelection: 5,
            required: false,
            allowQuantityMultiplier: true,
            options: [
              { id: `opt-${Date.now()}-6`, name: 'Spaghetti Talia Noodles', price: 4, isDefault: true },
              { id: `opt-${Date.now()}-7`, name: 'Moist Gari Foto', price: 4, isDefault: true },
              { id: `opt-${Date.now()}-8`, name: 'Sweet Fried Plantain (Kelewele)', price: 8, isDefault: false },
              { id: `opt-${Date.now()}-9`, name: 'Fresh Mixed Salad & Mayonnaise', price: 6, isDefault: false },
            ],
          },
          {
            id: `grp-${Date.now()}-3`,
            name: 'Sauce & Stew Preferences',
            minSelection: 1,
            maxSelection: 1,
            required: true,
            allowQuantityMultiplier: false,
            options: [
              { id: `opt-${Date.now()}-10`, name: 'Rich Black Shito + Tomato Stew Mix', price: 0, isDefault: true },
              { id: `opt-${Date.now()}-11`, name: 'Extra Hot Shito Only', price: 0, isDefault: false },
              { id: `opt-${Date.now()}-12`, name: 'Mild Stew Only (No Shito)', price: 0, isDefault: false },
            ],
          },
        ],
      });
    } else if (preset === 'jollof') {
      setEditingFood({
        ...editingFood,
        type: 'build_your_meal',
        modifierGroups: [
          {
            id: `grp-${Date.now()}-1`,
            name: 'Select Meat / Chicken Option',
            minSelection: 1,
            maxSelection: 3,
            required: true,
            allowQuantityMultiplier: true,
            options: [
              { id: `opt-${Date.now()}-1`, name: 'Quarter Grilled Chicken', price: 20, isDefault: true },
              { id: `opt-${Date.now()}-2`, name: 'Spicy Fried Goat Meat Chunks', price: 25, isDefault: false },
              { id: `opt-${Date.now()}-3`, name: 'Grilled Pork Ribs', price: 25, isDefault: false },
              { id: `opt-${Date.now()}-4`, name: 'Fried Red Fish', price: 22, isDefault: false },
            ],
          },
          {
            id: `grp-${Date.now()}-2`,
            name: 'Add Extra Sides',
            minSelection: 0,
            maxSelection: 3,
            required: false,
            allowQuantityMultiplier: true,
            options: [
              { id: `opt-${Date.now()}-5`, name: 'Crispy Kelewele (Fried Plantain)', price: 10, isDefault: false },
              { id: `opt-${Date.now()}-6`, name: 'Creamy Coleslaw Salad', price: 7, isDefault: false },
              { id: `opt-${Date.now()}-7`, name: 'Extra Jollof Rice Portion', price: 15, isDefault: false },
            ],
          },
        ],
      });
    } else if (preset === 'banku') {
      setEditingFood({
        ...editingFood,
        type: 'build_your_meal',
        modifierGroups: [
          {
            id: `grp-${Date.now()}-1`,
            name: 'Select Fish / Protein Option',
            minSelection: 1,
            maxSelection: 2,
            required: true,
            allowQuantityMultiplier: false,
            options: [
              { id: `opt-${Date.now()}-1`, name: 'Whole Grilled Tilapia', price: 35, isDefault: true },
              { id: `opt-${Date.now()}-2`, name: 'Fried Red Fish Portion', price: 25, isDefault: false },
              { id: `opt-${Date.now()}-3`, name: 'Assorted Meats in Okro Soup', price: 30, isDefault: false },
            ],
          },
          {
            id: `grp-${Date.now()}-2`,
            name: 'Pepper & Sauce Style',
            minSelection: 1,
            maxSelection: 1,
            required: true,
            allowQuantityMultiplier: false,
            options: [
              { id: `opt-${Date.now()}-4`, name: 'Fresh Ground Red & Green Pepper Mix', price: 0, isDefault: true },
              { id: `opt-${Date.now()}-5`, name: 'Okro Stew with Groundnut Oil', price: 8, isDefault: false },
            ],
          },
        ],
      });
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
      modifierGroups: editingFood.type === 'build_your_meal' ? (editingFood.modifierGroups || []) : [],
    };

    saveFoodItem(itemToSave);
    setEditingFood(null);
  };

  if (!currentStore) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto shadow-sm">
          <ChefHat className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">No Store Connected Yet</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          You are in Vendor Hub, but no active food store is linked to this account yet. Submit your seller application or contact the platform administrator to activate your kitchen.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Store Header & Status Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentStore.logoUrl}
            alt={currentStore.name}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 bg-slate-50 shadow-xs flex-shrink-0"
          />
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit'] tracking-tight">
                {currentStore.name}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>My Kitchen Hub</span>
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
              <span className="font-semibold text-orange-600">{currentStore.category}</span>
              <span>•</span>
              <span>{currentStore.address}</span>
              <span>•</span>
              <span>{currentStore.scheduledHours}</span>
            </div>
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
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
          >
            Pay / Renew Subscription (₵{currentStore.monthlyFee}.00 via MoMo)
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                  <ChefHat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 font-['Outfit']">
                    {editingFood.id ? 'Edit Dish Listing' : 'Create New Food Listing'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Set dish prices, preparation time, and custom add-on choices.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingFood(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFoodForm} className="space-y-4 overflow-y-auto flex-1 pr-1">
              <div className="space-y-1">
                <label className="text-xs text-slate-700 font-bold">Food / Dish Name *</label>
                <input
                  type="text"
                  required
                  value={editingFood.name || ''}
                  onChange={(e) => setEditingFood({ ...editingFood, name: e.target.value })}
                  placeholder="e.g. Special Waakye with Stew"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-700 font-bold">Base Price (₵) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingFood.basePrice || ''}
                    onChange={(e) => setEditingFood({ ...editingFood, basePrice: Number(e.target.value) })}
                    placeholder="25.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-700 font-bold">Category</label>
                  <input
                    type="text"
                    value={editingFood.category || 'Local Ghanaian'}
                    onChange={(e) => setEditingFood({ ...editingFood, category: e.target.value })}
                    placeholder="Waakye, Jollof..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-700 font-bold">Prep Time (mins)</label>
                  <input
                    type="number"
                    min={5}
                    value={editingFood.prepTimeMinutes || 15}
                    onChange={(e) => setEditingFood({ ...editingFood, prepTimeMinutes: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-700 font-bold">Dish Description</label>
                <textarea
                  rows={2}
                  value={editingFood.description || ''}
                  onChange={(e) => setEditingFood({ ...editingFood, description: e.target.value })}
                  placeholder="Aromatic sorghum-leaf rice, rich black shito, seasoned stews..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-700 font-bold">Photo URL</label>
                <input
                  type="url"
                  value={editingFood.imageUrl || ''}
                  onChange={(e) => setEditingFood({ ...editingFood, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Listing Format Switcher */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs text-slate-700 font-bold">Listing Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (editingFood.type !== 'build_your_meal') {
                        // If switching to build_your_meal, ensure at least 1 group or load waakye preset if empty
                        if (!editingFood.modifierGroups || editingFood.modifierGroups.length === 0) {
                          handleLoadPreset('waakye');
                        } else {
                          setEditingFood({ ...editingFood, type: 'build_your_meal' });
                        }
                      }
                    }}
                    className={`py-3 px-4 rounded-2xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${
                      editingFood.type === 'build_your_meal'
                        ? 'bg-orange-50 border-orange-500 text-orange-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-orange-600" />
                    <span>Build Your Meal (Customizable Options)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingFood({ ...editingFood, type: 'fixed' })}
                    className={`py-3 px-4 rounded-2xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${
                      editingFood.type === 'fixed'
                        ? 'bg-orange-50 border-orange-500 text-orange-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ChefHat className="w-4 h-4 text-orange-600" />
                    <span>Fixed Meal Combo</span>
                  </button>
                </div>
              </div>

              {/* ================================================================ */}
              {/* BUILD YOUR MEAL - OPTION GROUPS & ADD-ONS BUILDER */}
              {/* ================================================================ */}
              {editingFood.type === 'build_your_meal' && (
                <div className="mt-4 p-4 sm:p-5 bg-orange-50/50 border border-orange-200 rounded-3xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-orange-200/80 pb-3">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 font-['Outfit'] flex items-center gap-2">
                        <ListPlus className="w-4 h-4 text-orange-600" />
                        <span>Customer Option Groups (Proteins, Sides, Sauces)</span>
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        Customers can choose add-ons, select quantities, and customize their meal with these options.
                      </p>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-orange-500" />
                        <span>Quick Presets:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleLoadPreset('waakye')}
                        className="px-2 py-1 bg-white hover:bg-orange-100 border border-orange-200 rounded-lg text-[10px] font-bold text-orange-800 transition cursor-pointer"
                      >
                        Waakye
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadPreset('jollof')}
                        className="px-2 py-1 bg-white hover:bg-orange-100 border border-orange-200 rounded-lg text-[10px] font-bold text-orange-800 transition cursor-pointer"
                      >
                        Jollof
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadPreset('banku')}
                        className="px-2 py-1 bg-white hover:bg-orange-100 border border-orange-200 rounded-lg text-[10px] font-bold text-orange-800 transition cursor-pointer"
                      >
                        Banku
                      </button>
                    </div>
                  </div>

                  {/* Groups List */}
                  <div className="space-y-4">
                    {(!editingFood.modifierGroups || editingFood.modifierGroups.length === 0) && (
                      <div className="p-4 bg-white border border-dashed border-orange-300 rounded-2xl text-center space-y-2">
                        <p className="text-xs text-slate-600">No option groups added yet.</p>
                        <button
                          type="button"
                          onClick={handleAddModifierGroup}
                          className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                        >
                          + Add First Group
                        </button>
                      </div>
                    )}

                    {editingFood.modifierGroups?.map((group, groupIdx) => (
                      <div
                        key={group.id}
                        className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3"
                      >
                        {/* Group Header */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              Group #{groupIdx + 1} Name
                            </label>
                            <input
                              type="text"
                              required
                              value={group.name}
                              onChange={(e) => handleUpdateGroup(group.id, 'name', e.target.value)}
                              placeholder="e.g. Choose Your Protein"
                              className="w-full font-bold text-slate-900 border-b border-slate-200 focus:border-orange-500 py-1 text-sm focus:outline-none"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveGroup(group.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                            title="Delete Group"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Group Selection Rules */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                          <div className="space-y-0.5">
                            <label className="text-[10px] text-slate-500 font-semibold">Min Selection</label>
                            <input
                              type="number"
                              min={0}
                              max={10}
                              value={group.minSelection}
                              onChange={(e) => handleUpdateGroup(group.id, 'minSelection', Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-900"
                            />
                          </div>

                          <div className="space-y-0.5">
                            <label className="text-[10px] text-slate-500 font-semibold">Max Selection</label>
                            <input
                              type="number"
                              min={1}
                              max={20}
                              value={group.maxSelection}
                              onChange={(e) => handleUpdateGroup(group.id, 'maxSelection', Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-900"
                            />
                          </div>

                          <div className="flex items-center gap-1.5 pt-4">
                            <input
                              type="checkbox"
                              id={`req-${group.id}`}
                              checked={group.required}
                              onChange={(e) => handleUpdateGroup(group.id, 'required', e.target.checked)}
                              className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                            />
                            <label htmlFor={`req-${group.id}`} className="text-xs text-slate-700 font-bold select-none cursor-pointer">
                              Required
                            </label>
                          </div>

                          <div className="flex items-center gap-1.5 pt-4">
                            <input
                              type="checkbox"
                              id={`mult-${group.id}`}
                              checked={group.allowQuantityMultiplier ?? true}
                              onChange={(e) => handleUpdateGroup(group.id, 'allowQuantityMultiplier', e.target.checked)}
                              className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                            />
                            <label htmlFor={`mult-${group.id}`} className="text-xs text-slate-700 font-bold select-none cursor-pointer">
                              Allow Multiplier (2x, 3x)
                            </label>
                          </div>
                        </div>

                        {/* Options in this Group */}
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                            <span>Individual Choices in this Group</span>
                            <span className="text-[10px] text-slate-400 font-normal">Name & Extra Price (₵)</span>
                          </label>

                          <div className="space-y-1.5">
                            {group.options.map((opt) => (
                              <div
                                key={opt.id}
                                className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100"
                              >
                                <input
                                  type="text"
                                  required
                                  value={opt.name}
                                  onChange={(e) => handleUpdateOption(group.id, opt.id, 'name', e.target.value)}
                                  placeholder="e.g. Fried Fish / Wele / Egg"
                                  className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                                />

                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-slate-500 font-bold">₵</span>
                                  <input
                                    type="number"
                                    min={0}
                                    step="0.5"
                                    value={opt.price}
                                    onChange={(e) => handleUpdateOption(group.id, opt.id, 'price', Number(e.target.value))}
                                    placeholder="0.00"
                                    className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900 font-mono text-right focus:outline-none focus:border-orange-500"
                                  />
                                </div>

                                <label className="flex items-center gap-1 text-[11px] text-slate-600 select-none pl-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={opt.isDefault || false}
                                    onChange={(e) => handleUpdateOption(group.id, opt.id, 'isDefault', e.target.checked)}
                                    className="w-3.5 h-3.5 text-orange-600 rounded border-slate-300"
                                  />
                                  <span className="hidden sm:inline">Pre-selected</span>
                                </label>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(group.id, opt.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                                  title="Remove option"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddOption(group.id)}
                            className="mt-2 text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Choice Option to "{group.name || 'Group'}"</span>
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddModifierGroup}
                      className="w-full py-2.5 border-2 border-dashed border-orange-300 hover:border-orange-500 hover:bg-orange-100/50 text-orange-700 font-bold rounded-2xl text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Another Option Group (e.g. Sides, Sauces, Extras)</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Publish Dish Listing</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
