drop policy if exists "Admins can delete own restaurant menu items"
  on public.menu_items;

create policy "Admins can delete own restaurant menu items"
  on public.menu_items
  for delete
  to authenticated
  using (public.is_restaurant_admin(restaurant_id));