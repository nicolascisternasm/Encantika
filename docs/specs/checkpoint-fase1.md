# Checkpoint Fase 1 — Estado al 2026-09-24

## Estado general

Reescritura completa de la base de datos al español según docs/glosario.md.
Archivos en disco, commit wip realizado. **Pendiente: reset remoto + gen types + build + push.**

## Migraciones (000001-000007 + seed.sql)

| Archivo | Estado |
|---------|--------|
| `20260924000001_admin_config.sql` | ✓ reescrito en español |
| `20260924000002_catalog.sql`      | ✓ reescrito en español |
| `20260924000003_inventory.sql`    | ✓ reescrito en español |
| `20260924000004_sales.sql`        | ✓ reescrito en español |
| `20260924000005_rls.sql`          | ✓ reescrito en español |
| `20260924000006_storage.sql`      | ✓ reescrito en español |
| `20260924000007_test_cleanup.sql` | ✓ reescrito en español |
| `seed.sql`                        | ✓ reescrito en español |

Glosario completo: `docs/glosario.md` — ✓ creado

## Código actualizado

| Archivo | Cambio |
|---------|--------|
| `src/proxy.ts`                         | ✓ perfiles, rol, propietario/colaborador |
| `src/app/admin/layout.tsx`             | ✓ perfiles, rol, nombre_completo |
| `src/app/admin/page.tsx`               | ✓ pedidos, productos, clientes |
| `src/app/admin/login/LoginForm.tsx`    | ✓ perfiles, rol, propietario/colaborador |
| `scripts/test-rls.ts`                  | ✓ todas las tablas en español, obtener_disponibilidad_variantes, limpiar_datos_prueba |
| `docs/database.md`                     | ✓ diagrama ER en español |
| `CLAUDE.md`                            | ✓ regla de idioma, proxy.ts |
| `README.md`                            | ✓ nombres de tablas y migraciones en español |
| `docs/glosario.md`                     | ✓ nuevo — glosario completo inglés→español |

**Nota:** `src/types/database.ts` NO se toca manualmente — se regenera con
`npx supabase gen types typescript --linked` después del reset.

## Pendiente (a ejecutar en orden)

### Paso 1 — SQL Editor del Dashboard de Supabase
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres, public, anon, authenticated, service_role;
DELETE FROM storage.objects WHERE bucket_id = 'product-images';
DELETE FROM storage.buckets  WHERE id = 'product-images';
TRUNCATE supabase_migrations.schema_migrations;
```

### Paso 2 — Terminal local
```bash
npx supabase db push --include-seed
```

### Paso 3 — Una vez confirmado el reset (ejecutar yo)
```bash
npx supabase gen types typescript --linked > src/types/database.ts
pnpm build
export $(cat .env.local | xargs) && npx tsx scripts/test-rls.ts
git add -A
git commit + git push
```

## Resumen de cambios de nomenclatura clave

- `profiles` → `perfiles` | `role` → `rol` | `owner`/`staff` → `propietario`/`colaborador`
- `products` → `productos` | `status` → `estado` | `active`/`draft` → `activo`/`borrador`
- `orders` → `pedidos` | `customers` → `clientes` | `payments` → `pagos`
- `inventory_movements` → `movimientos_inventario` | `variant_stock` → `stock_variantes`
- `is_admin()` → `es_admin()` | `get_variant_availability()` → `obtener_disponibilidad_variantes()`
- bucket `product-images` → `imagenes-productos`
