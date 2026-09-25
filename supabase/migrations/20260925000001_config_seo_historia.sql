-- Fase 2: agregar campos SEO e historia a configuracion_tienda
ALTER TABLE configuracion_tienda
  ADD COLUMN IF NOT EXISTS seo_titulo TEXT,
  ADD COLUMN IF NOT EXISTS seo_descripcion TEXT,
  ADD COLUMN IF NOT EXISTS historia TEXT,
  ADD COLUMN IF NOT EXISTS mostrar_historia BOOLEAN NOT NULL DEFAULT false;
