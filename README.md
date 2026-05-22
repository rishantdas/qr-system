# QR Restaurant Ordering MVP

Production-ready MVP for QR-based restaurant ordering with `React + Vite + Tailwind CSS + Supabase`.

## Features

- Customer menu flow at `/menu/:tableId`
- Category filtering and menu search
- Cart with quantity controls and sticky mobile checkout
- Order placement stored in Supabase PostgreSQL
- Supabase Auth powered admin login
- Protected admin dashboard
- Realtime incoming orders and status updates
- QR code generation helper for table links
- Error boundaries, empty states, loading states, and Vercel SPA routing support

## Tech Stack

- Frontend: React 18 + Vite
- Styling: Tailwind CSS
- Routing: React Router
- State: Zustand
- Backend + Auth + Realtime: Supabase

## Project Structure

```text
src/
  components/
  context/
  hooks/
  layouts/
  lib/
  pages/
  routes/
  services/
  store/
  utils/
supabase/
  migrations/
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Add your Supabase project values to `.env`:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_APP_NAME=Littlebox QR Ordering
VITE_APP_BASE_URL=http://localhost:5173
```

4. Run the SQL migration in Supabase SQL Editor:

`supabase/migrations/20260519_init_qr_restaurant.sql`

5. Create at least one admin user in Supabase Auth.

6. Insert seed data:

- One row in `restaurants`
- Multiple rows in `restaurant_tables`
- Menu rows in `menu_items`
- One row in `restaurant_admins` that maps the authenticated admin user to the restaurant

7. Start the app:

```bash
npm run dev
```

## Supabase Notes

### Required tables

- `restaurants`
- `restaurant_tables`
- `menu_items`
- `orders`
- `order_items`

### Supporting table

- `restaurant_admins`

This extra table links Supabase Auth users to a restaurant so the admin dashboard can be protected with row-level security.

### Realtime

The migration adds `orders` and `order_items` to `supabase_realtime`.

The frontend subscribes so that:

- New orders appear instantly in the admin dashboard
- Order status changes refresh automatically

## Seed Example

```sql
insert into public.restaurants (name)
values ('Littlebox Bistro');

insert into public.restaurant_tables (restaurant_id, table_number)
select id, x
from public.restaurants,
generate_series(1, 8) as x
where name = 'Littlebox Bistro';
```

Add menu items manually or with a similar SQL script.

## Admin Authentication Flow

- Admin signs in on `/admin/login`
- Auth state is tracked in `AuthContext`
- Protected routes use `AuthGuard`
- Restaurant access is resolved from `restaurant_admins`

## QR Code Flow

Use `generateTableQrCode(tableId)` from [src/utils/qr.js](/Users/rishantdas/Desktop/littlebox/qr system/src/utils/qr.js) to generate printable QR images.

Each QR points to:

`/menu/:tableId`

## Deployment to Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add the same environment variables from `.env`.
4. Deploy with:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Output directory: `dist`
5. Keep `vercel.json` so client-side routes like `/menu/:tableId` and `/admin` work after refresh.

## Recommended Production Hardening

- Add image upload/storage flow for menu items
- Add per-restaurant branding settings
- Replace the QR prompt on the admin dashboard with a table selector
- Add kitchen display mode or printer integration
- Add audit logs and status transition history
- Restrict menu visibility to valid `qr_token` checks if you want stronger public link validation

## Useful Routes

- `/menu/:tableId`
- `/order-success/:orderId`
- `/admin/login`
- `/admin`
