# ChowGrid Supabase Backend Setup Guide 🍲🇬🇭

This guide explains how to connect and run the complete backend database, real-time live order tracking, and authentication for **ChowGrid** using **Supabase**.

---

## 🚀 Step 1: Create a Free Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create a free account.
2. Click **"New project"**.
3. Name your project (e.g. `chowgrid-backend`), set a database password, and choose your preferred region (e.g. `EU (Frankfurt)` or `West Europe`).

---

## 🗄️ Step 2: Run Database Migrations
1. In your Supabase dashboard, click **SQL Editor** from the left navigation.
2. Open the file [`supabase/schema.sql`](./schema.sql), copy all of its content, paste it into the Supabase SQL Editor, and click **RUN**.
   - This creates all relational tables (`profiles`, `stores`, `food_items`, `modifier_groups`, `modifier_options`, `orders`, `order_items`, `order_item_modifiers`, `vendor_applications`, `saved_addresses`, `saved_payments`).
   - Enables **Realtime** publications for live instant order updates.
   - Sets up **Row Level Security (RLS)**.

3. *(Optional)* Open [`supabase/seed.sql`](./seed.sql), copy its content into the SQL Editor, and click **RUN** to preload authentic Ghanaian stores (Aunty Muni Waakye, Buka Kitchen, Mama Lit Jollof, Asanka Local Chop Bar) and modifier groups.

---

## 🔑 Step 3: Add API Keys to Your App
1. In your Supabase dashboard, go to **Project Settings** (⚙️ icon) $\rightarrow$ **API**.
2. Copy:
   - **Project URL**
   - **anon / public key**
3. Create a `.env` file in the root of this project:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```

---

## ⚡ Step 4: Real-time Live Orders & Multi-vendor Kitchens
When configured, ChowGrid automatically:
- Broadcasts new orders instantly to vendor kitchen dashboards via Postgres change streams.
- Updates rider and customer screens with live OTP verification without page refreshes.
- Stores customer KYC vendor partner applications and food modifier configurations in PostgreSQL.
