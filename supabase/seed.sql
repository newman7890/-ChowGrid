-- ==============================================================================
-- ChowGrid Ghanaian Food Marketplace - Initial Seed Data (Valid RFC4122 UUIDs)
-- ==============================================================================

-- 1. Insert Initial Food Stores
insert into public.stores (id, name, slug, description, logo_url, cover_url, rating, total_reviews, prep_time, is_open, address, category, monthly_fee, subscription_status)
values
  (
    'a1111111-1111-1111-1111-111111111111',
    'Aunty Muni Waakye',
    'aunty-muni-waakye',
    'The iconic Accra Waakye spot serving piping hot leaf-wrapped waakye with rich shito, talia and seasoned meats.',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    4.9,
    342,
    '15-25 min',
    true,
    'Labone, Accra (Near Coffee Shop)',
    'Waakye',
    150.00,
    'active'
  ),
  (
    'b2222222-2222-2222-2222-222222222222',
    'Buka Ghanaian Kitchen',
    'buka-ghanaian-kitchen',
    'Premium authentic Ghanaian native specialties. Jollof, Banku, Tilapia & palm nut soup.',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    4.8,
    215,
    '25-40 min',
    true,
    '10th Street, Osu, Accra',
    'Local Ghanaian',
    150.00,
    'active'
  ),
  (
    'c3333333-3333-3333-3333-333333333333',
    'Mama Lit Jollof Hub',
    'mama-lit-jollof-hub',
    'Firewood party jollof with crispy chicken wings, fried plantain (kelewele), and spicy goat meat chunks.',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
    4.7,
    189,
    '20-30 min',
    true,
    'East Legon (Near Lizzy Sports Complex)',
    'Jollof',
    150.00,
    'active'
  ),
  (
    'd4444444-4444-4444-4444-444444444444',
    'Asanka Local Chop Bar',
    'asanka-local-chop-bar',
    'Pounding fresh fufu, piping hot banku, roasted tilapia and rich groundnut / light soups in traditional earthenware asanka.',
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80',
    4.9,
    420,
    '20-35 min',
    true,
    'Madina Zongo Junction, Accra',
    'Banku & Fish',
    150.00,
    'active'
  )
on conflict (id) do nothing;

-- 2. Insert Iconic Food Dishes
insert into public.food_items (id, store_id, name, description, base_price, image_url, category, is_customizable, type, prep_time_minutes, is_available)
values
  (
    'f1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'Authentic Accra Special Waakye',
    'Freshly prepared sorghum-leaf infused rice & beans. Customize your base with our signature assortment of proteins, fried fish, boiled egg, spaghetti talia, gari foto, and dark rich shito.',
    35.00,
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    'Waakye',
    true,
    'build_your_meal',
    15,
    true
  ),
  (
    'f2222222-2222-2222-2222-222222222222',
    'c3333333-3333-3333-3333-333333333333',
    'Signature Smokey Party Jollof & Grilled Chicken',
    'Long-grain Ghanaian firewood-cooked tomato rice served with seasoned quarter grilled chicken, fried sweet plantain (dodo), creamy coleslaw and hot pepper sauce.',
    45.00,
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80',
    'Jollof',
    false,
    'fixed_dish',
    20,
    true
  ),
  (
    'f3333333-3333-3333-3333-333333333333',
    'd4444444-4444-4444-4444-444444444444',
    'Hot Banku with Grilled Tilapia & Fresh Pepper',
    'Two hot balls of corn and cassava dough served with full fresh charcoal-grilled Volta tilapia, raw ground red/green hot pepper, diced onions, and sliced tomatoes.',
    55.00,
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80',
    'Banku & Fish',
    false,
    'fixed_dish',
    25,
    true
  ),
  (
    'f4444444-4444-4444-4444-444444444444',
    'b2222222-2222-2222-2222-222222222222',
    'Assorted Fried Rice Bowl with Jumbo Shrimps',
    'Wok-tossed aromatic rice with spring onions, sweet peppers, beef chunks, eggs and succulent prawns.',
    60.00,
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80',
    'Fried Rice',
    false,
    'fixed_dish',
    15,
    true
  )
on conflict (id) do nothing;

-- 3. Insert Modifier Groups for Waakye Customizer
insert into public.modifier_groups (id, food_item_id, name, min_selection, max_selection, required, allow_quantity_multiplier, sort_order)
values
  ('e1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 'Choose Your Protein', 1, 4, true, true, 1),
  ('e2222222-2222-2222-2222-222222222222', 'f1111111-1111-1111-1111-111111111111', 'Essential Sides & Garnish', 0, 5, false, true, 2),
  ('e3333333-3333-3333-3333-333333333333', 'f1111111-1111-1111-1111-111111111111', 'Sauce & Stew Preferences', 1, 1, true, false, 3)
on conflict (id) do nothing;

-- 4. Insert Modifier Options
insert into public.modifier_options (id, modifier_group_id, name, price, is_default, sort_order)
values
  -- Proteins
  ('01111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'Fried Hard-Boiled Egg', 5.00, true, 1),
  ('02222222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111', 'Soft Stewed Wele (Cow Skin)', 8.00, true, 2),
  ('03333333-3333-3333-3333-333333333333', 'e1111111-1111-1111-1111-111111111111', 'Tender Stewed Beef (Chofi)', 15.00, false, 3),
  ('04444444-4444-4444-4444-444444444444', 'e1111111-1111-1111-1111-111111111111', 'Crispy Fried Fish Chunk', 18.00, false, 4),
  ('05555555-5555-5555-5555-555555555555', 'e1111111-1111-1111-1111-111111111111', 'Spicy Fried Guinea Fowl (Akokɔ)', 22.00, false, 5),
  
  -- Sides
  ('06666666-6666-6666-6666-666666666666', 'e2222222-2222-2222-2222-222222222222', 'Spaghetti Talia Noodles', 4.00, true, 1),
  ('07777777-7777-7777-7777-777777777777', 'e2222222-2222-2222-2222-222222222222', 'Moist Gari Foto', 4.00, true, 2),
  ('08888888-8888-8888-8888-888888888888', 'e2222222-2222-2222-2222-222222222222', 'Sweet Fried Plantain (Kelewele)', 8.00, false, 3),
  ('09999999-9999-9999-9999-999999999999', 'e2222222-2222-2222-2222-222222222222', 'Fresh Mixed Salad & Mayonnaise', 6.00, false, 4),
  
  -- Sauces
  ('0aaaaaaa-1111-1111-1111-111111111111', 'e3333333-3333-3333-3333-333333333333', 'Rich Black Shito + Tomato Stew Mix', 0.00, true, 1),
  ('0bbbbbbb-2222-2222-2222-222222222222', 'e3333333-3333-3333-3333-333333333333', 'Extra Hot Shito Only', 0.00, false, 2),
  ('0ccccccc-3333-3333-3333-333333333333', 'e3333333-3333-3333-3333-333333333333', 'Mild Stew Only (No Shito)', 0.00, false, 3)
on conflict (id) do nothing;
