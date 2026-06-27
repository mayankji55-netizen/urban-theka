create extension if not exists "pgcrypto";

create type public.app_role as enum ('OWNER', 'MANAGER', 'KITCHEN', 'WAITER');
create type public.order_status as enum ('NEW', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role public.app_role not null default 'OWNER',
  created_at timestamptz not null default now()
);

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo text,
  phone text,
  whatsapp text,
  address text,
  theme_color text not null default '#ef4444',
  tax_rate numeric(5,2) not null default 5.00,
  service_charge_rate numeric(5,2) not null default 0.00,
  whatsapp_notifications_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.restaurant_members (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role public.app_role not null default 'WAITER',
  created_at timestamptz not null default now(),
  unique (restaurant_id, user_id)
);

create table public.tables (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  table_number integer not null,
  qr_code_url text,
  created_at timestamptz not null default now(),
  unique (restaurant_id, table_number)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  image_url text,
  price numeric(12,2) not null check (price >= 0),
  veg boolean not null default true,
  available boolean not null default true,
  popular boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  table_id uuid references public.tables(id) on delete set null,
  order_number bigint generated always as identity,
  customer_name text not null,
  customer_phone text not null,
  notes text,
  status public.order_status not null default 'NEW',
  subtotal numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  service_charge numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  quantity integer not null check (quantity > 0),
  price numeric(12,2) not null check (price >= 0),
  item_name text not null
);

create index restaurant_members_user_idx on public.restaurant_members(user_id);
create index tables_restaurant_idx on public.tables(restaurant_id);
create index categories_restaurant_idx on public.categories(restaurant_id, sort_order);
create index menu_items_restaurant_idx on public.menu_items(restaurant_id, available);
create index orders_restaurant_status_idx on public.orders(restaurant_id, status, created_at desc);
create index order_items_order_idx on public.order_items(order_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_touch_updated_at
before update on public.orders
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, role)
  values (new.id, coalesce(new.email, ''), 'OWNER')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_restaurant_member(target_restaurant uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.restaurant_members rm
    where rm.restaurant_id = target_restaurant
      and rm.user_id = auth.uid()
  );
$$;

create or replace function public.member_role(target_restaurant uuid)
returns public.app_role
language sql
security definer
stable
as $$
  select rm.role
  from public.restaurant_members rm
  where rm.restaurant_id = target_restaurant
    and rm.user_id = auth.uid()
  limit 1;
$$;

create or replace function public.can_manage_menu(target_restaurant uuid)
returns boolean
language sql
security definer
stable
as $$
  select public.member_role(target_restaurant) in ('OWNER', 'MANAGER');
$$;

create or replace function public.can_manage_tables(target_restaurant uuid)
returns boolean
language sql
security definer
stable
as $$
  select public.member_role(target_restaurant) in ('OWNER', 'WAITER');
$$;

alter table public.users enable row level security;
alter table public.restaurants enable row level security;
alter table public.restaurant_members enable row level security;
alter table public.tables enable row level security;
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Users can read themselves" on public.users
for select using (id = auth.uid());

create policy "Users can update themselves" on public.users
for update using (id = auth.uid()) with check (id = auth.uid());

create policy "Members can read restaurants" on public.restaurants
for select using (public.is_restaurant_member(id));

create policy "Authenticated users can create restaurants" on public.restaurants
for insert with check (auth.uid() is not null);

create policy "Owners can update restaurants" on public.restaurants
for update using (public.member_role(id) = 'OWNER') with check (public.member_role(id) = 'OWNER');

create policy "Members can read membership" on public.restaurant_members
for select using (public.is_restaurant_member(restaurant_id));

create policy "Owners can manage membership" on public.restaurant_members
for all using (public.member_role(restaurant_id) = 'OWNER') with check (public.member_role(restaurant_id) = 'OWNER');

create policy "Public can read tables for QR menu" on public.tables
for select using (true);

create policy "Owners and waiters manage tables" on public.tables
for all using (public.can_manage_tables(restaurant_id)) with check (public.can_manage_tables(restaurant_id));

create policy "Public can read categories" on public.categories
for select using (true);

create policy "Managers manage categories" on public.categories
for all using (public.can_manage_menu(restaurant_id)) with check (public.can_manage_menu(restaurant_id));

create policy "Public can read menu items" on public.menu_items
for select using (true);

create policy "Managers manage menu items" on public.menu_items
for all using (public.can_manage_menu(restaurant_id)) with check (public.can_manage_menu(restaurant_id));

create policy "Members can read orders" on public.orders
for select using (public.is_restaurant_member(restaurant_id));

create policy "Public can create orders" on public.orders
for insert with check (true);

create policy "Members can update orders" on public.orders
for update using (public.is_restaurant_member(restaurant_id)) with check (public.is_restaurant_member(restaurant_id));

create policy "Members can read order items" on public.order_items
for select using (
  exists (
    select 1 from public.orders o
    where o.id = order_id and public.is_restaurant_member(o.restaurant_id)
  )
);

create policy "Public can create order items" on public.order_items
for insert with check (true);

create publication supabase_realtime for table public.orders, public.order_items;

insert into storage.buckets (id, name, public)
values ('restaurant-assets', 'restaurant-assets', true)
on conflict (id) do nothing;

create policy "Public reads restaurant assets" on storage.objects
for select using (bucket_id = 'restaurant-assets');

create policy "Members upload restaurant assets" on storage.objects
for insert with check (
  bucket_id = 'restaurant-assets'
  and auth.uid() is not null
);
