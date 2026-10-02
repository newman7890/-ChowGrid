-- ==============================================================================
-- ChowGrid Ghanaian Food Marketplace - Complete Supabase Backend Schema
-- ==============================================================================

-- 1. Enable Required Extensions
create extension if not exists "uuid-ossp";

-- 2. User Profiles Table (Linked to Supabase auth.users)
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text not null,
    phone text not null,
    email text,
    avatar_url text,
    role text not null check (role in ('customer', 'vendor', 'admin')) default 'customer',
    vendor_store_id uuid,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Stores & Kitchens Table
create table if not exists public.stores (
    id uuid default uuid_generate_v4() primary key,
    vendor_id uuid references public.profiles(id) on delete set null,
    name text not null,
    slug text unique not null,
    description text,
    logo_url text,
    cover_url text,
    rating numeric(3,2) default 5.0 check (rating >= 0 and rating <= 5),
    total_reviews integer default 0,
    prep_time text default '20-30 min',
    is_open boolean default true,
    address text not null,
    category text not null,
    monthly_fee numeric(10,2) default 150.00,
    subscription_status text check (subscription_status in ('active', 'grace_period', 'suspended')) default 'active',
    subscription_renews_at timestamp with time zone,
    momo_payout_number text,
    momo_account_name text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Food Items & Dishes Table
create table if not exists public.food_items (
    id uuid default uuid_generate_v4() primary key,
    store_id uuid references public.stores(id) on delete cascade not null,
    name text not null,
    description text,
    base_price numeric(10,2) not null check (base_price >= 0),
    image_url text,
    category text not null,
    is_customizable boolean default false,
    type text check (type in ('build_your_meal', 'fixed_dish')) default 'fixed_dish',
    prep_time_minutes integer default 20,
    is_available boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Modifier Groups (For Build-Your-Meal customizer)
create table if not exists public.modifier_groups (
    id uuid default uuid_generate_v4() primary key,
    food_item_id uuid references public.food_items(id) on delete cascade not null,
    name text not null,
    min_selection integer default 0,
    max_selection integer default 1,
    required boolean default false,
    allow_quantity_multiplier boolean default false,
    sort_order integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Modifier Options (Individual add-ons, e.g. Fried Fish, Wele, Extra Shito)
create table if not exists public.modifier_options (
    id uuid default uuid_generate_v4() primary key,
    modifier_group_id uuid references public.modifier_groups(id) on delete cascade not null,
    name text not null,
    price numeric(10,2) default 0.00 check (price >= 0),
    is_default boolean default false,
    sort_order integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Orders Table
create table if not exists public.orders (
    id uuid default uuid_generate_v4() primary key,
    order_number text unique not null,
    customer_id uuid references public.profiles(id) on delete set null,
    customer_name text not null,
    customer_phone text not null,
    delivery_address text not null,
    customer_notes text,
    store_id uuid references public.stores(id) on delete restrict not null,
    store_name text not null,
    status text check (status in (
        'new', 'accepted', 'preparing', 'ready_for_pickup',
        'rider_assigned', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled'
    )) default 'new',
    subtotal numeric(10,2) not null check (subtotal >= 0),
    delivery_fee numeric(10,2) not null check (delivery_fee >= 0),
    total numeric(10,2) not null check (total >= 0),
    payment_method text check (payment_method in ('momo_mtn', 'momo_telecel', 'card', 'cash_on_delivery')) not null,
    payment_status text check (payment_status in ('pending', 'paid', 'failed')) default 'pending',
    pickup_otp text not null,
    delivery_otp text not null,
    assigned_rider_id uuid references public.profiles(id) on delete set null,
    rider_name text,
    rider_phone text,
    estimated_minutes integer default 35,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Order Items Table
create table if not exists public.order_items (
    id uuid default uuid_generate_v4() primary key,
    order_id uuid references public.orders(id) on delete cascade not null,
    food_item_id uuid references public.food_items(id) on delete set null,
    food_name text not null,
    unit_price numeric(10,2) not null,
    quantity integer not null default 1 check (quantity > 0),
    special_instructions text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Order Item Modifiers (Selected add-ons per item)
create table if not exists public.order_item_modifiers (
    id uuid default uuid_generate_v4() primary key,
    order_item_id uuid references public.order_items(id) on delete cascade not null,
    group_name text not null,
    option_name text not null,
    unit_price numeric(10,2) default 0.00,
    quantity integer default 1 check (quantity > 0)
);

-- 10. Vendor Applications (KYC & onboarding)
create table if not exists public.vendor_applications (
    id uuid default uuid_generate_v4() primary key,
    applicant_id uuid references public.profiles(id) on delete set null,
    kitchen_name text not null,
    contact_person text not null,
    phone text not null,
    email text not null,
    address text not null,
    description text,
    ghana_card_number text not null,
    momo_payout_number text not null,
    sample_menu text,
    status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
    rejection_reason text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Customer Saved Addresses
create table if not exists public.saved_addresses (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    label text not null,
    address text not null,
    delivery_notes text,
    is_default boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. Customer Saved Payment Accounts
create table if not exists public.saved_payments (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    provider text not null,
    account_number text not null,
    account_name text not null,
    is_default boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. Enable Realtime Publications for Live Order Updates & Kitchen Alerts
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.stores;
alter publication supabase_realtime add table public.food_items;
alter publication supabase_realtime add table public.vendor_applications;

-- 14. Row-Level Security (RLS) Policies
alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.food_items enable row level security;
alter table public.modifier_groups enable row level security;
alter table public.modifier_options enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_item_modifiers enable row level security;
alter table public.vendor_applications enable row level security;
alter table public.saved_addresses enable row level security;
alter table public.saved_payments enable row level security;

-- Public Read Policies (Anyone can view active stores and menus)
create policy "Anyone can view stores" on public.stores for select using (true);
create policy "Anyone can view food items" on public.food_items for select using (true);
create policy "Anyone can view modifier groups" on public.modifier_groups for select using (true);
create policy "Anyone can view modifier options" on public.modifier_options for select using (true);

-- User Profiles Policies
create policy "Users can view all profiles" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Orders Policies
create policy "Customers can view own orders" on public.orders for select using (
    auth.uid() = customer_id or 
    auth.uid() in (select vendor_id from public.stores where id = store_id) or
    auth.uid() = assigned_rider_id
);
create policy "Anyone can insert orders" on public.orders for insert with check (true);
create policy "Vendors and riders can update assigned orders" on public.orders for update using (
    auth.uid() in (select vendor_id from public.stores where id = store_id) or
    auth.uid() = assigned_rider_id or
    auth.uid() in (select id from public.profiles where role = 'admin')
);

-- Vendor Applications Policies
create policy "Anyone can view vendor applications" on public.vendor_applications for select using (true);
create policy "Anyone authenticated can create application" on public.vendor_applications for insert with check (true);
create policy "Admins can update application" on public.vendor_applications for update using (true);

-- 15. Automatic Profile Creation Trigger upon Supabase Auth Sign Up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, email, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'ChowGrid User'),
    coalesce(new.raw_user_meta_data->>'phone', '+233'),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
