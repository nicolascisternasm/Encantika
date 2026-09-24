-- ============================================================
-- Datos iniciales — editables desde el panel admin
-- ============================================================

-- canales_venta ---------------------------------------------
INSERT INTO canales_venta (codigo, nombre, activo) VALUES
  ('web',           'Tienda web',          true),
  ('instagram',     'Instagram',           true),
  ('mercadolibre',  'MercadoLibre',        true),
  ('whatsapp',      'WhatsApp',            true),
  ('presencial',    'Venta presencial',    true)
ON CONFLICT (codigo) DO NOTHING;

-- atributos -------------------------------------------------
INSERT INTO atributos (nombre, codigo, orden) VALUES
  ('Material',     'material', 1),
  ('Largo',        'largo',    2),
  ('Talla',        'talla',    3),
  ('Piedra/Color', 'piedra',   4)
ON CONFLICT (codigo) DO NOTHING;

-- valores_atributo: Material --------------------------------
WITH attr AS (SELECT id FROM atributos WHERE codigo = 'material')
INSERT INTO valores_atributo (atributo_id, valor, slug, color_hex, orden, activo)
SELECT
  attr.id,
  v.valor,
  v.slug,
  v.color_hex,
  v.orden,
  true
FROM attr, (VALUES
  ('Plata 925',        'plata-925',        '#C0C0C0', 1),
  ('Oro 18k',          'oro-18k',          '#D4AF37', 2),
  ('Bano de oro',      'bano-de-oro',      '#F0C040', 3),
  ('Bano de oro rosa', 'bano-de-oro-rosa', '#B76E79', 4)
) AS v(valor, slug, color_hex, orden)
ON CONFLICT (atributo_id, slug) DO NOTHING;

-- valores_atributo: Piedra/Color ---------------------------
WITH attr AS (SELECT id FROM atributos WHERE codigo = 'piedra')
INSERT INTO valores_atributo (atributo_id, valor, slug, color_hex, orden, activo)
SELECT
  attr.id,
  v.valor,
  v.slug,
  v.color_hex,
  v.orden,
  true
FROM attr, (VALUES
  ('Circonia',  'circonia',  '#E8E8E8', 1),
  ('Esmeralda', 'esmeralda', '#50C878', 2),
  ('Rubi',      'rubi',      '#E0115F', 3),
  ('Zafiro',    'zafiro',    '#0F52BA', 4),
  ('Perla',     'perla',     '#F0EAD6', 5)
) AS v(valor, slug, color_hex, orden)
ON CONFLICT (atributo_id, slug) DO NOTHING;

-- valores_atributo: Largo (largo de cadena en cm) -----------
WITH attr AS (SELECT id FROM atributos WHERE codigo = 'largo')
INSERT INTO valores_atributo (atributo_id, valor, slug, orden, activo)
SELECT
  attr.id,
  v.valor,
  v.slug,
  v.orden,
  true
FROM attr, (VALUES
  ('40 cm', '40-cm', 1),
  ('45 cm', '45-cm', 2),
  ('50 cm', '50-cm', 3),
  ('60 cm', '60-cm', 4)
) AS v(valor, slug, orden)
ON CONFLICT (atributo_id, slug) DO NOTHING;

-- valores_atributo: Talla (tallas de anillo 5-12) -----------
WITH attr AS (SELECT id FROM atributos WHERE codigo = 'talla')
INSERT INTO valores_atributo (atributo_id, valor, slug, orden, activo)
SELECT
  attr.id,
  v.valor,
  v.slug,
  v.orden,
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
) AS v(valor, slug, orden)
ON CONFLICT (atributo_id, slug) DO NOTHING;

-- metodos_envio ---------------------------------------------
INSERT INTO metodos_envio (id, nombre, tipo, precio_fijo, activo, orden) VALUES
  ('00000000-0000-0000-0001-000000000001', 'Envio tarifa fija', 'tarifa_fija', 3990, true, 1),
  ('00000000-0000-0000-0001-000000000002', 'Envio por zona',    'por_zona',    NULL, true, 2),
  ('00000000-0000-0000-0001-000000000003', 'Retiro en persona', 'retiro',      0,    true, 3)
ON CONFLICT (id) DO NOTHING;

-- zonas_envio (para metodo por zona) ------------------------
INSERT INTO zonas_envio (metodo_envio_id, nombre, localidades, precio, dias_estimados, activo) VALUES
  ('00000000-0000-0000-0001-000000000002', 'Region Metropolitana', ARRAY['RM', 'Santiago'], 2990, 2, true),
  ('00000000-0000-0000-0001-000000000002', 'Resto del pais',       ARRAY['Chile'],          5990, 5, true)
ON CONFLICT DO NOTHING;

-- configuracion_tienda (fila singleton) --------------------
INSERT INTO configuracion_tienda (
  id,
  nombre_tienda,
  moneda,
  numero_whatsapp,
  url_instagram,
  url_mercadolibre,
  email_contacto,
  direccion_retiro,
  instrucciones_retiro
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
  nombre_tienda         = EXCLUDED.nombre_tienda,
  moneda                = EXCLUDED.moneda,
  numero_whatsapp       = EXCLUDED.numero_whatsapp,
  url_instagram         = EXCLUDED.url_instagram,
  url_mercadolibre      = EXCLUDED.url_mercadolibre,
  email_contacto        = EXCLUDED.email_contacto,
  direccion_retiro      = EXCLUDED.direccion_retiro,
  instrucciones_retiro  = EXCLUDED.instrucciones_retiro;
