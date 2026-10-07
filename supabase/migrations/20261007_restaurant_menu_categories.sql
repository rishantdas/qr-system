create table if not exists public.restaurant_menu_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null check (name = btrim(name) and length(name) between 1 and 50),
  created_at timestamptz not null default now(),
  unique (restaurant_id, name)
);

alter table public.restaurant_menu_categories enable row level security;

drop policy if exists "Public can view restaurant menu categories"
  on public.restaurant_menu_categories;
create policy "Public can view restaurant menu categories"
  on public.restaurant_menu_categories
  for select
  using (true);

drop policy if exists "Admins can add own restaurant menu categories"
  on public.restaurant_menu_categories;
create policy "Admins can add own restaurant menu categories"
  on public.restaurant_menu_categories
  for insert
  to authenticated
  with check (public.is_restaurant_admin(restaurant_id));

create or replace function public.seed_restaurant_menu_categories()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.restaurant_menu_categories (restaurant_id, name)
  values
    (new.id, 'Hot Beverages'),
    (new.id, 'Coffee'),
    (new.id, 'Our Special'),
    (new.id, 'Fast Bite'),
    (new.id, 'Fresh Juices'),
    (new.id, 'Shakes'),
    (new.id, 'Mocktails'),
    (new.id, 'Tea and Coffee'),
    (new.id, 'Burgers'),
    (new.id, 'Fries and Sides'),
    (new.id, 'Noodles'),
    (new.id, 'Momo'),
    (new.id, 'Sandwiches'),
    (new.id, 'The Oryza'),
    (new.id, 'Rolls'),
    (new.id, 'Shillong'),
    (new.id, 'Pizza'),
    (new.id, 'Combo Meal'),
    (new.id, 'Soft Drinks'),
    (new.id, 'Lassi');

  return new;
end;
$$;

drop trigger if exists seed_restaurant_menu_categories
  on public.restaurants;
create trigger seed_restaurant_menu_categories
  after insert on public.restaurants
  for each row
  execute function public.seed_restaurant_menu_categories();

insert into public.restaurant_menu_categories (restaurant_id, name)
select restaurant_id, name
from (
  select restaurants.id as restaurant_id, defaults.name
  from public.restaurants
  cross join (values
    ('Hot Beverages'),
    ('Coffee'),
    ('Our Special'),
    ('Fast Bite'),
    ('Fresh Juices'),
    ('Shakes'),
    ('Mocktails'),
    ('Tea and Coffee'),
    ('Burgers'),
    ('Fries and Sides'),
    ('Noodles'),
    ('Momo'),
    ('Sandwiches'),
    ('The Oryza'),
    ('Rolls'),
    ('Shillong'),
    ('Pizza'),
    ('Combo Meal'),
    ('Soft Drinks'),
    ('Lassi')
  ) as defaults(name)
  union
  select restaurant_id, category as name
  from public.menu_items
) as restaurant_categories
on conflict (restaurant_id, name) do nothing;