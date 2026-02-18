-- Create a new storage bucket for avatars
-- Will do nothing if 'avatars' bucket already exists
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Drop existing policies if they exist to avoid errors on rerun
drop policy if exists "Avatar images are publicly accessible" on storage.objects;
drop policy if exists "Anyone can upload an avatar" on storage.objects;
drop policy if exists "Anyone can update their own avatar" on storage.objects;
drop policy if exists "Anyone can delete their own avatar" on storage.objects;

-- Re-create policies

-- Policy to allow authenticated users to upload avatar images
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );

create policy "Anyone can update their own avatar"
  on storage.objects for update
  using ( auth.uid() = owner )
  with check ( bucket_id = 'avatars' );

create policy "Anyone can delete their own avatar"
  on storage.objects for delete
  using ( auth.uid() = owner and bucket_id = 'avatars' );
