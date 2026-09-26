-- ============================================================
-- Arma tu Joya — Etapa 1: modelo de datos completo
-- ============================================================

-- ── 1. Tipos de joya (collar, pulsera, aros...) ───────────────

CREATE TABLE public.tipos_joya (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text        NOT NULL UNIQUE,
  nombre      text        NOT NULL,
  icono_svg   text,                           -- SVG inline para la UI
  descripcion text,
  activo      boolean     NOT NULL DEFAULT true,
  orden       integer     NOT NULL DEFAULT 0,
  creado_en   timestamptz NOT NULL DEFAULT now()
);

-- ── 2. Tipos de componente (cadena, piedra, dije...) ──────────

CREATE TABLE public.tipo_componentes (
  id                     uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                   text     NOT NULL UNIQUE,
  nombre                 text     NOT NULL,
  orden_configurador     integer  NOT NULL DEFAULT 0,  -- orden en los pasos
  es_obligatorio         boolean  NOT NULL DEFAULT false,
  tipos_joya_aplicables  text[]   NOT NULL DEFAULT '{}', -- slugs: ['collar','pulsera']
  creado_en              timestamptz NOT NULL DEFAULT now()
);

-- ── 3. Componentes (el inventario del configurador) ───────────

CREATE TABLE public.componentes (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sku                text        NOT NULL UNIQUE,
  nombre             text        NOT NULL,
  descripcion        text,
  tipo_componente_id uuid        NOT NULL REFERENCES public.tipo_componentes(id),

  -- Producto
  material           text,
  color              text,
  precio             integer     NOT NULL DEFAULT 0 CHECK (precio >= 0),
  stock              integer     NOT NULL DEFAULT 0 CHECK (stock >= 0),

  -- Imágenes
  url_imagen         text,       -- foto individual del componente
  url_imagen_capa    text,       -- PNG transparente para superponer en el preview

  -- Propiedades para el fondo dinámico reactivo
  color_primario     text,       -- hex, ej: '#1A237E'
  color_secundario   text,
  color_acento       text,
  estilo_energia     text        CHECK (estilo_energia IN ('celestial','terrestre','igneo','acuatico','neutro')),
  intensidad         integer     CHECK (intensidad BETWEEN 1 AND 10) DEFAULT 5,
  textura            text        CHECK (textura IN ('cristalino','brumoso','fluido','estelar','suave')),
  estilo_particulas  text        CHECK (estilo_particulas IN ('chispa','polvo','burbuja','ninguno')) DEFAULT 'ninguno',

  -- Contenido holístico (mostrar al usuario al seleccionar)
  desc_holistica     text,
  tradicion          text        CHECK (tradicion IN ('astrologia','cristaloterapia','simbologia','mitologia','naturaleza','otro')),

  activo             boolean     NOT NULL DEFAULT true,
  orden              integer     NOT NULL DEFAULT 0,
  creado_en          timestamptz NOT NULL DEFAULT now(),
  actualizado_en     timestamptz NOT NULL DEFAULT now()
);

-- ── 4. Incompatibilidades entre componentes ───────────────────
-- Ej: cadena de seda no es compatible con dije muy pesado

CREATE TABLE public.componente_incompatibilidades (
  componente_id        uuid NOT NULL REFERENCES public.componentes(id) ON DELETE CASCADE,
  incompatible_con_id  uuid NOT NULL REFERENCES public.componentes(id) ON DELETE CASCADE,
  motivo               text,
  PRIMARY KEY (componente_id, incompatible_con_id),
  CHECK (componente_id <> incompatible_con_id)
);

-- ── 5. Configuraciones de joya guardadas ─────────────────────

CREATE TABLE public.configuraciones_joya (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_joya_id     uuid        REFERENCES public.tipos_joya(id),
  nombre_receptor  text,
  es_regalo        boolean     NOT NULL DEFAULT false,
  intencion_texto  text,        -- intención opcional que escribe el cliente
  significado_ia   text,        -- narrativa generada por Claude (combinación)
  tarjeta_texto    text,        -- tarjeta personalizada generada por Claude
  precio_total     integer     NOT NULL DEFAULT 0 CHECK (precio_total >= 0),
  estado           text        NOT NULL DEFAULT 'borrador'
                               CHECK (estado IN ('borrador','pedido','fabricando','entregado','cancelado')),
  config_json      jsonb       NOT NULL DEFAULT '{}',  -- snapshot completo
  creado_en        timestamptz NOT NULL DEFAULT now(),
  actualizado_en   timestamptz NOT NULL DEFAULT now()
);

-- ── 6. Componentes por configuración ─────────────────────────

CREATE TABLE public.configuracion_componentes (
  configuracion_id  uuid    NOT NULL REFERENCES public.configuraciones_joya(id) ON DELETE CASCADE,
  componente_id     uuid    NOT NULL REFERENCES public.componentes(id),
  cantidad          integer NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  PRIMARY KEY (configuracion_id, componente_id)
);

-- ── Triggers actualizado_en ───────────────────────────────────

CREATE TRIGGER trg_componentes_actualizado_en
  BEFORE UPDATE ON public.componentes
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_actualizado_en();

CREATE TRIGGER trg_configuraciones_joya_actualizado_en
  BEFORE UPDATE ON public.configuraciones_joya
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_actualizado_en();

-- ── Índices ───────────────────────────────────────────────────

CREATE INDEX idx_componentes_tipo      ON public.componentes(tipo_componente_id);
CREATE INDEX idx_componentes_activo    ON public.componentes(activo, stock);
CREATE INDEX idx_config_estado         ON public.configuraciones_joya(estado);
CREATE INDEX idx_config_comp_config    ON public.configuracion_componentes(configuracion_id);

-- ── RLS ───────────────────────────────────────────────────────

ALTER TABLE public.tipos_joya                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipo_componentes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.componentes                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.componente_incompatibilidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuraciones_joya        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion_componentes   ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "lectura_publica_tipos_joya"
  ON public.tipos_joya FOR SELECT USING (activo = true);

CREATE POLICY "lectura_publica_tipo_componentes"
  ON public.tipo_componentes FOR SELECT USING (true);

CREATE POLICY "lectura_publica_componentes_activos"
  ON public.componentes FOR SELECT USING (activo = true AND stock > 0);

CREATE POLICY "lectura_publica_incompatibilidades"
  ON public.componente_incompatibilidades FOR SELECT USING (true);

-- configuraciones: anon puede insertar (cliente sin login), admin lee todo
CREATE POLICY "insertar_configuracion_anon"
  ON public.configuraciones_joya FOR INSERT WITH CHECK (true);

CREATE POLICY "lectura_admin_configuraciones"
  ON public.configuraciones_joya FOR SELECT USING (es_admin());

CREATE POLICY "escritura_admin_configuraciones"
  ON public.configuraciones_joya FOR UPDATE USING (es_admin());

CREATE POLICY "insertar_config_componentes_anon"
  ON public.configuracion_componentes FOR INSERT WITH CHECK (true);

CREATE POLICY "lectura_admin_config_componentes"
  ON public.configuracion_componentes FOR SELECT USING (es_admin());

-- Admin: CRUD completo en tablas de catálogo
CREATE POLICY "admin_tipos_joya"
  ON public.tipos_joya FOR ALL USING (es_admin());

CREATE POLICY "admin_tipo_componentes"
  ON public.tipo_componentes FOR ALL USING (es_admin());

CREATE POLICY "admin_componentes"
  ON public.componentes FOR ALL USING (es_admin());

CREATE POLICY "admin_incompatibilidades"
  ON public.componente_incompatibilidades FOR ALL USING (es_admin());
