# Encantika — Admin Panel

Panel de administración para Encantika, una marca de joyería. Construido con Next.js 16, Supabase y Tailwind CSS v4.

## Requisitos

- Node.js 18+
- pnpm
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Una cuenta / proyecto en [Supabase](https://supabase.com)

## Setup rápido

```bash
# 1. Clonar e instalar dependencias
pnpm install

# 2. Variables de entorno
cp .env.local.example .env.local
# Edita .env.local con tus credenciales de Supabase

# 3. Aplicar migraciones y seed al proyecto remoto
supabase login
supabase link --project-ref <TU_PROJECT_REF>
supabase db push
supabase db push --include-seed   # datos iniciales

# 4. Correr en desarrollo
pnpm dev
```

## Crear el primer usuario owner

El sistema usa Supabase Auth para autenticación. Sigue estos pasos:

### Paso 1 — Crear el usuario en Supabase Auth

Desde el **Dashboard de Supabase → Authentication → Users**, crea un nuevo usuario con email y contraseña. Copia el UUID que Supabase asigna.

O desde SQL Editor:

```sql
-- No existe una función directa; usa el dashboard o la Admin API.
-- Si usas la Admin API de Supabase:
-- POST /auth/v1/admin/users  con { email, password, email_confirm: true }
```

### Paso 2 — Insertar el perfil owner

En el **SQL Editor** de Supabase (o con `supabase db execute`):

```sql
INSERT INTO profiles (id, full_name, role)
VALUES (
  '<UUID-DEL-USUARIO>',   -- reemplaza con el UUID copiado del paso 1
  'Nombre Apellido',
  'owner'
);
```

### Paso 3 — Verificar acceso

Navega a `/admin/login` e ingresa con las credenciales creadas. Si el perfil existe con rol `owner` o `staff`, entrarás al panel.

### Crear usuarios staff adicionales

Repite los pasos 1 y 2 usando `role = 'staff'`.

---

## Regenerar tipos TypeScript

Cada vez que modifiques el schema, regenera los tipos:

```bash
supabase gen types typescript --project-id <TU_PROJECT_ID> > src/types/database.ts
```

O si tienes Supabase corriendo localmente:

```bash
supabase gen types typescript --local > src/types/database.ts
```

## Verificar RLS

```bash
# Requiere tsx instalado
pnpm add -D tsx

# Exportar variables de entorno y correr el script
export $(cat .env.local | xargs)
npx tsx scripts/test-rls.ts
```

El script verifica que:
- `anon key` **NO** puede leer `orders`, `customers`, `payments`, `inventory_movements`, `profiles`
- `anon key` **SÍ** puede leer productos con `status = 'active'`
- `anon key` **NO** puede leer productos con `status = 'draft'`
- La vista `variant_stock` retorna el stock correcto

## Estructura del proyecto

```
supabase/
  migrations/
    20260924000001_admin_config.sql   # profiles, is_admin(), store_settings
    20260924000002_catalog.sql        # categories, products, variants, etc.
    20260924000003_inventory.sql      # inventory_movements, variant_stock view
    20260924000004_sales.sql          # orders, customers, payments, etc.
    20260924000005_rls.sql            # políticas RLS en todas las tablas
    20260924000006_storage.sql        # bucket product-images
  seed.sql                            # canales, atributos, métodos de envío
  config.toml                         # config para dev local

src/
  app/
    admin/
      login/
        page.tsx                      # página de login (Server Component wrapper)
        LoginForm.tsx                 # formulario (Client Component)
      layout.tsx                      # layout protegido (verifica perfil admin)
      AdminSidebar.tsx                # sidebar con botón de cerrar sesión
      page.tsx                        # dashboard
  lib/supabase/
    client.ts                         # browser client
    server.ts                         # server client (RSC / Server Actions)
    middleware-client.ts              # client para middleware
  middleware.ts                       # protege /admin/* rutas
  types/database.ts                   # tipos generados por supabase CLI

scripts/
  test-rls.ts                         # verificación de políticas RLS

docs/
  database.md                         # diagrama ER en Mermaid
```

## Diagrama ER

Ver [`docs/database.md`](docs/database.md).
