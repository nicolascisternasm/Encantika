-- ============================================================
-- Bloque 2: Catalogo de productos completo
-- ============================================================

-- categorias ------------------------------------------------
CREATE TABLE categorias (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre              text        NOT NULL,
  slug                text        NOT NULL UNIQUE,
  categoria_padre_id  uuid        REFERENCES categorias(id) ON DELETE SET NULL,
  url_imagen          text,
  orden               integer     NOT NULL DEFAULT 0,
  activo              boolean     NOT NULL DEFAULT true,
  creado_en           timestamptz NOT NULL DEFAULT now(),
  actualizado_en      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER categorias_actualizado_en
  BEFORE UPDATE ON categorias
  FOR EACH ROW EXECUTE FUNCTION actualizar_actualizado_en();

-- colecciones -----------------------------------------------
CREATE TABLE colecciones (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre         text        NOT NULL,
  slug           text        NOT NULL UNIQUE,
  descripcion    text,
  url_imagen     text,
  activo         boolean     NOT NULL DEFAULT true,
  orden          integer     NOT NULL DEFAULT 0,
  creado_en      timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER colecciones_actualizado_en
  BEFORE UPDATE ON colecciones
  FOR EACH ROW EXECUTE FUNCTION actualizar_actualizado_en();

-- atributos -------------------------------------------------
CREATE TABLE atributos (
  id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre    text        NOT NULL,
  codigo    text        NOT NULL UNIQUE,
  orden     integer     NOT NULL DEFAULT 0,
  creado_en timestamptz NOT NULL DEFAULT now()
);

-- valores_atributo ------------------------------------------
CREATE TABLE valores_atributo (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  atributo_id  uuid        NOT NULL REFERENCES atributos(id) ON DELETE CASCADE,
  valor        text        NOT NULL,
  slug         text        NOT NULL,
  color_hex    text,
  orden        integer     NOT NULL DEFAULT 0,
  activo       boolean     NOT NULL DEFAULT true,
  creado_en    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (atributo_id, slug)
);

-- productos -------------------------------------------------
CREATE TABLE productos (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre                 text        NOT NULL,
  slug                   text        NOT NULL UNIQUE,
  descripcion            text,
  categoria_id           uuid        REFERENCES categorias(id) ON DELETE SET NULL,
  precio_base            integer     NOT NULL DEFAULT 0,
  precio_comparacion     integer,
  estado                 text        NOT NULL DEFAULT 'borrador'
                                     CHECK (estado IN ('borrador', 'activo', 'archivado')),
  destacado              boolean     NOT NULL DEFAULT false,
  dias_tiempo_produccion integer,
  titulo_seo             text,
  descripcion_seo        text,
  creado_en              timestamptz NOT NULL DEFAULT now(),
  actualizado_en         timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER productos_actualizado_en
  BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION actualizar_actualizado_en();

-- producto_atributos ----------------------------------------
CREATE TABLE producto_atributos (
  producto_id  uuid NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  atributo_id  uuid NOT NULL REFERENCES atributos(id) ON DELETE CASCADE,
  PRIMARY KEY (producto_id, atributo_id)
);

-- variantes_producto ----------------------------------------
CREATE TABLE variantes_producto (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id            uuid        NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  sku                    text        NOT NULL UNIQUE,
  precio                 integer     NOT NULL DEFAULT 0,
  precio_comparacion     integer,
  peso_gramos            integer,
  permite_a_pedido       boolean     NOT NULL DEFAULT false,
  dias_tiempo_produccion integer,
  activo                 boolean     NOT NULL DEFAULT true,
  creado_en              timestamptz NOT NULL DEFAULT now(),
  actualizado_en         timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER variantes_producto_actualizado_en
  BEFORE UPDATE ON variantes_producto
  FOR EACH ROW EXECUTE FUNCTION actualizar_actualizado_en();

-- variante_valores_atributo ---------------------------------
CREATE TABLE variante_valores_atributo (
  variante_id       uuid NOT NULL REFERENCES variantes_producto(id) ON DELETE CASCADE,
  valor_atributo_id uuid NOT NULL REFERENCES valores_atributo(id) ON DELETE CASCADE,
  PRIMARY KEY (variante_id, valor_atributo_id)
);

-- producto_colecciones --------------------------------------
CREATE TABLE producto_colecciones (
  producto_id  uuid NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  coleccion_id uuid NOT NULL REFERENCES colecciones(id) ON DELETE CASCADE,
  PRIMARY KEY (producto_id, coleccion_id)
);

-- imagenes_producto -----------------------------------------
CREATE TABLE imagenes_producto (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id          uuid        NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  variante_id          uuid        REFERENCES variantes_producto(id) ON DELETE SET NULL,
  ruta_almacenamiento  text        NOT NULL,
  texto_alt            text,
  orden                integer     NOT NULL DEFAULT 0,
  creado_en            timestamptz NOT NULL DEFAULT now()
);
