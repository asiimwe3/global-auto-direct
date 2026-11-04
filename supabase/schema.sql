-- GLOBAL AUTO DIRECT — production schema for Supabase (Postgres)
-- Paste this whole file into Supabase → SQL Editor → Run. It is idempotent.

create extension if not exists "pgcrypto";

-- ─────────── reference data ───────────
create table if not exists public.countries (
  code text primary key,
  name text not null,
  kind text not null check (kind in ('origin','destination','both')),
  currency text not null,
  port text,
  capital text,
  flag text,
  max_age_years int,
  right_hand_drive boolean,
  port_handling_usd numeric default 0,
  clearance_usd numeric default 0,
  local_delivery_usd numeric default 0,
  rules_verified boolean default false,
  notes text,
  updated_at timestamptz default now()
);

create table if not exists public.currencies (
  code text primary key,
  name text not null,
  symbol text,
  rate_to_usd numeric not null check (rate_to_usd > 0),
  updated_at timestamptz default now()
);

create table if not exists public.tax_rules (
  id text primary key,
  country_code text not null references public.countries(code) on delete cascade,
  duty_pct numeric not null default 0,
  vat_pct numeric not null default 0,
  excise_tiers jsonb not null default '[]'::jsonb,
  effective_from date not null default current_date,
  verified boolean default false,
  source_note text,
  updated_at timestamptz default now()
);

create table if not exists public.shipping_routes (
  id uuid primary key default gen_random_uuid(),
  origin_code text references public.countries(code) on delete cascade,
  dest_code text references public.countries(code) on delete cascade,
  sea_usd numeric, sea_days int, air_usd numeric, air_days int,
  export_docs_usd numeric, inland_usd numeric, inspection_pct numeric default 0.02,
  active boolean default true
);

-- ─────────── people ───────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null,
  phone text,
  role text not null default 'customer'
    check (role in ('customer','supplier','superadmin','sales','finance','logistics','agent')),
  status text not null default 'active' check (status in ('active','suspended')),
  country_code text references public.countries(code),
  currency text default 'UGX',
  supplier_id uuid,
  created_at timestamptz default now()
);

create or replace function public.role_of(uid uuid) returns text
language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.profiles where id = uid), 'anon');
$$;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select public.role_of(auth.uid()) in ('superadmin','sales','finance','logistics','agent');
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select public.role_of(auth.uid()) = 'superadmin';
$$;

-- new auth user → profile
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, role, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.email,
          coalesce(new.raw_user_meta_data->>'role', 'customer'), new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────── suppliers + inventory ───────────
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  name text not null,
  country_code text references public.countries(code),
  city text,
  contact_email text,
  contact_phone text,
  status text not null default 'pending'
    check (status in ('pending','under_review','verified','suspended','rejected')),
  verification_notes text,
  rating numeric default 0,
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);
alter table public.profiles drop constraint if exists profiles_supplier_fk;
alter table public.profiles add constraint profiles_supplier_fk
  foreign key (supplier_id) references public.suppliers(id) on delete set null;

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  title text not null,
  brand text not null,
  model text not null,
  year int,
  category text not null,
  price_usd numeric not null check (price_usd >= 0),
  currency text default 'USD',
  mileage_km int,
  engine_cc int,
  fuel text,
  transmission text,
  drivetrain text,
  exterior text,
  interior text,
  condition text,
  vin text,
  origin_code text references public.countries(code),
  supplier_id uuid references public.suppliers(id) on delete set null,
  images jsonb not null default '[]'::jsonb,
  specifications jsonb not null default '{}'::jsonb,
  video_url text,
  export_available boolean default true,
  shipping_usd numeric,
  delivery_days int,
  destinations text[] default array['UG'],
  featured boolean default false,
  is_demo boolean not null default false,
  status text not null default 'draft' check (status in ('draft','pending','published','sold','withdrawn')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists vehicles_status_idx on public.vehicles(status);
create index if not exists vehicles_category_idx on public.vehicles(category);
create index if not exists vehicles_origin_idx on public.vehicles(origin_code);

create table if not exists public.inspections (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references public.vehicles(id) on delete cascade,
  order_id uuid,
  inspector text,
  status text default 'requested' check (status in ('requested','scheduled','passed','failed','not_required')),
  report_url text,
  inspected_on date,
  notes text,
  created_at timestamptz default now()
);

-- ─────────── commerce ───────────
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null, email text not null, phone text,
  dest_code text references public.countries(code),
  origin_code text references public.countries(code),
  brand text, model text, year int, condition text,
  budget_usd numeric, requirements text,
  reference_images jsonb default '[]'::jsonb,
  status text default 'new' check (status in ('new','reviewing','quoted','closed')),
  created_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  request_id uuid references public.requests(id) on delete set null,
  stage text not null default 'Enquiry received',
  dest_code text references public.countries(code),
  origin_code text references public.countries(code),
  total_usd numeric, currency text default 'USD',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.inspections drop constraint if exists inspections_order_fk;
alter table public.inspections add constraint inspections_order_fk
  foreign key (order_id) references public.orders(id) on delete cascade;

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  stage text not null,
  note text,
  actor_id uuid references auth.users(id) on delete set null,
  evidence_url text,
  created_at timestamptz default now()
);

create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  request_id uuid references public.requests(id) on delete set null,
  breakdown jsonb not null default '[]'::jsonb,
  total_usd numeric not null,
  currency text default 'USD',
  status text default 'draft' check (status in ('draft','sent','approved','declined','expired')),
  valid_until date,
  created_at timestamptz default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  kind text default 'deposit' check (kind in ('deposit','milestone','balance','refund')),
  amount numeric not null, currency text default 'USD',
  method text, reference text,
  status text default 'pending' check (status in ('pending','confirmed','failed','refunded')),
  confirmed_by uuid references auth.users(id) on delete set null,
  confirmed_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  container_no text, bl_reference text, vessel text,
  origin_port text, dest_port text, shipping_company text,
  etd date, eta date,
  status text default 'booked' check (status in ('booked','loading','departed','in_transit','arrived','cleared','delivered')),
  created_at timestamptz default now()
);

create table if not exists public.tracking_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  label text not null, location text, happened_at timestamptz default now(),
  source text default 'manual'
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  kind text default 'other',
  name text not null, storage_path text, size_bytes bigint,
  created_at timestamptz default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null, body text, link text,
  read boolean default false, created_at timestamptz default now()
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  subject text not null, body text,
  status text default 'open' check (status in ('open','answered','resolved')),
  reply text, created_at timestamptz default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text, action text not null, entity text, entity_id text,
  created_at timestamptz default now()
);

create table if not exists public.settings (
  key text primary key, value jsonb not null, updated_at timestamptz default now()
);

-- ─────────── row level security ───────────
alter table public.countries enable row level security;
alter table public.currencies enable row level security;
alter table public.tax_rules enable row level security;
alter table public.shipping_routes enable row level security;
alter table public.vehicles enable row level security;
alter table public.suppliers enable row level security;
alter table public.profiles enable row level security;
alter table public.requests enable row level security;
alter table public.orders enable row level security;
alter table public.order_events enable row level security;
alter table public.quotations enable row level security;
alter table public.payments enable row level security;
alter table public.shipments enable row level security;
alter table public.tracking_events enable row level security;
alter table public.documents enable row level security;
alter table public.notifications enable row level security;
alter table public.tickets enable row level security;
alter table public.inspections enable row level security;
alter table public.audit_logs enable row level security;
alter table public.settings enable row level security;

-- reference data: readable by everyone, writable by admin
do $$
declare t text;
begin
  foreach t in array array['countries','currencies','tax_rules','shipping_routes'] loop
    execute format('drop policy if exists read_all on public.%I', t);
    execute format('create policy read_all on public.%I for select using (true)', t);
    execute format('drop policy if exists admin_write on public.%I', t);
    execute format('create policy admin_write on public.%I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- vehicles: published ones are public; suppliers see and edit their own; staff manage all
drop policy if exists vehicles_public_read on public.vehicles;
create policy vehicles_public_read on public.vehicles for select
  using (status = 'published' or public.is_staff()
         or supplier_id in (select supplier_id from public.profiles where id = auth.uid()));

drop policy if exists vehicles_supplier_write on public.vehicles;
create policy vehicles_supplier_write on public.vehicles for all
  using (public.is_staff() or created_by = auth.uid()
         or supplier_id in (select supplier_id from public.profiles where id = auth.uid()))
  with check (public.is_staff() or created_by = auth.uid()
         or supplier_id in (select supplier_id from public.profiles where id = auth.uid()));

-- suppliers
drop policy if exists suppliers_public_read on public.suppliers;
create policy suppliers_public_read on public.suppliers for select
  using (status = 'verified' or public.is_staff() or owner_id = auth.uid());
drop policy if exists suppliers_self_write on public.suppliers;
create policy suppliers_self_write on public.suppliers for update
  using (public.is_admin() or owner_id = auth.uid())
  with check (public.is_admin() or owner_id = auth.uid());
drop policy if exists suppliers_insert on public.suppliers;
create policy suppliers_insert on public.suppliers for insert
  with check (auth.uid() is not null);

-- profiles
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles for select
  using (id = auth.uid() or public.is_staff());
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- customer-owned records
do $$
declare t text;
begin
  foreach t in array array['requests','orders','quotations','payments','documents','notifications','tickets'] loop
    execute format('drop policy if exists own_read on public.%I', t);
    execute format('create policy own_read on public.%I for select using (user_id = auth.uid() or public.is_staff())', t);
    execute format('drop policy if exists own_write on public.%I', t);
    execute format('create policy own_write on public.%I for insert with check (user_id = auth.uid() or public.is_staff())', t);
  end loop;
end $$;

-- staff-only writes on commerce
do $$
declare t text;
begin
  foreach t in array array['orders','quotations','payments','requests'] loop
    execute format('drop policy if exists staff_update on public.%I', t);
    execute format('create policy staff_update on public.%I for update using (public.is_staff()) with check (public.is_staff())', t);
  end loop;
end $$;

-- order events / tracking / shipments / inspections
drop policy if exists events_read on public.order_events;
create policy events_read on public.order_events for select
  using (public.is_staff() or order_id in (select id from public.orders where user_id = auth.uid()));
drop policy if exists events_write on public.order_events;
create policy events_write on public.order_events for insert with check (public.is_staff());

drop policy if exists shipments_read on public.shipments;
create policy shipments_read on public.shipments for select
  using (public.is_staff() or order_id in (select id from public.orders where user_id = auth.uid()));
drop policy if exists shipments_write on public.shipments;
create policy shipments_write on public.shipments for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists tracking_read on public.tracking_events;
create policy tracking_read on public.tracking_events for select
  using (public.is_staff() or shipment_id in (
    select s.id from public.shipments s join public.orders o on o.id = s.order_id where o.user_id = auth.uid()));
drop policy if exists tracking_write on public.tracking_events;
create policy tracking_write on public.tracking_events for insert with check (public.is_staff());

drop policy if exists inspections_read on public.inspections;
create policy inspections_read on public.inspections for select using (public.is_staff() or true);
drop policy if exists inspections_write on public.inspections;
create policy inspections_write on public.inspections for all using (public.is_staff()) with check (public.is_staff());

-- audit + settings
drop policy if exists audit_read on public.audit_logs;
create policy audit_read on public.audit_logs for select using (public.is_staff());
drop policy if exists audit_write on public.audit_logs;
create policy audit_write on public.audit_logs for insert with check (auth.uid() is not null);
drop policy if exists settings_read on public.settings;
create policy settings_read on public.settings for select using (true);
drop policy if exists settings_write on public.settings;
create policy settings_write on public.settings for all using (public.is_admin()) with check (public.is_admin());

-- ─────────── helpers ───────────
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists vehicles_touch on public.vehicles;
create trigger vehicles_touch before update on public.vehicles
  for each row execute function public.touch_updated_at();
drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();
drop trigger if exists countries_touch on public.countries;
create trigger countries_touch before update on public.countries
  for each row execute function public.touch_updated_at();
drop trigger if exists taxa_touch on public.tax_rules;
create trigger taxa_touch before update on public.tax_rules
  for each row execute function public.touch_updated_at();

-- public catalogue view (safe fields only)
create or replace view public.public_catalogue as
  select id, title, brand, model, year, category, price_usd, currency, mileage_km,
         engine_cc, fuel, transmission, drivetrain, exterior, condition, origin_code,
         images, specifications, shipping_usd, delivery_days, destinations, featured,
         is_demo, status, created_at
  from public.vehicles where status = 'published';

-- storage bucket for inspection reports and customer documents
-- (guarded so the file also runs on a plain Postgres without Supabase Storage)
do $$
begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public)
    values ('documents', 'documents', false)
    on conflict (id) do nothing;

    execute 'drop policy if exists docs_own on storage.objects';
    execute 'create policy docs_own on storage.objects for all
      using (bucket_id = ''documents'' and (owner = auth.uid() or public.is_staff()))
      with check (bucket_id = ''documents'' and owner = auth.uid())';
  end if;
end $$;
