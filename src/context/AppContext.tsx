import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Store,
  FoodItem,
  Order,
  VendorApplication,
  Review,
  CartItem,
  UserRole,
  OrderStatus,
  SelectedModifier,
  UserAccount,
} from '../types';
import {
  INITIAL_STORES,
  INITIAL_FOOD_ITEMS,
  INITIAL_ORDERS,
  INITIAL_APPLICATIONS,
  INITIAL_REVIEWS,
  INITIAL_USERS,
} from '../data/mockData';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserAccount | null;
  users: UserAccount[];
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  loginAsUser: (user: UserAccount) => void;
  loginWithCredentials: (identifier: string, role: UserRole) => { success: boolean; message: string };
  registerCustomer: (name: string, phone: string, email: string, address: string) => UserAccount;
  logout: () => void;

  activeVendorStoreId: string;
  setActiveVendorStoreId: (storeId: string) => void;

  // Data
  stores: Store[];
  foodItems: FoodItem[];
  orders: Order[];
  applications: VendorApplication[];
  reviews: Review[];
  cart: CartItem[];
  favoriteStoreIds: string[];
  activeTrackOrderId: string | null;
  setActiveTrackOrderId: (orderId: string | null) => void;

  // Customer actions
  addToCart: (
    item: FoodItem,
    selectedModifiers: SelectedModifier[],
    quantity: number,
    specialInstructions?: string
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, newQty: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartDeliveryFee: number;
  cartTotal: number;
  placeOrder: (params: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    paymentMethod: 'momo_mtn' | 'momo_telecel' | 'card' | 'cash_on_delivery';
    customerNotes?: string;
  }) => Order;
  cancelOrder: (orderId: string) => void;
  reorder: (orderId: string) => void;
  toggleFavorite: (storeId: string) => void;
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  submitVendorApplication: (data: Omit<VendorApplication, 'id' | 'status' | 'appliedAt'>) => VendorApplication;

  // Vendor actions
  updateStoreStatus: (storeId: string, isOpen: boolean) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  toggleFoodAvailability: (foodItemId: string) => void;
  saveFoodItem: (item: FoodItem) => void;
  deleteFoodItem: (foodItemId: string) => void;
  verifyPickupOtp: (orderId: string, inputOtp: string) => { success: boolean; message: string };
  renewSubscription: (storeId: string) => void;
  simulateGracePeriod: (storeId: string) => void;
  simulateSubscriptionExpiry: (storeId: string) => void;

  // Admin actions
  reviewApplication: (appId: string, status: 'approved' | 'rejected' | 'suspended') => void;
  toggleStoreLock: (storeId: string) => void;
  verifyDeliveryOtp: (orderId: string, inputOtp: string) => { success: boolean; message: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('chowgrid_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('chowgrid_current_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0];
  });

  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('chowgrid_role') as UserRole) || 'customer';
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const [activeVendorStoreId, setActiveVendorStoreId] = useState<string>('store-1');
  const [activeTrackOrderId, setActiveTrackOrderId] = useState<string | null>('order-1045');

  const [stores, setStores] = useState<Store[]>(() => {
    const saved = localStorage.getItem('chowgrid_stores');
    return saved ? JSON.parse(saved) : INITIAL_STORES;
  });

  const [foodItems, setFoodItems] = useState<FoodItem[]>(() => {
    const saved = localStorage.getItem('chowgrid_foods');
    return saved ? JSON.parse(saved) : INITIAL_FOOD_ITEMS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('chowgrid_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [applications, setApplications] = useState<VendorApplication[]>(() => {
    const saved = localStorage.getItem('chowgrid_apps');
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('chowgrid_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('chowgrid_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [favoriteStoreIds, setFavoriteStoreIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('chowgrid_favs');
    return saved ? JSON.parse(saved) : ['store-1'];
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('chowgrid_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('chowgrid_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('chowgrid_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('chowgrid_stores', JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem('chowgrid_foods', JSON.stringify(foodItems));
  }, [foodItems]);

  useEffect(() => {
    localStorage.setItem('chowgrid_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('chowgrid_apps', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('chowgrid_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('chowgrid_favs', JSON.stringify(favoriteStoreIds));
  }, [favoriteStoreIds]);

  // Auth operations
  const loginAsUser = (user: UserAccount) => {
    setCurrentUser(user);
    setRole(user.role);
    if (user.role === 'vendor' && user.vendorStoreId) {
      setActiveVendorStoreId(user.vendorStoreId);
    }
    setIsAuthModalOpen(false);
  };

  const loginWithCredentials = (identifier: string, targetRole: UserRole) => {
    const clean = identifier.trim().toLowerCase();
    const found = users.find(
      (u) =>
        (u.email.toLowerCase() === clean || u.phone.includes(clean)) &&
        u.role === targetRole
    );

    if (found) {
      loginAsUser(found);
      return { success: true, message: `Welcome back, ${found.name}!` };
    }

    // Auto-create customer if logging in with new phone/email
    if (targetRole === 'customer') {
      const newUser: UserAccount = {
        id: `user-${Date.now()}`,
        name: identifier.includes('@') ? identifier.split('@')[0] : 'Valued Customer',
        email: identifier.includes('@') ? identifier : `${clean}@customer.gh`,
        phone: identifier.includes('@') ? '+233 24 000 0000' : identifier,
        role: 'customer',
        deliveryAddress: 'Accra, Ghana',
      };
      setUsers((prev) => [...prev, newUser]);
      loginAsUser(newUser);
      return { success: true, message: `Account created! Welcome, ${newUser.name}!` };
    }

    return {
      success: false,
      message: `No ${targetRole} account found for "${identifier}". Please check details or select a demo profile.`,
    };
  };

  const registerCustomer = (name: string, phone: string, email: string, address: string) => {
    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name,
      phone,
      email,
      deliveryAddress: address,
      role: 'customer',
    };
    setUsers((prev) => [...prev, newUser]);
    loginAsUser(newUser);
    return newUser;
  };

  const logout = () => {
    setCurrentUser(null);
    setRole('customer');
  };

  // Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const cartDeliveryFee = cart.length > 0 ? 15 : 0;
  const cartTotal = cartSubtotal + cartDeliveryFee;

  // Cart operations
  const addToCart = (
    item: FoodItem,
    selectedModifiers: SelectedModifier[],
    quantity: number,
    specialInstructions?: string
  ) => {
    const store = stores.find((s) => s.id === item.storeId);
    const storeName = store ? store.name : 'Food Vendor';

    if (cart.length > 0 && cart[0].storeId !== item.storeId) {
      if (
        !window.confirm(
          `Your cart contains items from "${cart[0].storeName}". Would you like to clear your cart and start a new order with "${storeName}"?`
        )
      ) {
        return;
      }
      setCart([]);
    }

    const modifiersPrice = selectedModifiers.reduce(
      (sum, m) => sum + m.unitPrice * m.quantity,
      0
    );
    const unitCalculatedPrice = item.basePrice + modifiersPrice;
    const totalPrice = unitCalculatedPrice * quantity;

    const newCartItem: CartItem = {
      cartItemId: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      foodItemId: item.id,
      storeId: item.storeId,
      storeName,
      name: item.name,
      basePrice: item.basePrice,
      quantity,
      selectedModifiers,
      unitCalculatedPrice,
      totalPrice,
      specialInstructions,
      imageUrl: item.imageUrl,
    };

    setCart((prev) => [...prev, newCartItem]);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          return {
            ...item,
            quantity: newQty,
            totalPrice: item.unitCalculatedPrice * newQty,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const toggleFavorite = (storeId: string) => {
    setFavoriteStoreIds((prev) =>
      prev.includes(storeId) ? prev.filter((id) => id !== storeId) : [...prev, storeId]
    );
  };

  // Customer Place Order
  const placeOrder = ({
    customerName,
    customerPhone,
    deliveryAddress,
    paymentMethod,
    customerNotes,
  }: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    paymentMethod: 'momo_mtn' | 'momo_telecel' | 'card' | 'cash_on_delivery';
    customerNotes?: string;
  }) => {
    if (cart.length === 0) throw new Error('Cart is empty');

    const pickupOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const orderNumber = `#${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      orderNumber,
      customerId: currentUser?.id || `cust-${Date.now()}`,
      customerName,
      customerPhone,
      deliveryAddress,
      storeId: cart[0].storeId,
      storeName: cart[0].storeName,
      items: [...cart],
      subtotal: cartSubtotal,
      deliveryFee: cartDeliveryFee,
      total: cartTotal,
      status: 'new',
      pickupOtp,
      deliveryOtp,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash_on_delivery' ? 'pending' : 'paid',
      createdAt: new Date().toISOString(),
      estimatedPrepTime: 15,
      customerNotes,
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setActiveTrackOrderId(newOrder.id);
    return newOrder;
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
    );
  };

  const reorder = (orderId: string) => {
    const pastOrder = orders.find((o) => o.id === orderId);
    if (!pastOrder) return;
    setCart(pastOrder.items);
  };

  const addReview = (newReview: Omit<Review, 'id' | 'createdAt'>) => {
    const rev: Review = {
      ...newReview,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [rev, ...prev]);
  };

  // Vendor Functions
  const updateStoreStatus = (storeId: string, isOpen: boolean) => {
    setStores((prev) =>
      prev.map((s) => (s.id === storeId ? { ...s, isOpen } : s))
    );
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updated = { ...o, status };
          if (status === 'rider_assigned' && !o.riderAssignedName) {
            updated.riderAssignedName = 'Kofi Rider (Express 04)';
            updated.riderPhone = '+233 54 883 1122';
          }
          if (status === 'delivered') {
            updated.deliveredAt = new Date().toISOString();
          }
          return updated;
        }
        return o;
      })
    );
  };

  const toggleFoodAvailability = (foodItemId: string) => {
    setFoodItems((prev) =>
      prev.map((f) => (f.id === foodItemId ? { ...f, isAvailable: !f.isAvailable } : f))
    );
  };

  const saveFoodItem = (item: FoodItem) => {
    setFoodItems((prev) => {
      const idx = prev.findIndex((f) => f.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [item, ...prev];
    });
  };

  const deleteFoodItem = (foodItemId: string) => {
    setFoodItems((prev) => prev.filter((f) => f.id !== foodItemId));
  };

  const verifyPickupOtp = (orderId: string, inputOtp: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found' };
    if (order.pickupOtp !== inputOtp.trim()) {
      return { success: false, message: 'Invalid Pickup OTP code.' };
    }
    updateOrderStatus(orderId, 'picked_up');
    return { success: true, message: 'Pickup OTP verified! Order handed over to rider.' };
  };

  const verifyDeliveryOtp = (orderId: string, inputOtp: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found' };
    if (order.deliveryOtp !== inputOtp.trim()) {
      return { success: false, message: 'Invalid Customer Delivery OTP code.' };
    }
    updateOrderStatus(orderId, 'delivered');
    return { success: true, message: 'Delivery OTP verified! Order marked as successfully delivered.' };
  };

  const renewSubscription = (storeId: string) => {
    setStores((prev) =>
      prev.map((s) => {
        if (s.id === storeId) {
          const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          const grace = new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString();
          return {
            ...s,
            subscriptionStatus: 'active',
            subscriptionExpiresAt: expires,
            gracePeriodEndsAt: grace,
          };
        }
        return s;
      })
    );
  };

  const simulateGracePeriod = (storeId: string) => {
    setStores((prev) =>
      prev.map((s) => {
        if (s.id === storeId) {
          return {
            ...s,
            subscriptionStatus: 'grace_period',
            subscriptionExpiresAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
            gracePeriodEndsAt: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
          };
        }
        return s;
      })
    );
  };

  const simulateSubscriptionExpiry = (storeId: string) => {
    setStores((prev) =>
      prev.map((s) => {
        if (s.id === storeId) {
          return {
            ...s,
            subscriptionStatus: 'suspended',
            isOpen: false,
            subscriptionExpiresAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
            gracePeriodEndsAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
          };
        }
        return s;
      })
    );
  };

  const submitVendorApplication = (
    data: Omit<VendorApplication, 'id' | 'status' | 'appliedAt'>
  ): VendorApplication => {
    const newApp: VendorApplication = {
      ...data,
      id: `app-${Date.now()}`,
      status: 'pending',
      appliedAt: new Date().toISOString(),
    };
    setApplications((prev) => [newApp, ...prev]);
    return newApp;
  };

  // Admin Functions
  const reviewApplication = (
    appId: string,
    status: 'approved' | 'rejected' | 'suspended'
  ) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status } : a))
    );
  };

  const toggleStoreLock = (storeId: string) => {
    setStores((prev) =>
      prev.map((s) => {
        if (s.id === storeId) {
          const newStatus = s.subscriptionStatus === 'suspended' ? 'active' : 'suspended';
          return {
            ...s,
            subscriptionStatus: newStatus,
            isOpen: newStatus === 'active',
          };
        }
        return s;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentUser,
        users,
        isAuthModalOpen,
        setIsAuthModalOpen,
        loginAsUser,
        loginWithCredentials,
        registerCustomer,
        logout,
        activeVendorStoreId,
        setActiveVendorStoreId,
        stores,
        foodItems,
        orders,
        applications,
        reviews,
        cart,
        favoriteStoreIds,
        activeTrackOrderId,
        setActiveTrackOrderId,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSubtotal,
        cartDeliveryFee,
        cartTotal,
        placeOrder,
        cancelOrder,
        reorder,
        toggleFavorite,
        addReview,
        submitVendorApplication,
        updateStoreStatus,
        updateOrderStatus,
        toggleFoodAvailability,
        saveFoodItem,
        deleteFoodItem,
        verifyPickupOtp,
        verifyDeliveryOtp,
        renewSubscription,
        simulateGracePeriod,
        simulateSubscriptionExpiry,
        reviewApplication,
        toggleStoreLock,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
