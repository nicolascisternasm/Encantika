-- ============================================================
-- Bloque 8: Páginas institucionales y consultas de contacto
-- ============================================================

-- Nuevas columnas en configuracion_tienda
ALTER TABLE configuracion_tienda
  ADD COLUMN IF NOT EXISTS nav_mostrar_nosotros  boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS nav_mostrar_contacto  boolean DEFAULT true,

  ADD COLUMN IF NOT EXISTS nosotros_titulo       text DEFAULT 'Nuestra historia',
  ADD COLUMN IF NOT EXISTS nosotros_subtitulo    text DEFAULT 'Joyas hechas con amor desde el corazon de Chile',
  ADD COLUMN IF NOT EXISTS nosotros_historia     text DEFAULT 'Encantika nacio de la pasion por crear joyas unicas que cuenten historias. Cada pieza es disenada y elaborada con dedicacion, utilizando materiales de la mas alta calidad para que brilles en cada momento especial de tu vida.',
  ADD COLUMN IF NOT EXISTS nosotros_vision       text DEFAULT 'Ser la marca de joyeria artesanal mas querida de Chile, llevando belleza y magia a cada mujer que nos elige.',

  ADD COLUMN IF NOT EXISTS nosotros_seccion1_titulo  text DEFAULT 'Creadas con amor',
  ADD COLUMN IF NOT EXISTS nosotros_seccion1_texto   text DEFAULT 'Cada joya Encantika es una obra de arte unica. Nuestras artesanas ponen dedicacion y pasion en cada detalle, desde la seleccion de materiales hasta el acabado final.',
  ADD COLUMN IF NOT EXISTS nosotros_seccion1_imagen_id uuid REFERENCES imagenes_sitio(id) ON DELETE SET NULL,

  ADD COLUMN IF NOT EXISTS nosotros_seccion2_titulo  text DEFAULT 'Materiales de calidad',
  ADD COLUMN IF NOT EXISTS nosotros_seccion2_texto   text DEFAULT 'Trabajamos solo con plata 925, oro 18k y banos de oro de alta duracion. Cada piedra es seleccionada individualmente para garantizar el brillo y la calidad que mereces.',
  ADD COLUMN IF NOT EXISTS nosotros_seccion2_imagen_id uuid REFERENCES imagenes_sitio(id) ON DELETE SET NULL,

  ADD COLUMN IF NOT EXISTS nosotros_seccion3_titulo  text DEFAULT 'Para momentos unicos',
  ADD COLUMN IF NOT EXISTS nosotros_seccion3_texto   text DEFAULT 'Desde un regalo especial hasta una joya para uso diario, en Encantika encontraras la pieza perfecta para cada ocasion. Porque cada momento merece brillar.',
  ADD COLUMN IF NOT EXISTS nosotros_seccion3_imagen_id uuid REFERENCES imagenes_sitio(id) ON DELETE SET NULL,

  ADD COLUMN IF NOT EXISTS footer_horario    text DEFAULT 'Lunes a viernes: 9:00 - 18:00 hrs · Sabados: 10:00 - 14:00 hrs',
  ADD COLUMN IF NOT EXISTS footer_direccion  text DEFAULT 'Santiago, Chile · Solo venta online',
  ADD COLUMN IF NOT EXISTS footer_telefono   text DEFAULT '+56 9 XXXX XXXX',

  ADD COLUMN IF NOT EXISTS contacto_titulo    text DEFAULT 'Tienes alguna pregunta?',
  ADD COLUMN IF NOT EXISTS contacto_subtitulo text DEFAULT 'Estamos aqui para ayudarte. Escribenos y te responderemos a la brevedad.',
  ADD COLUMN IF NOT EXISTS contacto_email     text DEFAULT 'contacto@encantika.cl';

-- ──────────────────────────────────────────────────────────────
-- Tabla de consultas de contacto
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS consultas_contacto (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     text        NOT NULL,
  email      text        NOT NULL,
  telefono   text,
  asunto     text,
  mensaje    text        NOT NULL,
  leido      boolean     NOT NULL DEFAULT false,
  creado_en  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE consultas_contacto ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden leer y actualizar
CREATE POLICY "admins_leen_consultas"
  ON consultas_contacto FOR SELECT
  USING (es_admin());

CREATE POLICY "admins_actualizan_consultas"
  ON consultas_contacto FOR UPDATE
  USING (es_admin())
  WITH CHECK (es_admin());

-- Cualquiera puede enviar (anon + authenticated)
CREATE POLICY "publico_inserta_consultas"
  ON consultas_contacto FOR INSERT
  WITH CHECK (true);
