import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Store, FoodItem, Order, VendorApplication } from '../types';

/**
 * ChowGrid Supabase Backend Service
 * Handles data fetching, live realtime subscriptions, mutations, and authentication
 */
export const SupabaseService = {
  // 1. Fetch all Stores
  async getStores(): Promise<Store[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching stores from Supabase:', error);
      return null;
    }

    return data.map((s: any) => ({
      id: s.id,
      vendorId: s.vendor_id || 'vendor-1',
      name: s.name,
      tagline: s.description || 'Authentic Ghanaian Dishes',
      logoUrl: s.logo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150',
      coverUrl: s.cover_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
      rating: Number(s.rating || 5.0),
      reviewCount: s.total_reviews || 0,
      prepTimeEstimate: s.prep_time || '15-25 min',
      isOpen: Boolean(s.is_open),
      scheduledHours: 'Mon-Sat: 8:00 AM - 9:00 PM',
      subscriptionStatus: s.subscription_status || 'active',
      subscriptionExpiresAt: s.subscription_renews_at || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      gracePeriodEndsAt: new Date(Date.now() + 37 * 24 * 3600 * 1000).toISOString(),
      monthlyFee: Number(s.monthly_fee || 150),
      category: s.category || 'Local Ghanaian',
      address: s.address || 'Accra, Ghana',
      phone: s.momo_payout_number || '+233 24 000 0000',
      isPopular: true,
      isFeatured: true,
    }));
  },

  // 2. Fetch all Food Items & Modifier Groups
  async getFoodItems(): Promise<FoodItem[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    const { data, error } = await supabase
      .from('food_items')
      .select(`
        *,
        modifier_groups:modifier_groups(
          *,
          options:modifier_options(*)
        )
      `)
      .eq('is_available', true);

    if (error) {
      console.error('Error fetching food items from Supabase:', error);
      return null;
    }

    return data.map((f: any) => ({
      id: f.id,
      storeId: f.store_id,
      name: f.name,
      description: f.description || '',
      basePrice: Number(f.base_price),
      imageUrl: f.image_url || '',
      category: f.category,
      isAvailable: Boolean(f.is_available),
      type: f.type === 'build_your_meal' ? 'build_your_meal' : 'fixed',
      prepTimeMinutes: f.prep_time_minutes || 15,
      modifierGroups: f.modifier_groups?.map((g: any) => ({
        id: g.id,
        name: g.name,
        minSelection: g.min_selection,
        maxSelection: g.max_selection,
        required: g.required,
        allowQuantityMultiplier: g.allow_quantity_multiplier,
        options: g.options?.map((o: any) => ({
          id: o.id,
          name: o.name,
          price: Number(o.price),
          isDefault: o.is_default,
        })) || [],
      })) || [],
    }));
  },

  // 3. Create New Order with Items and Modifiers
  async createOrder(order: Order): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    try {
      const { error: orderError } = await supabase.from('orders').insert({
        id: order.id,
        order_number: order.orderNumber,
        customer_id: order.customerId || null,
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        delivery_address: order.deliveryAddress,
        customer_notes: order.customerNotes || null,
        store_id: order.storeId,
        store_name: order.storeName,
        status: order.status,
        subtotal: order.subtotal,
        delivery_fee: order.deliveryFee,
        total: order.total,
        payment_method: order.paymentMethod,
        payment_status: order.paymentStatus,
        pickup_otp: order.pickupOtp,
        delivery_otp: order.deliveryOtp,
        estimated_minutes: order.estimatedPrepTime,
        created_at: order.createdAt,
      });

      if (orderError) throw orderError;

      // Insert line items
      for (const item of order.items) {
        const { data: insertedItem, error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            food_item_id: item.foodItemId,
            food_name: item.name,
            unit_price: item.unitCalculatedPrice,
            quantity: item.quantity,
            special_instructions: item.specialInstructions || null,
          })
          .select()
          .single();

        if (itemError) throw itemError;

        // Insert modifiers for this line item
        if (item.selectedModifiers && item.selectedModifiers.length > 0) {
          const modPayload = item.selectedModifiers.map((m) => ({
            order_item_id: insertedItem.id,
            group_name: m.groupName,
            option_name: m.optionName,
            unit_price: m.unitPrice,
            quantity: m.quantity,
          }));

          const { error: modError } = await supabase
            .from('order_item_modifiers')
            .insert(modPayload);

          if (modError) throw modError;
        }
      }

      return true;
    } catch (err) {
      console.error('Failed to create order in Supabase:', err);
      return false;
    }
  },

  // 4. Fetch all orders (customer or vendor)
  async getOrders(): Promise<Order[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          modifiers:order_item_modifiers(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders from Supabase:', error);
      return null;
    }

    return data.map((o: any) => ({
      id: o.id,
      orderNumber: o.order_number,
      customerId: o.customer_id,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      deliveryAddress: o.delivery_address,
      customerNotes: o.customer_notes,
      storeId: o.store_id,
      storeName: o.store_name,
      items: o.items?.map((i: any) => ({
        cartItemId: i.id,
        foodItemId: i.food_item_id,
        storeId: o.store_id,
        storeName: o.store_name,
        name: i.food_name,
        basePrice: Number(i.unit_price),
        quantity: i.quantity,
        unitCalculatedPrice: Number(i.unit_price),
        totalPrice: Number(i.unit_price) * i.quantity,
        specialInstructions: i.special_instructions,
        selectedModifiers: i.modifiers?.map((m: any) => ({
          groupId: m.id,
          groupName: m.group_name,
          optionId: m.id,
          optionName: m.option_name,
          unitPrice: Number(m.unit_price),
          quantity: m.quantity,
        })) || [],
      })) || [],
      subtotal: Number(o.subtotal),
      deliveryFee: Number(o.delivery_fee),
      total: Number(o.total),
      paymentMethod: o.payment_method,
      paymentStatus: o.payment_status,
      status: o.status,
      pickupOtp: o.pickup_otp,
      deliveryOtp: o.delivery_otp,
      riderAssignedName: o.rider_name,
      riderPhone: o.rider_phone,
      estimatedPrepTime: o.estimated_minutes || 15,
      createdAt: o.created_at,
    }));
  },

  // 5. Update Order Status
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      return false;
    }

    return true;
  },

  // 6. Subscribe to Realtime Order Updates
  subscribeToOrders(callback: (order: Order) => void) {
    if (!isSupabaseConfigured || !supabase) return () => {};

    const channel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload: any) => {
          if (payload.new) {
            callback(payload.new as Order);
          }
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  },

  // 7. Submit Vendor Application
  async submitApplication(app: VendorApplication): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    const { error } = await supabase.from('vendor_applications').insert({
      id: app.id,
      kitchen_name: app.businessName,
      contact_person: app.applicantName,
      phone: app.phone,
      email: app.email,
      address: app.storeAddress,
      description: app.notes || null,
      ghana_card_number: app.ghanaCardNumber,
      momo_payout_number: app.phone,
      sample_menu: app.foodType || null,
      status: app.status,
      created_at: app.appliedAt,
    });

    if (error) {
      console.error('Error submitting vendor application:', error);
      return false;
    }

    return true;
  },

  // 8. Update Store Settings
  async updateStore(storeId: string, updates: Partial<Store>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    const { error } = await supabase
      .from('stores')
      .update({
        name: updates.name,
        prep_time: updates.prepTimeEstimate,
        address: updates.address,
        is_open: updates.isOpen,
        updated_at: new Date().toISOString(),
      })
      .eq('id', storeId);

    if (error) {
      console.error('Error updating store:', error);
      return false;
    }

    return true;
  },
};
