-- ==============================================================================
-- ChowGrid Supabase Storage Configuration (Buckets & Policies)
-- ==============================================================================

-- 1. Create Public Storage Buckets
insert into storage.buckets (id, name, public)
values 
  ('dishes', 'dishes', true),
  ('store-logos', 'store-logos', true),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. Create Private Storage Bucket for KYC Ghana Cards
insert into storage.buckets (id, name, public)
values 
  ('kyc-documents', 'kyc-documents', false)
on conflict (id) do nothing;

-- 3. Storage Policies for Public Buckets
create policy "Public Access to Dish Images"
on storage.objects for select
using ( bucket_id in ('dishes', 'store-logos', 'avatars') );

create policy "Authenticated Users can upload images"
on storage.objects for insert
with check (
  bucket_id in ('dishes', 'store-logos', 'avatars', 'kyc-documents')
);

create policy "Users can update and delete their own uploads"
on storage.objects for update
using ( auth.uid() = owner );

create policy "Users can delete their own uploads"
on storage.objects for delete
using ( auth.uid() = owner );
