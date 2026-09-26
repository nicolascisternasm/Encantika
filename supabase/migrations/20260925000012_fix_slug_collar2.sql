-- Normalizar slugs mal ingresados (con espacios o mayúsculas)
UPDATE public.productos
SET slug = lower(
  regexp_replace(
    regexp_replace(
      trim(slug),
      '[^a-z0-9\s-]', '', 'gi'
    ),
    '\s+', '-', 'g'
  )
)
WHERE slug ~ '[^a-z0-9-]';
