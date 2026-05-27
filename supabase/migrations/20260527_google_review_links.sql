alter table public.restaurants
  add column if not exists google_review_url text;

drop policy if exists "Admins can update own restaurant" on public.restaurants;
create policy "Admins can update own restaurant"
  on public.restaurants
  for update
  to authenticated
  using (public.is_restaurant_admin(id))
  with check (public.is_restaurant_admin(id));
