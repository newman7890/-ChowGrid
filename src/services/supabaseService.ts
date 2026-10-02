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
      const orderPayload: any = {
        order_number: order.orderNumber,
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        delivery_address: order.deliveryAddress,
        customer_notes: order.customerNotes || null,
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
      };

      if (order.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(order.id)) {
        orderPayload.id = order.id;
      }

      if (order.storeId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(order.storeId)) {
        orderPayload.store_id = order.storeId;
      }

      if (order.customerId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(order.customerId)) {
        orderPayload.customer_id = order.customerId;
      }

      const { data: insertedOrder, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

      if (orderError) throw orderError;

      const orderIdToUse = insertedOrder?.id || order.id;

      // Insert line items
      for (const item of order.items) {
        const itemPayload: any = {
          order_id: orderIdToUse,
          food_name: item.name,
          unit_price: item.unitCalculatedPrice,
          quantity: item.quantity,
          special_instructions: item.specialInstructions || null,
        };
        if (item.foodItemId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.foodItemId)) {
          itemPayload.food_item_id = item.foodItemId;
        }

        const { data: insertedItem, error: itemError } = await supabase
          .from('order_items')
          .insert(itemPayload)
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
  async submitApplication(app: VendorApplication, applicantId?: string): Promise<{ success: boolean; data?: VendorApplication; error?: string }> {
    if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase is not configured' };

    const payload: any = {
      kitchen_name: app.businessName,
      contact_person: app.applicantName,
      phone: app.phone,
      email: app.email,
      address: app.storeAddress,
      description: app.notes || null,
      ghana_card_number: app.ghanaCardNumber,
      momo_payout_number: app.phone,
      sample_menu: app.foodType || null,
      status: app.status || 'pending',
    };

    if (applicantId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(applicantId)) {
      payload.applicant_id = applicantId;
    }

    if (app.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(app.id)) {
      payload.id = app.id;
    }

    const { data, error } = await supabase
      .from('vendor_applications')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error submitting vendor application:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        id: data.id,
        applicantName: data.contact_person,
        businessName: data.kitchen_name,
        phone: data.phone,
        email: data.email,
        storeAddress: data.address,
        ghanaCardNumber: data.ghana_card_number,
        foodType: data.sample_menu || 'Local Ghanaian',
        notes: data.description || '',
        status: data.status || 'pending',
        appliedAt: data.created_at,
      },
    };
  },

  // 7b. Fetch all Vendor Applications
  async getApplications(): Promise<VendorApplication[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    const { data, error } = await supabase
      .from('vendor_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications from Supabase:', error);
      return null;
    }

    return data.map((a: any) => ({
      id: a.id,
      applicantName: a.contact_person,
      businessName: a.kitchen_name,
      phone: a.phone,
      email: a.email,
      storeAddress: a.address,
      ghanaCardNumber: a.ghana_card_number,
      foodType: a.sample_menu || 'Local Ghanaian',
      notes: a.description || '',
      status: a.status || 'pending',
      appliedAt: a.created_at,
    }));
  },

  // 7c. Update Vendor Application Status
  async updateApplicationStatus(appId: string, status: string, notes?: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    const { error } = await supabase
      .from('vendor_applications')
      .update({
        status,
        description: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appId);

    if (error) {
      console.error('Error updating vendor application in Supabase:', error);
      return false;
    }

    return true;
  },

  // 8. Update Store Settings
  async updateStore(storeId: string, updates: Partial<Store>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    const payload: any = {
      updated_at: new Date().toISOString(),
    };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.prepTimeEstimate !== undefined) payload.prep_time = updates.prepTimeEstimate;
    if (updates.address !== undefined) payload.address = updates.address;
    if (updates.isOpen !== undefined) payload.is_open = updates.isOpen;
    if (updates.subscriptionStatus !== undefined) payload.subscription_status = updates.subscriptionStatus;
    if (updates.subscriptionExpiresAt !== undefined) payload.subscription_renews_at = updates.subscriptionExpiresAt;

    const { error } = await supabase
      .from('stores')
      .update(payload)
      .eq('id', storeId);

    if (error) {
      console.error('Error updating store:', error);
      return false;
    }

    return true;
  },

  // 8b. Create New Store
  async createStore(store: Store): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    const slug = store.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString(36);

    const storePayload: any = {
      name: store.name,
      slug: slug,
      description: store.tagline,
      logo_url: store.logoUrl,
      cover_url: store.coverUrl,
      rating: store.rating || 5.0,
      total_reviews: store.reviewCount || 0,
      prep_time: store.prepTimeEstimate || '20-30 min',
      is_open: store.isOpen,
      address: store.address,
      category: store.category,
      monthly_fee: store.monthlyFee || 150,
      subscription_status: store.subscriptionStatus || 'active',
      subscription_renews_at: store.subscriptionExpiresAt,
      momo_payout_number: store.phone,
    };

    if (store.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(store.id)) {
      storePayload.id = store.id;
    }

    if (store.vendorId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(store.vendorId)) {
      storePayload.vendor_id = store.vendorId;
    }

    const { error } = await supabase.from('stores').insert(storePayload);

    if (error) {
      console.error('Error creating store in Supabase:', error);
      return false;
    }

    return true;
  },

  // 8c. Save / Upsert Food Item
  async saveFoodItem(item: FoodItem): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    try {
      const itemPayload: any = {
        name: item.name,
        description: item.description,
        base_price: item.basePrice,
        image_url: item.imageUrl,
        category: item.category,
        type: item.type === 'build_your_meal' ? 'build_your_meal' : 'fixed_dish',
        prep_time_minutes: item.prepTimeMinutes || 20,
        is_available: item.isAvailable,
        updated_at: new Date().toISOString(),
      };

      if (item.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id)) {
        itemPayload.id = item.id;
      }

      if (item.storeId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.storeId)) {
        itemPayload.store_id = item.storeId;
      }

      const { data: savedItem, error: itemError } = await supabase
        .from('food_items')
        .upsert(itemPayload)
        .select()
        .single();

      if (itemError) throw itemError;

      const itemId = savedItem?.id || item.id;

      // If modifier groups exist, sync them
      if (item.modifierGroups && item.modifierGroups.length > 0) {
        for (const grp of item.modifierGroups) {
          const grpPayload: any = {
            food_item_id: itemId,
            name: grp.name,
            min_selection: grp.minSelection,
            max_selection: grp.maxSelection,
            required: grp.required,
            allow_quantity_multiplier: grp.allowQuantityMultiplier,
          };
          if (grp.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(grp.id)) {
            grpPayload.id = grp.id;
          }

          const { data: savedGrp, error: grpError } = await supabase
            .from('modifier_groups')
            .upsert(grpPayload)
            .select()
            .single();

          if (grpError) throw grpError;

          const grpId = savedGrp?.id || grp.id;

          if (grp.options && grp.options.length > 0) {
            for (const opt of grp.options) {
              const optPayload: any = {
                modifier_group_id: grpId,
                name: opt.name,
                price: opt.price,
                is_default: opt.isDefault,
              };
              if (opt.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(opt.id)) {
                optPayload.id = opt.id;
              }

              const { error: optError } = await supabase
                .from('modifier_options')
                .upsert(optPayload);
              if (optError) throw optError;
            }
          }
        }
      }

      return true;
    } catch (err) {
      console.error('Error saving food item to Supabase:', err);
      return false;
    }
  },

  // 8d. Delete Food Item
  async deleteFoodItem(foodItemId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    const { error } = await supabase.from('food_items').delete().eq('id', foodItemId);
    if (error) {
      console.error('Error deleting food item from Supabase:', error);
      return false;
    }
    return true;
  },

  // 8e. Toggle Food Availability
  async toggleFoodAvailability(foodItemId: string, isAvailable: boolean): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    const { error } = await supabase
      .from('food_items')
      .update({ is_available: isAvailable, updated_at: new Date().toISOString() })
      .eq('id', foodItemId);

    if (error) {
      console.error('Error updating food availability:', error);
      return false;
    }
    return true;
  },

  // ============================================================================
  // 9. Supabase Auth & Profile Methods
  // ============================================================================

  // Fetch all User Profiles
  async getUsers() {
    if (!isSupabaseConfigured || !supabase) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching profiles from Supabase:', error);
      return null;
    }

    return data.map((p: any) => ({
      id: p.id,
      name: p.full_name || 'Member',
      email: p.email || '',
      phone: p.phone || '',
      role: p.role,
      avatarUrl: p.avatar_url,
      deliveryAddress: p.delivery_address || '',
      vendorStoreId: p.vendor_store_id,
    }));
  },

  // Sign Up with Email & Password
  async signUp(email: string, password: string, metadata: { fullName: string; phone: string; role: 'customer' | 'vendor' | 'admin'; address?: string }) {
    if (!isSupabaseConfigured || !supabase) return { user: null, error: 'Supabase is not configured' };

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata.fullName,
            phone: metadata.phone,
            role: metadata.role,
            delivery_address: metadata.address,
          },
        },
      });

      if (error) return { user: null, error: error.message };

      if (data.user) {
        // Ensure profile row exists in public.profiles
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: metadata.fullName,
            phone: metadata.phone,
            email: email,
            role: metadata.role,
            delivery_address: metadata.address,
            updated_at: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('Profile upsert fallback:', e);
        }
      }

      return { user: data.user, session: data.session, error: null };
    } catch (err: any) {
      return { user: null, error: err.message || 'Registration failed' };
    }
  },

  // Sign In with Email & Password
  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured || !supabase) return { user: null, error: 'Supabase is not configured' };

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { user: null, error: error.message };
      return { user: data.user, session: data.session, error: null };
    } catch (err: any) {
      return { user: null, error: err.message || 'Sign in failed' };
    }
  },

  // Sign In with Google OAuth
  async signInWithOAuth(provider: 'google') {
    if (!isSupabaseConfigured || !supabase) return { error: 'Supabase is not configured' };

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) return { error: error.message };
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'OAuth sign in failed' };
    }
  },

  // Sign Out
  async signOut() {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out from Supabase:', err);
    }
  },

  // Resend Confirmation Email
  async resendConfirmationEmail(email: string) {
    if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase is not configured' };

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to resend confirmation email' };
    }
  },

  // Reset Password via Email
  async resetPasswordForEmail(email: string) {
    if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase is not configured' };

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#reset-password`,
      });

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Password reset request failed' };
    }
  },

  // Get User Profile
  async getUserProfile(userId: string) {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Could not fetch user profile:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.warn('Profile fetch error:', err);
      return null;
    }
  },

  // Update User Profile
  async updateUserProfile(userId: string, updates: { full_name?: string; phone?: string; avatar_url?: string; role?: string; vendor_store_id?: string }) {
    if (!isSupabaseConfigured || !supabase) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Failed to update profile in Supabase:', err);
      return false;
    }
  },

  // Delete User Profile
  async deleteUserProfile(userId: string) {
    if (!isSupabaseConfigured || !supabase) return false;

    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Failed to delete user profile in Supabase:', err);
      return false;
    }
  },

  // 14. Purge all records from all database tables
  async deleteAllRecords(): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: true, message: 'Local storage wiped. Supabase is not connected.' };
    }

    try {
      // Delete child tables first to avoid foreign key conflicts
      await supabase.from('order_item_modifiers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('modifier_options').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('modifier_groups').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('food_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('vendor_applications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('stores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      return { success: true, message: 'All database records successfully deleted from Supabase.' };
    } catch (err: any) {
      console.error('Error deleting records from Supabase:', err);
      return { success: false, message: err.message || 'Failed to delete some records from Supabase.' };
    }
  },
};
