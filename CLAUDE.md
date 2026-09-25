# Encantika — Admin Panel

E-commerce admin panel for Encantika, a jewelry brand. Built with Next.js 15 App Router, Supabase, and Tailwind CSS.

## Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Database / Auth**: Supabase (PostgreSQL + Auth + Storage)
- **Styles**: Tailwind CSS v4
- **Package manager**: pnpm

## Regla de idioma

| Capa | Idioma |
|------|--------|
| Código (TypeScript, archivos, carpetas, variables) | inglés |
| Base de datos (tablas, columnas, vistas, funciones SQL, triggers, valores de CHECK, buckets, variables de sesión) | español, snake_case, sin tildes ni ñ |
| Interfaz (tienda y admin, errores, validaciones Zod) | español de Chile, con tildes correctas |
| Comunicación, README, CLAUDE.md, docs/, comentarios, commits | español |

`id` y `slug` se mantienen en todos los contextos.
Ver `docs/glosario.md` para la tabla completa de equivalencias inglés → español.

## Key conventions

- **Migrations**: Nunca editar una migración ya aplicada en remoto; cualquier cambio va en una migración nueva.
- All IDs: **uuid** (`gen_random_uuid()`)
- Prices: **integer** (CLP, no decimals — e.g. `3990` = $3.990)
- All tables have `creado_en`; mutable tables also have `actualizado_en` with a trigger (`actualizar_actualizado_en()`)
- Status enums are enforced with PostgreSQL `CHECK` constraints (not enum types) for easier migration
- Supabase clients live in `src/lib/supabase/` (client, server, middleware-client, admin)
- DB types live in `src/types/database.ts` — regenerate with `npx supabase gen types typescript --linked`

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
  lib/supabase/        # Four Supabase client factories (client, server, middleware-client, admin)
  proxy.ts             # Protects /admin/* routes (Next.js 16 proxy convention)
  types/database.ts    # Generated DB types
docs/
  database.md          # ER diagram (Mermaid)
```

## Infraestructura

| Recurso | Valor |
|---------|-------|
| Supabase Project Ref | `kfjregtgodpmaexuuvxt` |
| Supabase Dashboard | https://supabase.com/dashboard/project/kfjregtgodpmaexuuvxt |
| GitHub | https://github.com/nicolascisternasm/Encantika |

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

## Upload de imágenes

El flujo actual pasa el archivo por una Server Action (`subirImagenInsumo`, `uploadProductImage`). Funciona con `experimental.serverActions.bodySizeLimit: '10mb'` en `next.config.ts`.

**Deuda técnica — migrar a upload directo desde el navegador:**
El flujo correcto para imágenes grandes es cliente → Supabase Storage directamente, sin pasar por la Server Action:

```ts
// En el componente cliente:
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase.storage
  .from('imagenes-productos')
  .upload(path, file, { contentType: file.type })

// Luego una Server Action solo guarda la URL:
await guardarUrlImagen(recordId, data.path)
```

Ventajas: sin límite de tamaño en la SA, transfiere datos directo al CDN, no consume memoria del servidor Next.js.
El bucket ya tiene RLS configurada para admins (`es_admin()`), así que el cliente con sesión de usuario puede subir directamente.

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
