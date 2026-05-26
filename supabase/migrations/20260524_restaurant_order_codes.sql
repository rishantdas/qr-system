create or replace function public.generate_restaurant_order_prefix(restaurant_name text)
returns text
language plpgsql
immutable
as $$
declare
  uppercase_letters text;
  word_initials text;
  compact_name text;
begin
  uppercase_letters := regexp_replace(restaurant_name, '[^A-Z0-9]+', '', 'g');

  if length(uppercase_letters) >= 2 then
    return left(uppercase_letters, 4);
  end if;

  select string_agg(upper(left(part, 1)), '')
  into word_initials
  from regexp_split_to_table(trim(restaurant_name), '\s+') as part
  where part <> '';

  if coalesce(length(word_initials), 0) >= 2 then
    return left(word_initials, 4);
  end if;

  compact_name := upper(regexp_replace(restaurant_name, '[^A-Za-z0-9]+', '', 'g'));
  return left(compact_name, 4);
end;
$$;

alter table public.restaurants
  add column if not exists order_prefix text,
  add column if not exists last_order_number bigint not null default 0;

update public.restaurants
set order_prefix = public.generate_restaurant_order_prefix(name)
where order_prefix is null or order_prefix = '';

alter table public.restaurants
  alter column order_prefix set not null;

alter table public.orders
  add column if not exists restaurant_id uuid references public.restaurants(id) on delete restrict,
  add column if not exists restaurant_order_number bigint,
  add column if not exists restaurant_order_code text;

with ranked_orders as (
  select
    o.id,
    rt.restaurant_id,
    row_number() over (
      partition by rt.restaurant_id
      order by o.created_at asc, o.id asc
    ) as sequence_number
  from public.orders o
  join public.restaurant_tables rt on rt.id = o.table_id
)
update public.orders o
set
  restaurant_id = ranked_orders.restaurant_id,
  restaurant_order_number = ranked_orders.sequence_number,
  restaurant_order_code = r.order_prefix || ranked_orders.sequence_number
from ranked_orders
join public.restaurants r on r.id = ranked_orders.restaurant_id
where o.id = ranked_orders.id
  and (
    o.restaurant_id is null
    or o.restaurant_order_number is null
    or o.restaurant_order_code is null
  );

update public.restaurants r
set last_order_number = coalesce(order_counts.max_sequence_number, 0)
from (
  select restaurant_id, max(restaurant_order_number) as max_sequence_number
  from public.orders
  group by restaurant_id
) as order_counts
where r.id = order_counts.restaurant_id;

alter table public.orders
  alter column restaurant_id set not null,
  alter column restaurant_order_number set not null,
  alter column restaurant_order_code set not null;

create unique index if not exists idx_orders_restaurant_order_number_unique
  on public.orders (restaurant_id, restaurant_order_number);

create unique index if not exists idx_orders_restaurant_order_code_unique
  on public.orders (restaurant_id, restaurant_order_code);

create or replace function public.create_public_order(
  p_table_id uuid,
  p_items jsonb
)
returns table (
  id uuid,
  restaurant_order_code text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_restaurant_id uuid;
  v_order_id uuid;
  v_order_prefix text;
  v_next_order_number bigint;
  v_total_amount numeric(10, 2);
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one item.';
  end if;

  select rt.restaurant_id
  into v_restaurant_id
  from public.restaurant_tables rt
  where rt.id = p_table_id;

  if v_restaurant_id is null then
    raise exception 'Table not found.';
  end if;

  select coalesce(sum(
    ((item->>'quantity')::integer * (item->>'price')::numeric(10, 2))
  ), 0)
  into v_total_amount
  from jsonb_array_elements(p_items) as item;

  if v_total_amount <= 0 then
    raise exception 'Order total must be greater than zero.';
  end if;

  update public.restaurants
  set last_order_number = last_order_number + 1
  where public.restaurants.id = v_restaurant_id
  returning public.restaurants.order_prefix, public.restaurants.last_order_number
  into v_order_prefix, v_next_order_number;

  insert into public.orders (
    table_id,
    restaurant_id,
    restaurant_order_number,
    restaurant_order_code,
    status,
    total_amount
  )
  values (
    p_table_id,
    v_restaurant_id,
    v_next_order_number,
    v_order_prefix || v_next_order_number,
    'pending',
    v_total_amount
  )
  returning orders.id, orders.restaurant_order_code
  into v_order_id, create_public_order.restaurant_order_code;

  insert into public.order_items (order_id, menu_item_id, quantity, price)
  select
    v_order_id,
    (item->>'menu_item_id')::uuid,
    (item->>'quantity')::integer,
    (item->>'price')::numeric(10, 2)
  from jsonb_array_elements(p_items) as item;

  id := v_order_id;
  return next;
end;
$$;

grant execute on function public.create_public_order(uuid, jsonb) to anon;
grant execute on function public.create_public_order(uuid, jsonb) to authenticated;
