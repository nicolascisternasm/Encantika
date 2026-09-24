-- ============================================================
-- Seed data (Block 6) — editable later from the admin panel
-- ============================================================

-- sales_channels --------------------------------------------
INSERT INTO sales_channels (code, name, is_active) VALUES
  ('web',           'Tienda web',          true),
  ('instagram',     'Instagram',           true),
  ('mercadolibre',  'MercadoLibre',        true),
  ('whatsapp',      'WhatsApp',            true),
  ('in_person',     'Venta presencial',    true)
ON CONFLICT (code) DO NOTHING;

-- attributes ------------------------------------------------
INSERT INTO attributes (name, code, sort_order) VALUES
  ('Material',     'material', 1),
  ('Largo',        'length',   2),
  ('Talla',        'size',     3),
  ('Piedra/Color', 'stone',    4)
ON CONFLICT (code) DO NOTHING;

-- attribute_values: Material --------------------------------
WITH attr AS (SELECT id FROM attributes WHERE code = 'material')
INSERT INTO attribute_values (attribute_id, value, slug, hex_color, sort_order, is_active)
SELECT
  attr.id,
  v.value,
  v.slug,
  v.hex_color,
  v.sort_order,
  true
FROM attr, (VALUES
  ('Plata 925',        'plata-925',        '#C0C0C0', 1),
  ('Oro 18k',          'oro-18k',          '#D4AF37', 2),
  ('Baño de oro',      'bano-de-oro',      '#F0C040', 3),
  ('Baño de oro rosa', 'bano-de-oro-rosa', '#B76E79', 4)
) AS v(value, slug, hex_color, sort_order)
ON CONFLICT (attribute_id, slug) DO NOTHING;

-- attribute_values: Piedra/Color ---------------------------
WITH attr AS (SELECT id FROM attributes WHERE code = 'stone')
INSERT INTO attribute_values (attribute_id, value, slug, hex_color, sort_order, is_active)
SELECT
  attr.id,
  v.value,
  v.slug,
  v.hex_color,
  v.sort_order,
  true
FROM attr, (VALUES
  ('Circonia',  'circonia',  '#E8E8E8', 1),
  ('Esmeralda', 'esmeralda', '#50C878', 2),
  ('Rubí',      'rubi',      '#E0115F', 3),
  ('Zafiro',    'zafiro',    '#0F52BA', 4),
  ('Perla',     'perla',     '#F0EAD6', 5)
) AS v(value, slug, hex_color, sort_order)
ON CONFLICT (attribute_id, slug) DO NOTHING;

-- attribute_values: Largo (chain length in cm) --------------
WITH attr AS (SELECT id FROM attributes WHERE code = 'length')
INSERT INTO attribute_values (attribute_id, value, slug, sort_order, is_active)
SELECT
  attr.id,
  v.value,
  v.slug,
  v.sort_order,
  true
FROM attr, (VALUES
  ('40 cm', '40-cm', 1),
  ('45 cm', '45-cm', 2),
  ('50 cm', '50-cm', 3),
  ('60 cm', '60-cm', 4)
) AS v(value, slug, sort_order)
ON CONFLICT (attribute_id, slug) DO NOTHING;

-- attribute_values: Talla (ring sizes 5–12) -----------------
WITH attr AS (SELECT id FROM attributes WHERE code = 'size')
INSERT INTO attribute_values (attribute_id, value, slug, sort_order, is_active)
SELECT
  attr.id,
  v.value,
  v.slug,
  v.sort_order,
  true
FROM attr, (VALUES
  ('5',  'talla-5',  1),
  ('6',  'talla-6',  2),
  ('7',  'talla-7',  3),
  ('8',  'talla-8',  4),
  ('9',  'talla-9',  5),
  ('10', 'talla-10', 6),
  ('11', 'talla-11', 7),
  ('12', 'talla-12', 8)
) AS v(value, slug, sort_order)
ON CONFLICT (attribute_id, slug) DO NOTHING;

-- shipping_methods ------------------------------------------
INSERT INTO shipping_methods (id, name, type, flat_price, is_active, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000001', 'Envío tarifa fija',  'flat',    3990, true, 1),
  ('00000000-0000-0000-0001-000000000002', 'Envío por zona',     'zone',    NULL, true, 2),
  ('00000000-0000-0000-0001-000000000003', 'Retiro en persona',  'pickup',  0,    true, 3)
ON CONFLICT (id) DO NOTHING;

-- shipping_zones (for zone-based method) --------------------
INSERT INTO shipping_zones (shipping_method_id, name, locations, price, estimated_days, is_active) VALUES
  ('00000000-0000-0000-0001-000000000002', 'Región Metropolitana', ARRAY['RM', 'Santiago'], 2990, 2, true),
  ('00000000-0000-0000-0001-000000000002', 'Resto del país',       ARRAY['Chile'],          5990, 5, true)
ON CONFLICT DO NOTHING;

-- store_settings (singleton row) ----------------------------
INSERT INTO store_settings (
  id,
  store_name,
  currency,
  whatsapp_number,
  instagram_url,
  mercadolibre_url,
  contact_email,
  pickup_address,
  pickup_instructions
) VALUES (
  1,
  'Encantika',
  'CLP',
  '+56 9 0000 0000',
  'https://instagram.com/encantika',
  'https://listado.mercadolibre.cl/encantika',
  'hola@encantika.cl',
  'Santiago, Chile',
  'Coordinar retiro por Instagram o WhatsApp.'
)
ON CONFLICT (id) DO UPDATE SET
  store_name          = EXCLUDED.store_name,
  currency            = EXCLUDED.currency,
  whatsapp_number     = EXCLUDED.whatsapp_number,
  instagram_url       = EXCLUDED.instagram_url,
  mercadolibre_url    = EXCLUDED.mercadolibre_url,
  contact_email       = EXCLUDED.contact_email,
  pickup_address      = EXCLUDED.pickup_address,
  pickup_instructions = EXCLUDED.pickup_instructions;
