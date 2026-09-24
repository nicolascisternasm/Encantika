-- ============================================================
-- Bloque 4: Canales de venta, clientes, envios, pedidos
-- ============================================================

-- canales_venta ---------------------------------------------
CREATE TABLE canales_venta (
  id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo    text        NOT NULL UNIQUE
                        CHECK (codigo IN ('web', 'instagram', 'mercadolibre', 'whatsapp', 'presencial')),
  nombre    text        NOT NULL,
  activo    boolean     NOT NULL DEFAULT true,
  creado_en timestamptz NOT NULL DEFAULT now()
);

-- clientes --------------------------------------------------
CREATE TABLE clientes (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo text        NOT NULL,
  email           text,
  telefono        text,
  notas           text,
  creado_en       timestamptz NOT NULL DEFAULT now(),
  actualizado_en  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX clientes_email_idx    ON clientes (email);
CREATE INDEX clientes_telefono_idx ON clientes (telefono);

CREATE TRIGGER clientes_actualizado_en
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION actualizar_actualizado_en();

-- metodos_envio ---------------------------------------------
CREATE TABLE metodos_envio (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre         text        NOT NULL,
  tipo           text        NOT NULL CHECK (tipo IN ('tarifa_fija', 'por_zona', 'retiro')),
  precio_fijo    integer,
  activo         boolean     NOT NULL DEFAULT true,
  orden          integer     NOT NULL DEFAULT 0,
  creado_en      timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER metodos_envio_actualizado_en
  BEFORE UPDATE ON metodos_envio
  FOR EACH ROW EXECUTE FUNCTION actualizar_actualizado_en();

-- zonas_envio -----------------------------------------------
CREATE TABLE zonas_envio (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  metodo_envio_id  uuid        NOT NULL REFERENCES metodos_envio(id) ON DELETE CASCADE,
  nombre           text        NOT NULL,
  localidades      text[]      NOT NULL DEFAULT '{}',
  precio           integer     NOT NULL DEFAULT 0,
  dias_estimados   integer,
  activo           boolean     NOT NULL DEFAULT true,
  creado_en        timestamptz NOT NULL DEFAULT now(),
  actualizado_en   timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER zonas_envio_actualizado_en
  BEFORE UPDATE ON zonas_envio
  FOR EACH ROW EXECUTE FUNCTION actualizar_actualizado_en();

-- Secuencia para numeros de pedido legibles ----------------
CREATE SEQUENCE pedidos_numero_seq START 1;

-- pedidos ---------------------------------------------------
CREATE TABLE pedidos (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_pedido    text        NOT NULL UNIQUE
                               DEFAULT ('JY-' || LPAD(nextval('pedidos_numero_seq')::text, 6, '0')),
  canal_id         uuid        REFERENCES canales_venta(id) ON DELETE SET NULL,
  cliente_id       uuid        REFERENCES clientes(id) ON DELETE SET NULL,
  estado           text        NOT NULL DEFAULT 'pendiente_pago'
                               CHECK (estado IN (
                                 'pendiente_pago', 'pagado', 'en_produccion',
                                 'listo', 'enviado', 'entregado', 'cancelado', 'reembolsado'
                               )),
  estado_pago      text        NOT NULL DEFAULT 'sin_pagar'
                               CHECK (estado_pago IN ('sin_pagar', 'parcial', 'pagado', 'reembolsado')),
  subtotal         integer     NOT NULL DEFAULT 0,
  costo_envio      integer     NOT NULL DEFAULT 0,
  descuento_total  integer     NOT NULL DEFAULT 0,
  total            integer     NOT NULL DEFAULT 0,
  monto_pagado     integer     NOT NULL DEFAULT 0,
  metodo_envio_id  uuid        REFERENCES metodos_envio(id) ON DELETE SET NULL,
  zona_envio_id    uuid        REFERENCES zonas_envio(id) ON DELETE SET NULL,
  direccion_envio  jsonb,
  notas_cliente    text,
  notas_internas   text,
  creado_por       uuid,
  creado_en        timestamptz NOT NULL DEFAULT now(),
  actualizado_en   timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER pedidos_actualizado_en
  BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION actualizar_actualizado_en();

-- detalle_pedido --------------------------------------------
CREATE TABLE detalle_pedido (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id            uuid        NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  variante_id          uuid        REFERENCES variantes_producto(id) ON DELETE SET NULL,
  tipo_item            text        NOT NULL
                                   CHECK (tipo_item IN ('stock', 'a_pedido', 'personalizado')),
  nombre_producto      text        NOT NULL,
  etiqueta_variante    text,
  sku                  text,
  precio_unitario      integer     NOT NULL DEFAULT 0,
  cantidad             integer     NOT NULL DEFAULT 1,
  total_linea          integer     NOT NULL DEFAULT 0,
  configuracion        jsonb,
  estado_produccion    text        NOT NULL DEFAULT 'no_requiere'
                                   CHECK (estado_produccion IN (
                                     'no_requiere', 'pendiente', 'en_produccion', 'listo'
                                   )),
  fecha_estimada_listo date,
  ruta_imagen_preview  text,
  creado_en            timestamptz NOT NULL DEFAULT now(),
  actualizado_en       timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER detalle_pedido_actualizado_en
  BEFORE UPDATE ON detalle_pedido
  FOR EACH ROW EXECUTE FUNCTION actualizar_actualizado_en();

-- historial_estados_pedido (solo insercion) ----------------
CREATE TABLE historial_estados_pedido (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id       uuid        NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  estado_anterior text,
  estado_nuevo    text        NOT NULL,
  cambiado_por    uuid,
  nota            text,
  creado_en       timestamptz NOT NULL DEFAULT now()
);

-- pagos -----------------------------------------------------
CREATE TABLE pagos (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id         uuid        NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  proveedor         text        NOT NULL
                                CHECK (proveedor IN ('mercadopago', 'transferencia', 'efectivo', 'mercadolibre')),
  id_pago_proveedor text        UNIQUE,
  estado            text        NOT NULL DEFAULT 'pendiente',
  monto             integer     NOT NULL DEFAULT 0,
  datos_crudos      jsonb,
  creado_en         timestamptz NOT NULL DEFAULT now(),
  actualizado_en    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER pagos_actualizado_en
  BEFORE UPDATE ON pagos
  FOR EACH ROW EXECUTE FUNCTION actualizar_actualizado_en();

-- FK desde movimientos_inventario.pedido_id ----------------
ALTER TABLE movimientos_inventario
  ADD CONSTRAINT movimientos_inventario_pedido_id_fkey
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE SET NULL;
