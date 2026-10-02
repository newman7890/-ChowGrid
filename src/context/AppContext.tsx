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
import { SupabaseService } from '../services/supabaseService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserAccount | null;
  users: UserAccount[];
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  loginAsUser: (user: UserAccount) => void;
  loginWithCredentials: (identifier: string, password?: string, targetRole?: UserRole) => Promise<{ success: boolean; message: string }>;
  registerCustomer: (name: string, phone: string, email: string, address: string, password?: string, role?: UserRole) => Promise<{ success: boolean; message: string; user?: UserAccount }>;
  loginWithOAuth: (provider: 'google') => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resendConfirmationEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;

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

  // Admin actions
  reviewApplication: (appId: string, status: 'approved' | 'rejected' | 'suspended', rejectionReason?: string) => void;
  toggleStoreLock: (storeId: string) => void;
  verifyDeliveryOtp: (orderId: string, inputOtp: string) => { success: boolean; message: string };
  updateUserRole: (userId: string, newRole: UserRole) => void;
  deleteUserAccount: (userId: string) => void;
  clearAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Ensure browser LocalStorage is completely wiped and never written to
if (typeof window !== 'undefined') {
  try {
    localStorage.clear();
  } catch (e) {
    // ignore
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [role, setRole] = useState<UserRole>('customer');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [activeVendorStoreId, setActiveVendorStoreId] = useState<string>('store-1');
  const [activeTrackOrderId, setActiveTrackOrderId] = useState<string | null>(null);
  const [stores, setStores] = useState<Store[]>(INITIAL_STORES);
  const [foodItems, setFoodItems] = useState<FoodItem[]>(INITIAL_FOOD_ITEMS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favoriteStoreIds, setFavoriteStoreIds] = useState<string[]>([]);

  // Automatically enforce admin role for newm5811@gmail.com in memory
  useEffect(() => {
    if (currentUser?.email?.toLowerCase() === 'newm5811@gmail.com' && currentUser.role !== 'admin') {
      const updated: UserAccount = {
        ...currentUser,
        role: 'admin',
        name: 'Newman (Administrator)',
      };
      setCurrentUser(updated);
      setRole('admin');
    }
  }, [currentUser]);

  // Load initial data from Supabase & Hydrate Session if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const loadSupabaseData = async () => {
      try {
        const [dbStores, dbFoods, dbOrders, dbApps, dbUsers] = await Promise.all([
          SupabaseService.getStores(),
          SupabaseService.getFoodItems(),
          SupabaseService.getOrders(),
          SupabaseService.getApplications(),
          SupabaseService.getUsers(),
        ]);

        if (dbStores !== null) setStores(dbStores);
        if (dbFoods !== null) setFoodItems(dbFoods);
        if (dbOrders !== null) setOrders(dbOrders);
        if (dbApps !== null) setApplications(dbApps);
        if (dbUsers !== null) setUsers(dbUsers);
      } catch (err) {
        console.warn('Error fetching Supabase tables:', err);
      }
    };

    loadSupabaseData();

    // Check active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        SupabaseService.getUserProfile(session.user.id).then((profile) => {
          const isAdminEmail = session.user.email?.toLowerCase() === 'newm5811@gmail.com';
          const resolvedRole: UserRole = isAdminEmail
            ? 'admin'
            : ((profile?.role as UserRole) || 'customer');

          const userAcc: UserAccount = {
            id: profile?.id || session.user.id,
            name: profile?.full_name || session.user.email?.split('@')[0] || 'User',
            email: profile?.email || session.user.email || '',
            phone: profile?.phone || '',
            role: resolvedRole,
            avatarUrl: profile?.avatar_url,
            deliveryAddress: profile?.delivery_address || 'Accra, Ghana',
            vendorStoreId: profile?.vendor_store_id,
          };
          setCurrentUser(userAcc);
          setRole(userAcc.role);
          if (userAcc.role === 'vendor' && userAcc.vendorStoreId) {
            setActiveVendorStoreId(userAcc.vendorStoreId);
          }
        });
      }
    });

    // Listen to Supabase Auth State changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await SupabaseService.getUserProfile(session.user.id);
        const isAdminEmail = session.user.email?.toLowerCase() === 'newm5811@gmail.com';
        const resolvedRole: UserRole = isAdminEmail
          ? 'admin'
          : ((profile?.role || session.user.user_metadata?.role || 'customer') as UserRole);

        const userAcc: UserAccount = {
          id: session.user.id,
          name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          phone: profile?.phone || session.user.user_metadata?.phone || '',
          role: resolvedRole,
          avatarUrl: profile?.avatar_url || session.user.user_metadata?.avatar_url,
          deliveryAddress: profile?.delivery_address || 'Accra, Ghana',
          vendorStoreId: profile?.vendor_store_id,
        };
        setCurrentUser(userAcc);
        setRole(userAcc.role);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setRole('customer');
      }
    });

    // Subscribe to Realtime order notifications
    const unsubscribe = SupabaseService.subscribeToOrders((updatedOrder) => {
      setOrders((prev) => {
        const exists = prev.some((o) => o.id === updatedOrder.id);
        if (exists) {
          return prev.map((o) => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o));
        }
        return [updatedOrder, ...prev];
      });
    });

    return () => {
      authListener?.subscription?.unsubscribe();
      unsubscribe();
    };
  }, []);

  // Auth operations
  const loginAsUser = (user: UserAccount) => {
    setCurrentUser(user);
    setRole(user.role);
    if (user.role === 'vendor' && user.vendorStoreId) {
      setActiveVendorStoreId(user.vendorStoreId);
    }
    setIsAuthModalOpen(false);
  };

  const loginWithCredentials = async (
    identifier: string,
    password?: string,
    targetRole: UserRole = 'customer'
  ): Promise<{ success: boolean; message: string }> => {
    const clean = identifier.trim();
    const isAdminEmail = clean.toLowerCase() === 'newm5811@gmail.com';

    // 1. Authenticate with live Supabase database
    if (isSupabaseConfigured) {
      if (!password) {
        return { success: false, message: 'Password is required to sign in.' };
      }

      const res = await SupabaseService.signIn(clean, password);
      if (res.user) {
        const profile = await SupabaseService.getUserProfile(res.user.id);
        const resolvedRole: UserRole = isAdminEmail
          ? 'admin'
          : ((profile?.role || res.user.user_metadata?.role || targetRole) as UserRole);

        const userAcc: UserAccount = {
          id: res.user.id,
          name: profile?.full_name || res.user.user_metadata?.full_name || clean.split('@')[0],
          email: clean,
          phone: profile?.phone || '+233 24 000 0000',
          role: resolvedRole,
          avatarUrl: profile?.avatar_url,
          deliveryAddress: profile?.delivery_address || 'Accra, Ghana',
        };
        loginAsUser(userAcc);
        return { success: true, message: `Welcome back, ${userAcc.name}!` };
      }

      return {
        success: false,
        message: res.error || 'Invalid credentials. Account does not exist in the database.',
      };
    }

    // 2. Offline / local session fallback: Match explicitly registered user
    const lower = clean.toLowerCase();
    const found = users.find(
      (u) =>
        u.email.toLowerCase() === lower || u.phone.includes(clean)
    );

    if (found) {
      const accountToLogin = isAdminEmail ? { ...found, role: 'admin' as UserRole } : found;
      loginAsUser(accountToLogin);
      return { success: true, message: `Welcome back, ${accountToLogin.name}!` };
    }

    // If not found in database or registered accounts, reject sign in
    return {
      success: false,
      message: `No account found for "${clean}". Please register / sign up first.`,
    };
  };

  const registerCustomer = async (
    name: string,
    phone: string,
    email: string,
    address: string,
    password?: string,
    targetRole: UserRole = 'customer'
  ): Promise<{ success: boolean; message: string; user?: UserAccount }> => {
    // 1. Try real Supabase Sign Up if email & password are provided
    if (isSupabaseConfigured && email && password) {
      const res = await SupabaseService.signUp(email, password, {
        fullName: name,
        phone,
        role: targetRole,
        address,
      });

      if (res.error) {
        // Return friendly message if already registered or failed
        if (res.error.toLowerCase().includes('already registered')) {
          return { success: false, message: 'An account with this email already exists. Please Sign In.' };
        }
        return { success: false, message: res.error };
      }

      const userAcc: UserAccount = {
        id: res.user?.id || `user-${Date.now()}`,
        name,
        phone,
        email,
        deliveryAddress: address,
        role: targetRole,
      };

      setUsers((prev) => [...prev, userAcc]);
      loginAsUser(userAcc);
      return { success: true, message: `Welcome to ChowGrid, ${name}!`, user: userAcc };
    }

    // 2. Local registration fallback
    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name,
      phone,
      email: email || `${phone.replace(/[^0-9]/g, '')}@customer.gh`,
      deliveryAddress: address,
      role: targetRole,
    };
    setUsers((prev) => [...prev, newUser]);
    loginAsUser(newUser);
    return { success: true, message: `Account created! Welcome, ${newUser.name}!`, user: newUser };
  };

  const loginWithOAuth = async (provider: 'google'): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseConfigured) {
      return { success: false, message: 'Google Sign-In is unavailable in offline mode. Please use Email/Phone to sign in.' };
    }

    const { error } = await SupabaseService.signInWithOAuth(provider);
    if (error) return { success: false, message: error };
    return { success: true, message: 'Redirecting to Google...' };
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    if (!email.trim() || !email.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    if (isSupabaseConfigured) {
      const res = await SupabaseService.resetPasswordForEmail(email.trim());
      if (!res.success) return { success: false, message: res.error || 'Failed to send reset link.' };
      return { success: true, message: `Password reset link sent to ${email}!` };
    }

    return { success: true, message: `Password reset instructions sent to ${email}!` };
  };

  const resendConfirmationEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseConfigured) {
      return { success: false, message: 'Supabase is not configured.' };
    }
    const res = await SupabaseService.resendConfirmationEmail(email.trim());
    if (res.error) {
      return { success: false, message: res.error };
    }
    return { success: true, message: `Confirmation link has been resent to ${email}. Please check your inbox and spam folder.` };
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await SupabaseService.signOut();
    }
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

    // Sync to Supabase in background
    if (isSupabaseConfigured) {
      SupabaseService.createOrder(newOrder).catch((e) =>
        console.warn('Background Supabase order sync failed:', e)
      );
    }

    return newOrder;
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
    );
    if (isSupabaseConfigured) {
      SupabaseService.updateOrderStatus(orderId, 'cancelled');
    }
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
    if (isSupabaseConfigured) {
      SupabaseService.updateStore(storeId, { isOpen });
    }
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

    if (isSupabaseConfigured) {
      SupabaseService.updateOrderStatus(orderId, status);
    }
  };

  const toggleFoodAvailability = (foodItemId: string) => {
    let nextAvailable = true;
    setFoodItems((prev) =>
      prev.map((f) => {
        if (f.id === foodItemId) {
          nextAvailable = !f.isAvailable;
          return { ...f, isAvailable: nextAvailable };
        }
        return f;
      })
    );
    if (isSupabaseConfigured) {
      SupabaseService.toggleFoodAvailability(foodItemId, nextAvailable);
    }
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
    if (isSupabaseConfigured) {
      SupabaseService.saveFoodItem(item);
    }
  };

  const deleteFoodItem = (foodItemId: string) => {
    setFoodItems((prev) => prev.filter((f) => f.id !== foodItemId));
    if (isSupabaseConfigured) {
      SupabaseService.deleteFoodItem(foodItemId);
    }
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
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const grace = new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString();

    setStores((prev) =>
      prev.map((s) => {
        if (s.id === storeId) {
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

    if (isSupabaseConfigured) {
      SupabaseService.updateStore(storeId, {
        subscriptionStatus: 'active',
        subscriptionExpiresAt: expires,
        gracePeriodEndsAt: grace,
      });
    }
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

    if (isSupabaseConfigured) {
      SupabaseService.submitApplication(newApp).catch((e) =>
        console.warn('Background Supabase application sync failed:', e)
      );
    }

    return newApp;
  };

  // Admin Functions
  const reviewApplication = (
    appId: string,
    status: 'approved' | 'rejected' | 'suspended',
    rejectionReason?: string
  ) => {
    const app = applications.find((a) => a.id === appId);
    if (!app) return;

    // 1. Update application status & rejection notes
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status, notes: rejectionReason || a.notes } : a))
    );

    if (isSupabaseConfigured) {
      SupabaseService.updateApplicationStatus(appId, status, rejectionReason);
    }

    // 2. If approved, automatically create a new active Store in the marketplace
    if (status === 'approved') {
      const storeId = `store-${Date.now()}`;
      const newStore: Store = {
        id: storeId,
        vendorId: app.id,
        name: app.businessName,
        tagline: `Authentic ${app.foodType} specialties by ${app.applicantName}`,
        logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
        rating: 5.0,
        reviewCount: 0,
        prepTimeEstimate: '20-30 min',
        isOpen: true,
        scheduledHours: 'Mon-Sat: 8:00 AM - 9:00 PM',
        subscriptionStatus: 'active',
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        gracePeriodEndsAt: new Date(Date.now() + 37 * 24 * 3600 * 1000).toISOString(),
        monthlyFee: 150,
        category: app.foodType || 'Local Ghanaian',
        address: app.storeAddress,
        phone: app.phone,
        isFeatured: true,
        isPopular: false,
      };

      setStores((prev) => [newStore, ...prev]);

      if (isSupabaseConfigured) {
        SupabaseService.createStore(newStore);
      }

      // 3. Promote or create the vendor user account
      setUsers((prev) => {
        const existingIdx = prev.findIndex(
          (u) => u.email.toLowerCase() === app.email.toLowerCase() || u.phone === app.phone
        );
        if (existingIdx >= 0) {
          const updated = [...prev];
          const matchedUser = updated[existingIdx];
          updated[existingIdx] = {
            ...matchedUser,
            role: 'vendor',
            vendorStoreId: storeId,
          };
          if (isSupabaseConfigured) {
            SupabaseService.updateUserProfile(matchedUser.id, { role: 'vendor', vendor_store_id: storeId });
          }
          return updated;
        } else {
          const newVendorUser: UserAccount = {
            id: `user-vendor-${Date.now()}`,
            name: app.applicantName,
            email: app.email,
            phone: app.phone,
            role: 'vendor',
            vendorStoreId: storeId,
            deliveryAddress: app.storeAddress,
          };
          return [...prev, newVendorUser];
        }
      });
    }
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, role: newRole } : null));
      setRole(newRole);
    }
    if (isSupabaseConfigured) {
      SupabaseService.updateUserProfile(userId, { role: newRole });
    }
  };

  const deleteUserAccount = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (currentUser?.id === userId) {
      logout();
    }
    if (isSupabaseConfigured) {
      SupabaseService.deleteUserProfile(userId);
    }
  };

  const toggleStoreLock = (storeId: string) => {
    let nextStatus: 'active' | 'grace_period' | 'suspended' = 'suspended';
    let nextOpen = false;
    setStores((prev) =>
      prev.map((s) => {
        if (s.id === storeId) {
          nextStatus = s.subscriptionStatus === 'suspended' ? 'active' : 'suspended';
          nextOpen = nextStatus === 'active';
          return {
            ...s,
            subscriptionStatus: nextStatus,
            isOpen: nextOpen,
          };
        }
        return s;
      })
    );
    if (isSupabaseConfigured) {
      SupabaseService.updateStore(storeId, {
        subscriptionStatus: nextStatus,
        isOpen: nextOpen,
      });
    }
  };

  const clearAllData = async () => {
    // 1. Wipe local state
    setStores([]);
    setFoodItems([]);
    setOrders([]);
    setApplications([]);
    setReviews([]);
    setCart([]);
    setFavoriteStoreIds([]);
    setUsers([]);
    setCurrentUser(null);
    setRole('customer');

    // 2. Wipe browser localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.clear();
      } catch (e) {
        // ignore
      }
    }

    // 3. Wipe Supabase backend tables
    await SupabaseService.deleteAllRecords();
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
        loginWithOAuth,
        resetPassword,
        resendConfirmationEmail,
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
        reviewApplication,
        toggleStoreLock,
        updateUserRole,
        deleteUserAccount,
        clearAllData,
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
