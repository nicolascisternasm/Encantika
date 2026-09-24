# Encantika — Admin Panel

E-commerce admin panel for Encantika, a jewelry brand. Built with Next.js 15 App Router, Supabase, and Tailwind CSS.

## Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Database / Auth**: Supabase (PostgreSQL + Auth + Storage)
- **Styles**: Tailwind CSS v4
- **Package manager**: pnpm

## Key conventions

- **Migrations**: Nunca editar una migración ya aplicada en remoto; cualquier cambio va en una migración nueva.
- Table/column names: **English, snake_case**
- All IDs: **uuid** (`gen_random_uuid()`)
- Prices: **integer** (CLP, no decimals — e.g. `3990` = $3.990)
- All tables have `created_at`; mutable tables also have `updated_at` with a trigger
- Status enums are enforced with PostgreSQL `CHECK` constraints (not enum types) for easier migration
- Supabase clients live in `src/lib/supabase/` (client, server, middleware-client)
- DB types live in `src/types/database.ts` — regenerate with `supabase gen types typescript`

## Project structure

```
supabase/
  migrations/          # One file per logical block
    20260924000001_admin_config.sql
    20260924000002_catalog.sql
    20260924000003_inventory.sql
    20260924000004_sales.sql
    20260924000005_rls.sql
    20260924000006_storage.sql
  seed.sql             # Channels, attributes, shipping, store settings
src/
  app/
    admin/             # Admin panel (protected by middleware + layout)
      login/page.tsx
      layout.tsx
      AdminSidebar.tsx
      page.tsx         # Dashboard
  lib/supabase/        # Three Supabase client factories
  middleware.ts        # Protects /admin/* routes
  types/database.ts    # Generated DB types
docs/
  database.md          # ER diagram (Mermaid)
```

## Infraestructura

| Recurso | Valor |
|---------|-------|
| Supabase Project Ref | `kfjregtgodpmaexuuvxt` |
| Supabase Dashboard | https://supabase.com/dashboard/project/kfjregtgodpmaexuuvxt |

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Database setup

```bash
# Push migrations to remote project
supabase db push

# Run seed data
supabase db push --include-seed

# Regenerate TypeScript types after schema changes
supabase gen types typescript --project-id <YOUR_PROJECT_ID> > src/types/database.ts
```

## Admin access

See README.md for instructions on creating the first owner user.

## RLS summary

| Resource | anon (public) | admin (owner/staff) |
|----------|--------------|---------------------|
| `store_settings` | read | read + write |
| `categories`, `collections`, `attributes`, `attribute_values` | read (active) | full |
| `products` | read (status = active) | full |
| `product_variants`, `product_images` | read (active products) | full |
| `sales_channels`, `shipping_*` | read (active) | full |
| `orders`, `customers`, `payments`, `inventory_movements` | **none** | full |
| `profiles` | own row only | full |
