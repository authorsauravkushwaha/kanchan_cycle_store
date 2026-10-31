-- Kanchan Cycle Stores — optional live catalogue schema for Supabase.
--
-- Safe to run more than once in the Supabase SQL editor. It creates:
--   * products          the catalogue the website reads
--   * owner_allowlist   which signed-in email may edit products
--   * row-level security so the public can read only published rows
--   * a storage bucket for the owner's own product photographs
--
-- The website never needs a service-role key. It uses the public anon key and
-- reads published rows only. Writes happen from the Supabase dashboard or a
-- signed-in owner, and are enforced here — not in the browser.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- products
create table if not exists public.products (
  id                text primary key,
  slug              text not null unique,
  kind              text not null default 'cycle',
  name_bn           text not null,
  name_en           text not null,
  category          text not null,
  brand             text,
  price             integer,
  description_bn    text not null default '',
  description_en    text not null default '',
  geared            boolean,
  frame_size        text,
  wheel_size        text,
  brakes            text,
  rider_height_min  integer,
  rider_height_max  integer,
  intended_use      text[],
  availability      text,
  featured          boolean not null default false,
  photo_url         text,
  published         boolean not null default false,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Constraints mirror the honesty rules in src/lib/configValidation.ts:
-- unknown is NULL, never zero, false or "in stock".
alter table public.products drop constraint if exists products_id_shape;
alter table public.products add constraint products_id_shape
  check (id ~ '^[a-z0-9][a-z0-9-]{0,78}[a-z0-9]$');

alter table public.products drop constraint if exists products_slug_shape;
alter table public.products add constraint products_slug_shape
  check (slug ~ '^[a-z0-9][a-z0-9-]{1,78}[a-z0-9]$');

alter table public.products drop constraint if exists products_kind_check;
alter table public.products add constraint products_kind_check check (kind in ('cycle', 'accessory'));

alter table public.products drop constraint if exists products_category_check;
alter table public.products add constraint products_category_check
  check (category in ('kids', 'student', 'city', 'geared', 'premium', 'electric', 'accessories'));

alter table public.products drop constraint if exists products_kind_category_check;
alter table public.products add constraint products_kind_category_check check (
  (kind = 'cycle' and category <> 'accessories') or
  (kind = 'accessory' and category = 'accessories')
);

alter table public.products drop constraint if exists products_price_check;
alter table public.products add constraint products_price_check check (price is null or price >= 0);

alter table public.products drop constraint if exists products_availability_check;
alter table public.products add constraint products_availability_check
  check (availability is null or availability in ('in-stock', 'out-of-stock'));

alter table public.products drop constraint if exists products_photo_url_check;
alter table public.products add constraint products_photo_url_check
  check (photo_url is null or (photo_url ~ '^https://' and photo_url !~ '^https://[^/@]*@'));

alter table public.products drop constraint if exists products_height_check;
alter table public.products add constraint products_height_check
  check (rider_height_min is null or rider_height_max is null or rider_height_min <= rider_height_max);

alter table public.products drop constraint if exists products_names_check;
alter table public.products add constraint products_names_check
  check (char_length(name_bn) between 1 and 120 and char_length(name_en) between 1 and 120);

alter table public.products drop constraint if exists products_text_limits_check;
alter table public.products add constraint products_text_limits_check check (
  (brand is null or char_length(brand) <= 60)
  and char_length(description_bn) between 1 and 600
  and char_length(description_en) between 1 and 600
  and (frame_size is null or char_length(frame_size) <= 40)
  and (wheel_size is null or char_length(wheel_size) <= 40)
  and (brakes is null or char_length(brakes) <= 40)
  and (photo_url is null or char_length(photo_url) <= 500)
);

alter table public.products drop constraint if exists products_intended_use_check;
alter table public.products add constraint products_intended_use_check check (
  intended_use is null or (
    cardinality(intended_use) <= 4
    and intended_use <@ array['school', 'commuting', 'recreation', 'mixed']::text[]
  )
);

alter table public.products drop constraint if exists products_height_range_check;
alter table public.products add constraint products_height_range_check check (
  (rider_height_min is null or rider_height_min between 1 and 249)
  and (rider_height_max is null or rider_height_max between 1 and 249)
);

alter table public.products drop constraint if exists products_sort_order_check;
alter table public.products add constraint products_sort_order_check check (sort_order >= 0);

create index if not exists products_published_idx on public.products (published, sort_order);
create index if not exists products_slug_idx on public.products (slug);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------ owner access
create table if not exists public.owner_allowlist (
  email text primary key,
  note  text
);
alter table public.owner_allowlist enable row level security;
-- No browser role may inspect the allowlist. The security-definer function below
-- evaluates membership without granting direct SELECT access.
revoke all on table public.owner_allowlist from public, anon, authenticated;

-- Authentication alone is not authorization: signed-in users must also match
-- the private email allowlist and present an MFA-authenticated AAL2 JWT.
create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
    and exists (
      select 1 from public.owner_allowlist
      where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    );
$$;
revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to authenticated;

-- Put the owner's own Supabase login email here (it is not public):
-- insert into public.owner_allowlist (email, note)
-- values ('owner@example.com', 'Shop owner')
-- on conflict (email) do nothing;

-- --------------------------------------------------------------------- RLS
alter table public.products enable row level security;

drop policy if exists "Public reads published products" on public.products;
create policy "Public reads published products" on public.products
  for select to anon, authenticated
  using (published = true);

drop policy if exists "Owner reads all products" on public.products;
create policy "Owner reads all products" on public.products
  for select to authenticated using (public.is_owner());

drop policy if exists "Owner inserts products" on public.products;
create policy "Owner inserts products" on public.products
  for insert to authenticated with check (public.is_owner());

drop policy if exists "Owner updates products" on public.products;
create policy "Owner updates products" on public.products
  for update to authenticated using (public.is_owner()) with check (public.is_owner());

drop policy if exists "Owner deletes products" on public.products;
create policy "Owner deletes products" on public.products
  for delete to authenticated using (public.is_owner());

-- Keep SQL privileges narrower than the RLS policy layer. RLS decides which
-- rows an authenticated, AAL2 allowlisted owner may touch; grants decide which
-- operations the browser roles can attempt at all.
revoke all on table public.products from public, anon, authenticated;
grant select (
  id, slug, kind, name_bn, name_en, category, brand, price,
  description_bn, description_en, geared, frame_size, wheel_size, brakes,
  rider_height_min, rider_height_max, intended_use, availability, featured,
  photo_url, published, sort_order
) on table public.products to anon, authenticated;
grant insert, update, delete on table public.products to authenticated;

-- ---------------------------------------------------- product photo bucket
-- Public read, owner-only write. Product photos must be the owner's own
-- photographs of the actual bicycles in the shop.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-photos', 'product-photos', true, 2097152,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public reads product photos" on storage.objects;
create policy "Public reads product photos" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'product-photos');

drop policy if exists "Owner uploads product photos" on storage.objects;
create policy "Owner uploads product photos" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'product-photos'
    and public.is_owner()
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
    and metadata ->> 'mimetype' in ('image/jpeg', 'image/png', 'image/webp')
    and case
      when (metadata ->> 'size') ~ '^[0-9]{1,7}$'
      then (metadata ->> 'size')::bigint between 1 and 2097152
      else false
    end
  );

drop policy if exists "Owner manages product photos" on storage.objects;
create policy "Owner manages product photos" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-photos' and public.is_owner())
  with check (
    bucket_id = 'product-photos'
    and public.is_owner()
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
    and metadata ->> 'mimetype' in ('image/jpeg', 'image/png', 'image/webp')
    and case
      when (metadata ->> 'size') ~ '^[0-9]{1,7}$'
      then (metadata ->> 'size')::bigint between 1 and 2097152
      else false
    end
  );

drop policy if exists "Owner deletes product photos" on storage.objects;
create policy "Owner deletes product photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-photos' and public.is_owner());

-- ------------------------------------------------------------------ checks
-- After importing the CSV from the owner stock desk, these queries should be
-- readable. Rows with published = false are invisible to the website.
-- select slug, price, availability, published from public.products order by sort_order;
-- select count(*) from public.products where published;
