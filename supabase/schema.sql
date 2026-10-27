-- SokoNova B2B Wholesale Electronics PostgreSQL Schema (Supabase Cloud)
-- Direct Link to run in SQL Editor:
-- https://supabase.com/dashboard/project/kqwvbzkmeczhmmfzegiw/sql/new

-- ─────────────────────────────────────────────
-- 1. PRODUCTS TABLE
-- ─────────────────────────────────────────────
create table if not exists public.products (
  id text primary key,
  sku text unique not null,
  name text not null,
  category text not null,
  brand text not null,
  model text not null,
  color text,
  specs jsonb not null default '[]'::jsonb,
  warranty_period text not null default '12 Months',
  weight_kg numeric(8,2) not null default 0.5,
  dimensions_cm text,
  moq integer not null default 5,
  retail_price numeric(12,2) not null,
  bronze_price numeric(12,2) not null,
  silver_price numeric(12,2) not null,
  gold_price numeric(12,2) not null,
  physical_stock integer not null default 0,
  reserved_stock integer not null default 0,
  low_stock_threshold integer not null default 15,
  bin_code text not null default 'A01-R01-S01',
  serial_batch text,
  images jsonb not null default '[]'::jsonb,
  status text not null default 'Active',
  is_featured boolean default false,
  is_new_arrival boolean default false,
  landed_cost jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- 2. ORDERS TABLE
-- ─────────────────────────────────────────────
create table if not exists public.orders (
  id text primary key,
  created_at timestamptz default now(),
  customer_name text not null,
  business_name text not null,
  customer_email text not null,
  customer_phone text not null,
  delivery_notes text,
  delivery_tier text not null,
  shipping_cost numeric(12,2) not null default 0,
  subtotal numeric(12,2) not null,
  tier_savings numeric(12,2) not null default 0,
  grand_total numeric(12,2) not null,
  payment_method text not null,
  payment_reference text,
  payment_verified boolean not null default false,
  status text not null default 'Pending',
  items jsonb not null default '[]'::jsonb
);

-- ─────────────────────────────────────────────
-- 3. QUOTE REQUESTS TABLE
-- ─────────────────────────────────────────────
create table if not exists public.quote_requests (
  id text primary key,
  created_at timestamptz default now(),
  business_name text not null,
  contact_person text not null,
  email text not null,
  phone text not null,
  notes text,
  status text not null default 'Pending Review',
  admin_response_note text,
  items jsonb not null default '[]'::jsonb
);

-- ─────────────────────────────────────────────
-- 4. WARRANTY CLAIMS TABLE
-- ─────────────────────────────────────────────
create table if not exists public.warranty_claims (
  id text primary key,
  created_at timestamptz default now(),
  order_id text not null,
  product_sku text not null,
  product_name text not null,
  business_name text not null,
  serial_or_imei text not null,
  issue_description text not null,
  status text not null default 'Submitted',
  admin_resolution_note text
);

-- ─────────────────────────────────────────────
-- 5. ENABLE REALTIME
-- ─────────────────────────────────────────────
-- This broadcasts changes so Admin Dashboard gets live alerts instantly
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'orders') then
    alter publication supabase_realtime add table public.orders;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'quote_requests') then
    alter publication supabase_realtime add table public.quote_requests;
  end if;
end $$;

-- ─────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ─────────────────────────────────────────────
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.quote_requests enable row level security;
alter table public.warranty_claims enable row level security;

-- Products policies
drop policy if exists "Allow public read products" on public.products;
create policy "Allow public read products" on public.products for select using (true);
drop policy if exists "Allow all products modification" on public.products;
create policy "Allow all products modification" on public.products for all using (true);

-- Orders policies (Retailer inserts, Admin & Retailer reads/updates)
drop policy if exists "Allow select orders" on public.orders;
create policy "Allow select orders" on public.orders for select using (true);
drop policy if exists "Allow insert orders" on public.orders;
create policy "Allow insert orders" on public.orders for insert with check (true);
drop policy if exists "Allow update orders" on public.orders;
create policy "Allow update orders" on public.orders for update using (true);

-- Quote requests policies
drop policy if exists "Allow select quotes" on public.quote_requests;
create policy "Allow select quotes" on public.quote_requests for select using (true);
drop policy if exists "Allow insert quotes" on public.quote_requests;
create policy "Allow insert quotes" on public.quote_requests for insert with check (true);
drop policy if exists "Allow update quotes" on public.quote_requests;
create policy "Allow update quotes" on public.quote_requests for update using (true);

-- Warranty claims policies
drop policy if exists "Allow select warranty" on public.warranty_claims;
create policy "Allow select warranty" on public.warranty_claims for select using (true);
drop policy if exists "Allow insert warranty" on public.warranty_claims;
create policy "Allow insert warranty" on public.warranty_claims for insert with check (true);
drop policy if exists "Allow update warranty" on public.warranty_claims;
create policy "Allow update warranty" on public.warranty_claims for update using (true);

-- ─────────────────────────────────────────────
-- 7. SUPABASE STORAGE BUCKET (Product Images)
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public Access to product-images" on storage.objects;
create policy "Public Access to product-images"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Allow Upload to product-images" on storage.objects;
create policy "Allow Upload to product-images"
  on storage.objects for insert
  with check (bucket_id = 'product-images');
