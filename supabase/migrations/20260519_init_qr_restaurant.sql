create extension if not exists "pgcrypto";

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  table_number integer not null,
  qr_token text not null unique default encode(gen_random_bytes(12), 'hex'),
  created_at timestamptz not null default now(),
  unique (restaurant_id, table_number)
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  description text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  image_url text,
  category text not null,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references public.restaurant_tables(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'preparing', 'completed')),
  total_amount numeric(10, 2) not null check (total_amount >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  price numeric(10, 2) not null check (price >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.restaurant_admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, restaurant_id)
);

create index if not exists idx_restaurant_tables_restaurant_id
  on public.restaurant_tables (restaurant_id);

create index if not exists idx_menu_items_restaurant_id
  on public.menu_items (restaurant_id);

create index if not exists idx_menu_items_category
  on public.menu_items (category);

create index if not exists idx_orders_table_id
  on public.orders (table_id);

create index if not exists idx_orders_status
  on public.orders (status);

create index if not exists idx_orders_created_at
  on public.orders (created_at desc);

create index if not exists idx_order_items_order_id
  on public.order_items (order_id);

create index if not exists idx_order_items_menu_item_id
  on public.order_items (menu_item_id);

create or replace function public.is_restaurant_admin(target_restaurant_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.restaurant_admins ra
    where ra.user_id = auth.uid()
      and ra.restaurant_id = target_restaurant_id
  );
$$;

alter table public.restaurants enable row level security;
alter table public.restaurant_tables enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.restaurant_admins enable row level security;

drop policy if exists "Public can view restaurants" on public.restaurants;
create policy "Public can view restaurants"
  on public.restaurants
  for select
  using (true);

drop policy if exists "Public can view tables" on public.restaurant_tables;
create policy "Public can view tables"
  on public.restaurant_tables
  for select
  using (true);

drop policy if exists "Public can view menu items" on public.menu_items;
create policy "Public can view menu items"
  on public.menu_items
  for select
  using (true);

drop policy if exists "Public can create orders" on public.orders;
create policy "Public can create orders"
  on public.orders
  for insert
  with check (
    exists (
      select 1
      from public.restaurant_tables rt
      where rt.id = table_id
    )
  );

drop policy if exists "Admins can view restaurant orders" on public.orders;
create policy "Admins can view restaurant orders"
  on public.orders
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.restaurant_tables rt
      where rt.id = orders.table_id
        and public.is_restaurant_admin(rt.restaurant_id)
    )
  );

drop policy if exists "Admins can update restaurant orders" on public.orders;
create policy "Admins can update restaurant orders"
  on public.orders
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.restaurant_tables rt
      where rt.id = orders.table_id
        and public.is_restaurant_admin(rt.restaurant_id)
    )
  )
  with check (
    exists (
      select 1
      from public.restaurant_tables rt
      where rt.id = orders.table_id
        and public.is_restaurant_admin(rt.restaurant_id)
    )
  );

drop policy if exists "Public can create order items" on public.order_items;
create policy "Public can create order items"
  on public.order_items
  for insert
  with check (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
    )
  );

drop policy if exists "Admins can view order items" on public.order_items;
create policy "Admins can view order items"
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      join public.restaurant_tables rt on rt.id = o.table_id
      where o.id = order_items.order_id
        and public.is_restaurant_admin(rt.restaurant_id)
    )
  );

drop policy if exists "Admins can view own restaurant mapping" on public.restaurant_admins;
create policy "Admins can view own restaurant mapping"
  on public.restaurant_admins
  for select
  to authenticated
  using (user_id = auth.uid());

alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_items;
