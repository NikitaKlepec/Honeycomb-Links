-- Link Vault schema for Supabase Free.
-- Run this file once in the Supabase SQL Editor.

create table if not exists public.categories (
  id text primary key,
  name text not null,
  icon text not null default 'Folder',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.links (
  id text primary key,
  category_id text not null references public.categories(id) on delete cascade,
  title text not null,
  description text not null default '',
  url text not null,
  image_url text,
  image_position_x double precision not null default 50 check (image_position_x between 0 and 100),
  image_position_y double precision not null default 50 check (image_position_y between 0 and 100),
  image_opacity integer not null default 100 check (image_opacity between 0 and 100),
  title_color text,
  description_color text,
  title_font_size integer check (title_font_size between 8 and 24),
  description_font_size integer check (description_font_size between 7 and 16),
  title_font_family text,
  description_font_family text,
  title_bold boolean,
  title_italic boolean,
  title_underline boolean,
  description_bold boolean,
  description_italic boolean,
  description_underline boolean,
  color text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists links_category_id_sort_order_idx
  on public.links (category_id, sort_order);

alter table public.categories enable row level security;
alter table public.links enable row level security;

drop policy if exists "Link Vault categories are readable" on public.categories;
create policy "Link Vault categories are readable"
  on public.categories for select
  to anon, authenticated
  using (true);

drop policy if exists "Link Vault categories are writable" on public.categories;
create policy "Link Vault categories are writable"
  on public.categories for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Link Vault links are readable" on public.links;
create policy "Link Vault links are readable"
  on public.links for select
  to anon, authenticated
  using (true);

drop policy if exists "Link Vault links are writable" on public.links;
create policy "Link Vault links are writable"
  on public.links for all
  to anon, authenticated
  using (true)
  with check (true);

grant select, insert, update, delete on public.categories to anon, authenticated;
grant select, insert, update, delete on public.links to anon, authenticated;