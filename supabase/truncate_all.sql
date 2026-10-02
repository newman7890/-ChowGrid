-- ==============================================================================
-- ChowGrid - Truncate and Wipe All Database Records
-- Run this in the Supabase SQL Editor to delete all rows from all tables
-- ==============================================================================

-- Truncate all application tables safely with cascade
truncate table 
    public.order_item_modifiers,
    public.order_items,
    public.saved_payments,
    public.saved_addresses,
    public.orders,
    public.modifier_options,
    public.modifier_groups,
    public.food_items,
    public.vendor_applications,
    public.stores,
    public.profiles
restart identity cascade;
