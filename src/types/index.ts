export type UserRole = 'customer' | 'vendor' | 'admin';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  deliveryAddress?: string;
  vendorStoreId?: string; // if vendor
}

export type SubscriptionStatus = 'active' | 'grace_period' | 'suspended';

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
  isDefault?: boolean;
}

export interface ModifierGroup {
  id: string;
  name: string; // e.g. "Select Protein", "Extras & Sides"
  minSelection: number; // e.g. 1
  maxSelection: number; // e.g. 1 or 3
  required: boolean;
  allowQuantityMultiplier?: boolean; // allow e.g. 2x Meat
  options: ModifierOption[];
}

export interface FoodItem {
  id: string;
  storeId: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
  type: 'fixed' | 'build_your_meal';
  prepTimeMinutes: number; // e.g. 15
  modifierGroups?: ModifierGroup[];
  rating?: number;
  salesCount?: number;
}

export interface Store {
  id: string;
  vendorId: string;
  name: string;
  tagline: string;
  logoUrl: string;
  coverUrl: string;
  rating: number;
  reviewCount: number;
  prepTimeEstimate: string; // "10-15 min"
  isOpen: boolean;
  scheduledHours: string; // "Mon-Sat: 8:00 AM - 9:00 PM"
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiresAt: string; // ISO date
  gracePeriodEndsAt: string; // ISO date (7 days after expiry)
  monthlyFee: number; // e.g. 70 GHS (₵)
  category: string;
  address: string;
  phone: string;
  isPopular?: boolean;
  isFeatured?: boolean;
}

export interface SelectedModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  unitPrice: number;
  quantity: number;
}

export interface CartItem {
  cartItemId: string;
  foodItemId: string;
  storeId: string;
  storeName: string;
  name: string;
  basePrice: number;
  quantity: number;
  selectedModifiers: SelectedModifier[];
  unitCalculatedPrice: number;
  totalPrice: number;
  specialInstructions?: string;
  imageUrl?: string;
}

export type OrderStatus =
  | 'new'
  | 'accepted'
  | 'preparing'
  | 'ready_for_pickup'
  | 'rider_assigned'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string; // e.g. "#1045"
  customerId?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  storeId: string;
  storeName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  pickupOtp: string; // 4-digit code e.g. "7284"
  deliveryOtp: string; // 4-digit code e.g. "5824"
  paymentMethod: 'momo_mtn' | 'momo_telecel' | 'card' | 'cash_on_delivery';
  paymentStatus: 'paid' | 'pending';
  createdAt: string;
  riderAssignedName?: string;
  riderPhone?: string;
  estimatedPrepTime: number; // in mins
  deliveredAt?: string;
  customerNotes?: string;
}

export interface VendorApplication {
  id: string;
  applicantName: string;
  businessName: string;
  phone: string;
  email: string;
  storeAddress: string;
  ghanaCardNumber: string;
  foodType: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  appliedAt: string;
  notes?: string;
}

export interface Review {
  id: string;
  orderId: string;
  storeId: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  foodRating: number;
  deliveryRating: number;
  createdAt: string;
}
