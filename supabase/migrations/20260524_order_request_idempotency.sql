alter table public.orders
  add column if not exists client_request_id text;

create unique index if not exists idx_orders_restaurant_request_id_unique
  on public.orders (restaurant_id, client_request_id)
  where client_request_id is not null;

create or replace function public.create_public_order(
  p_table_id uuid,
  p_items jsonb,
  p_client_request_id text default null
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
  v_existing_order_id uuid;
  v_existing_order_code text;
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

  if p_client_request_id is not null and btrim(p_client_request_id) <> '' then
    select o.id, o.restaurant_order_code
    into v_existing_order_id, v_existing_order_code
    from public.orders o
    where o.restaurant_id = v_restaurant_id
      and o.client_request_id = p_client_request_id;

    if v_existing_order_id is not null then
      id := v_existing_order_id;
      restaurant_order_code := v_existing_order_code;
      return next;
      return;
    end if;
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
    client_request_id,
    status,
    total_amount
  )
  values (
    p_table_id,
    v_restaurant_id,
    v_next_order_number,
    v_order_prefix || v_next_order_number,
    nullif(btrim(p_client_request_id), ''),
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

grant execute on function public.create_public_order(uuid, jsonb, text) to anon;
grant execute on function public.create_public_order(uuid, jsonb, text) to authenticated;
