-- Run this entire file in the Supabase SQL Editor

-- 1. Recipes table
create table if not exists recipes (
  id          uuid        default gen_random_uuid() primary key,
  created_at  timestamptz default now(),
  title       text        not null,
  description text,
  category    text        not null default 'Other',
  ingredients text        not null,
  instructions text       not null,
  serves      integer,
  prep_time   integer,   -- minutes
  cook_time   integer,   -- minutes
  image_url   text
);

-- 2. Row-level security (open policy for personal single-user app)
alter table recipes enable row level security;

create policy "Allow all operations"
  on recipes for all
  using (true)
  with check (true);

-- 3. Storage bucket for photos
insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true)
on conflict (id) do nothing;

create policy "Public read and write for recipe images"
  on storage.objects for all
  using (bucket_id = 'recipe-images')
  with check (bucket_id = 'recipe-images');
