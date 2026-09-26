-- ============================================================
-- Arma tu Joya — Seed: tipos, componentes y datos de ejemplo
-- ============================================================

-- ── Tipos de joya ─────────────────────────────────────────────

INSERT INTO public.tipos_joya (slug, nombre, descripcion, orden) VALUES
  ('collar',   'Collar',   'Joyas para lucir en el cuello',       1),
  ('pulsera',  'Pulsera',  'Joyas para la muñeca',                2),
  ('aros',     'Aros',     'Joyas para las orejas',               3);

-- ── Tipos de componente ───────────────────────────────────────
-- orden_configurador = orden en que aparecen los pasos

INSERT INTO public.tipo_componentes (slug, nombre, orden_configurador, es_obligatorio, tipos_joya_aplicables) VALUES
  ('cadena',         'Cadena',          1, true,  ARRAY['collar','pulsera']),
  ('largo',          'Largo',           2, true,  ARRAY['collar','pulsera']),
  ('piedra',         'Piedra',          3, false, ARRAY['collar','pulsera','aros']),
  ('dije',           'Dije',            4, false, ARRAY['collar','pulsera']),
  ('signo_zodiacal', 'Signo zodiacal',  5, false, ARRAY['collar','pulsera','aros']),
  ('base_aro',       'Base de aro',     1, true,  ARRAY['aros']),
  ('accesorio',      'Accesorio',       6, false, ARRAY['collar','pulsera','aros']);

-- ── Componentes de ejemplo ────────────────────────────────────
-- Cadenas

WITH t AS (SELECT id FROM public.tipo_componentes WHERE slug = 'cadena')
INSERT INTO public.componentes
  (sku, nombre, tipo_componente_id, material, color, precio, stock,
   color_primario, color_secundario, color_acento,
   estilo_energia, intensidad, textura, estilo_particulas,
   desc_holistica, tradicion)
SELECT
  sku, nombre, t.id, material, color, precio, stock,
  color_primario, color_secundario, color_acento,
  estilo_energia, intensidad, textura, estilo_particulas,
  desc_holistica, tradicion
FROM t, (VALUES
  ('CAD-ORO-FINA',   'Cadena dorada fina',    'Acero inoxidable bañado en oro', 'dorado',  4990, 20,
   '#C9A035', '#F5E6B8', '#8B6914',
   'celestial', 6, 'suave', 'chispa',
   'El dorado ha sido símbolo de luz solar y abundancia en numerosas culturas a lo largo de la historia.',
   'simbologia'),
  ('CAD-ORO-MEDIA',  'Cadena dorada mediana', 'Acero inoxidable bañado en oro', 'dorado',  5990, 15,
   '#C9A035', '#F5E6B8', '#8B6914',
   'celestial', 7, 'suave', 'chispa',
   'Tradicional símbolo de calidez y conexión con la energía del sol.',
   'simbologia'),
  ('CAD-PLATA-FINA',  'Cadena plateada fina',  'Acero inoxidable', 'plateado', 3990, 25,
   '#C0C0C0', '#E8E8F0', '#8A8A9A',
   'celestial', 5, 'cristalino', 'polvo',
   'La plata se asocia con la energía lunar, la intuición y la claridad en diversas tradiciones.',
   'simbologia'),
  ('CAD-PLATA-MEDIA', 'Cadena plateada mediana','Acero inoxidable', 'plateado', 4590, 20,
   '#C0C0C0', '#E8E8F0', '#8A8A9A',
   'celestial', 5, 'cristalino', 'polvo',
   'Vinculada a la luna, simboliza reflexión, renovación y flujo natural.',
   'simbologia')
) AS v(sku, nombre, material, color, precio, stock,
       color_primario, color_secundario, color_acento,
       estilo_energia, intensidad, textura, estilo_particulas,
       desc_holistica, tradicion);

-- Largos

WITH t AS (SELECT id FROM public.tipo_componentes WHERE slug = 'largo')
INSERT INTO public.componentes
  (sku, nombre, tipo_componente_id, precio, stock, color_primario, color_secundario, color_acento,
   estilo_energia, intensidad, textura, estilo_particulas)
SELECT sku, nombre, t.id, precio, stock,
       '#F5F0EB', '#EDE8E0', '#D4CFC8',
       'neutro', 3, 'suave', 'ninguno'
FROM t, (VALUES
  ('LAR-40', 'Largo 40 cm', 0, 99),
  ('LAR-45', 'Largo 45 cm', 0, 99),
  ('LAR-50', 'Largo 50 cm', 0, 99),
  ('LAR-60', 'Largo 60 cm', 0, 99)
) AS v(sku, nombre, precio, stock);

-- Piedras

WITH t AS (SELECT id FROM public.tipo_componentes WHERE slug = 'piedra')
INSERT INTO public.componentes
  (sku, nombre, tipo_componente_id, material, color, precio, stock,
   color_primario, color_secundario, color_acento,
   estilo_energia, intensidad, textura, estilo_particulas,
   desc_holistica, tradicion)
SELECT
  sku, nombre, t.id, material, color, precio, stock,
  color_primario, color_secundario, color_acento,
  estilo_energia, intensidad, textura, estilo_particulas,
  desc_holistica, tradicion
FROM t, (VALUES
  ('PIE-LAPISLAZULI', 'Lapislázuli',
   'Piedra natural', 'azul índigo', 3990, 12,
   '#1A237E', '#283593', '#5C6BC0',
   'celestial', 9, 'estelar', 'polvo',
   'Tradicionalmente asociado con la comunicación, la introspección y la búsqueda de claridad interior. En distintas culturas antiguas fue símbolo de sabiduría y conexión con lo sagrado.',
   'cristaloterapia'),
  ('PIE-AMATISTA', 'Amatista',
   'Piedra natural', 'violeta', 3490, 18,
   '#7B1FA2', '#9C27B0', '#CE93D8',
   'celestial', 8, 'cristalino', 'polvo',
   'Dentro de ciertas tradiciones se relaciona con la calma, la protección y el equilibrio emocional. Símbolo de transformación espiritual en múltiples culturas.',
   'cristaloterapia'),
  ('PIE-CUARZO-ROSA', 'Cuarzo rosa',
   'Piedra natural', 'rosa', 2990, 20,
   '#F48FB1', '#F06292', '#FCE4EC',
   'terrestre', 7, 'brumoso', 'burbuja',
   'Tradicionalmente asociado con el amor, la ternura y la compasión. Representa el corazón abierto y los vínculos afectivos en diversas tradiciones.',
   'cristaloterapia'),
  ('PIE-OBSIDIANA', 'Obsidiana negra',
   'Piedra natural', 'negro', 2990, 15,
   '#212121', '#37474F', '#546E7A',
   'terrestre', 9, 'cristalino', 'chispa',
   'Simboliza protección y arraigo en numerosas culturas. Asociada con la claridad, la verdad y la conexión con la tierra.',
   'cristaloterapia'),
  ('PIE-TURQUESA', 'Turquesa',
   'Piedra natural', 'turquesa', 3990, 10,
   '#00695C', '#00897B', '#80CBC4',
   'acuatico', 8, 'fluido', 'burbuja',
   'Considerada un puente entre el cielo y la tierra en tradiciones nativas americanas y del antiguo Oriente. Asociada con la protección, la amistad y la abundancia.',
   'cristaloterapia'),
  ('PIE-CUARZO-BLANCO', 'Cuarzo transparente',
   'Piedra natural', 'transparente', 2490, 22,
   '#F5F5F5', '#ECEFF1', '#CFD8DC',
   'celestial', 5, 'cristalino', 'polvo',
   'Llamado la "piedra del cristal" en muchas culturas, simboliza claridad, amplificación de intenciones y conexión con la luz.',
   'cristaloterapia')
) AS v(sku, nombre, material, color, precio, stock,
       color_primario, color_secundario, color_acento,
       estilo_energia, intensidad, textura, estilo_particulas,
       desc_holistica, tradicion);

-- Signos zodiacales

WITH t AS (SELECT id FROM public.tipo_componentes WHERE slug = 'signo_zodiacal')
INSERT INTO public.componentes
  (sku, nombre, tipo_componente_id, material, precio, stock,
   color_primario, color_secundario, color_acento,
   estilo_energia, intensidad, textura, estilo_particulas,
   desc_holistica, tradicion)
SELECT
  sku, nombre, t.id, 'Acero inoxidable bañado en oro', precio, stock,
  color_primario, color_secundario, color_acento,
  'celestial', intensidad, 'estelar', 'chispa',
  desc_holistica, 'astrologia'
FROM t, (VALUES
  ('ZOD-ARIES',       'Aries',       1990, 8,  '#D32F2F','#EF5350','#FFCDD2', 8, 'El primero del zodiaco. Simboliza el inicio, la valentía y la energía creadora.'),
  ('ZOD-TAURO',       'Tauro',       1990, 8,  '#388E3C','#66BB6A','#C8E6C9', 7, 'Asociado con la estabilidad, la perseverancia y el vínculo con la naturaleza y los sentidos.'),
  ('ZOD-GEMINIS',     'Géminis',     1990, 8,  '#F9A825','#FDD835','#FFF9C4', 7, 'Simboliza la dualidad, la comunicación y la curiosidad intelectual.'),
  ('ZOD-CANCER',      'Cáncer',      1990, 8,  '#1565C0','#42A5F5','#BBDEFB', 8, 'Asociado con el hogar, la intuición profunda y el cuidado de quienes amamos.'),
  ('ZOD-LEO',         'Leo',         1990, 8,  '#E65100','#FF9800','#FFE0B2', 9, 'Simboliza el liderazgo, la generosidad y la expresión auténtica del ser.'),
  ('ZOD-VIRGO',       'Virgo',       1990, 8,  '#827717','#CDDC39','#F0F4C3', 7, 'Asociado con la atención al detalle, la dedicación y el servicio consciente.'),
  ('ZOD-LIBRA',       'Libra',       1990, 8,  '#AD1457','#EC407A','#FCE4EC', 7, 'Simboliza el equilibrio, la armonía en las relaciones y la búsqueda de la justicia.'),
  ('ZOD-ESCORPIO',    'Escorpio',    1990, 8,  '#4A148C','#7B1FA2','#E1BEE7', 9, 'Representa la transformación profunda, la intensidad emocional y el renacer.'),
  ('ZOD-SAGITARIO',   'Sagitario',   1990, 8,  '#BF360C','#FF5722','#FBE9E7', 8, 'Asociado con la expansión, la aventura y la búsqueda de significado y verdad.'),
  ('ZOD-CAPRICORNIO', 'Capricornio', 1990, 8,  '#37474F','#607D8B','#ECEFF1', 7, 'Simboliza la disciplina, la ambición y la sabiduría que se construye con el tiempo.'),
  ('ZOD-ACUARIO',     'Acuario',     1990, 8,  '#0277BD','#29B6F6','#E1F5FE', 8, 'Asociado con la originalidad, la visión de futuro y los ideales colectivos.'),
  ('ZOD-PISCIS',      'Piscis',      1990, 8,  '#00838F','#26C6DA','#E0F7FA', 9, 'Representa la intuición, la compasión y la conexión con dimensiones más allá de lo visible.')
) AS v(sku, nombre, precio, stock,
       color_primario, color_secundario, color_acento,
       intensidad, desc_holistica);

-- Dijes

WITH t AS (SELECT id FROM public.tipo_componentes WHERE slug = 'dije')
INSERT INTO public.componentes
  (sku, nombre, tipo_componente_id, material, precio, stock,
   color_primario, color_secundario, color_acento,
   estilo_energia, intensidad, textura, estilo_particulas,
   desc_holistica, tradicion)
SELECT
  sku, nombre, t.id, 'Acero inoxidable bañado en oro', precio, stock,
  color_primario, color_secundario, color_acento,
  estilo_energia, intensidad, textura, estilo_particulas,
  desc_holistica, tradicion
FROM t, (VALUES
  ('DIJ-LUNA',       'Luna creciente', 2490, 10,
   '#C0C0C0','#E8E8F0','#8A8A9A',
   'celestial', 8, 'estelar', 'polvo',
   'Símbolo universal de renovación, ciclos y energía femenina. Representa la intuición y la transformación constante.',
   'simbologia'),
  ('DIJ-SOL',        'Sol radiante',   2490, 10,
   '#F9A825','#FFD54F','#FFF9C4',
   'igneo', 9, 'suave', 'chispa',
   'Símbolo de vida, vitalidad y luz. Asociado con la energía masculina, el liderazgo y la fuerza creadora.',
   'simbologia'),
  ('DIJ-OJO',        'Ojo turco',      2990, 8,
   '#1565C0','#42A5F5','#BBDEFB',
   'acuatico', 7, 'cristalino', 'ninguno',
   'Talismán de protección en culturas mediterráneas y de Medio Oriente. Simboliza la buena energía y el resguardo frente a influencias negativas.',
   'simbologia'),
  ('DIJ-FLOR-VIDA',  'Flor de la vida', 2990, 6,
   '#C9A035','#F5E6B8','#8B6914',
   'terrestre', 8, 'cristalino', 'polvo',
   'Patrón geométrico sagrado presente en múltiples culturas. Representa la interconexión de toda la vida y la armonía universal.',
   'simbologia'),
  ('DIJ-INFINITO',   'Símbolo infinito', 1990, 15,
   '#C9A035','#F5E6B8','#8B6914',
   'celestial', 6, 'suave', 'ninguno',
   'Representa la continuidad, los ciclos eternos y el vínculo que trasciende el tiempo.',
   'simbologia'),
  ('DIJ-MARIPOSA',   'Mariposa',       2490, 8,
   '#CE93D8','#AB47BC','#F3E5F5',
   'terrestre', 7, 'brumoso', 'polvo',
   'Símbolo de transformación, renacimiento y libertad. Asociada con el proceso de crecimiento personal.',
   'naturaleza'),
  ('DIJ-CORAZON',    'Corazón',        1990, 20,
   '#F48FB1','#E91E63','#FCE4EC',
   'terrestre', 7, 'suave', 'ninguno',
   'Símbolo universal del amor y la conexión emocional. Representa la apertura del corazón y los afectos más profundos.',
   'simbologia')
) AS v(sku, nombre, precio, stock,
       color_primario, color_secundario, color_acento,
       estilo_energia, intensidad, textura, estilo_particulas,
       desc_holistica, tradicion);
