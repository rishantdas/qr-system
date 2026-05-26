drop policy if exists "Admins can delete restaurant orders" on public.orders;
create policy "Admins can delete restaurant orders"
  on public.orders
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.restaurant_tables rt
      where rt.id = orders.table_id
        and public.is_restaurant_admin(rt.restaurant_id)
    )
  );

drop policy if exists "Admins can delete order items" on public.order_items;
create policy "Admins can delete order items"
  on public.order_items
  for delete
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
