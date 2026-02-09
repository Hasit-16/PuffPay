-- Enable RLS on storage.objects (it should be enabled by default, but good to ensure)
-- Note: 'storage' schema is managed by Supabase.

-- 1. Create the 'avatars' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. Remove existing policies to avoid conflicts (optional, be careful in prod)
-- drop policy if exists "Avatar images are publicly accessible" on storage.objects;
-- drop policy if exists "Anyone can upload an avatar" on storage.objects;
-- drop policy if exists "Anyone can update their own avatar" on storage.objects;

-- 3. Policy: Public Access for Viewing
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- 4. Policy: Authenticated Uploads
create policy "Anyone can upload an avatar"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'avatars' AND auth.uid() = owner );

-- 5. Policy: Owner Update
create policy "Anyone can update their own avatar"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'avatars' AND auth.uid() = owner )
  with check ( bucket_id = 'avatars' AND auth.uid() = owner );
