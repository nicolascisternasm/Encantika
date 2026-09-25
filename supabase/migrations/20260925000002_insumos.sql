-- ============================================================
-- Bloque 9: tipo_producto, insumos, movimientos_insumos,
--           stock_insumos, producto_insumos, RLS
-- ============================================================

-- 1. Campo tipo_producto en productos
ALTER TABLE productos
  ADD COLUMN tipo_producto text NOT NULL DEFAULT 'terminado'
  CHECK (tipo_producto IN ('terminado', 'fabricado'));

-- 2. Tabla insumos
CREATE TABLE insumos (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      text    NOT NULL,
  descripcion text,
  unidad      text    NOT NULL DEFAULT 'unidad'
              CHECK (unidad IN ('unidad', 'metro', 'gramo', 'ml')),
  activo      boolean NOT NULL DEFAULT true,
  creado_en   timestamptz NOT NULL DEFAULT now()
);

-- 3. Tabla movimientos_insumos (inmutable, mismo patron que movimientos_inventario)
CREATE TABLE movimientos_insumos (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  insumo_id  uuid        NOT NULL REFERENCES insumos(id) ON DELETE RESTRICT,
  cantidad   integer     NOT NULL,
  tipo       text        NOT NULL CHECK (tipo IN ('compra', 'uso', 'ajuste', 'devolucion')),
  nota       text,
  creado_por uuid,
  creado_en  timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION movimientos_insumos_inmutable()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'movimientos_insumos es inmutable; registra un nuevo movimiento';
END;
$$;

CREATE TRIGGER movimientos_insumos_sin_modificar
  BEFORE UPDATE OR DELETE ON movimientos_insumos
  FOR EACH ROW EXECUTE FUNCTION movimientos_insumos_inmutable();

-- 4. Vista stock_insumos
CREATE VIEW stock_insumos
  WITH (security_invoker = true)
AS
  SELECT
    insumo_id,
    COALESCE(SUM(cantidad), 0)::integer AS stock
  FROM movimientos_insumos
  GROUP BY insumo_id;

-- 5. Tabla producto_insumos (referencial, no afecta stock automaticamente)
CREATE TABLE producto_insumos (
  producto_id         uuid          NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  insumo_id           uuid          NOT NULL REFERENCES insumos(id) ON DELETE RESTRICT,
  cantidad_por_unidad numeric(10,3) NOT NULL,
  nota                text,
  PRIMARY KEY (producto_id, insumo_id)
);

-- 6. RLS
ALTER TABLE insumos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE producto_insumos    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_todos_insumos" ON insumos
  FOR ALL USING (es_admin()) WITH CHECK (es_admin());

CREATE POLICY "admin_todos_movimientos_insumos" ON movimientos_insumos
  FOR ALL USING (es_admin()) WITH CHECK (es_admin());

CREATE POLICY "admin_todos_producto_insumos" ON producto_insumos
  FOR ALL USING (es_admin()) WITH CHECK (es_admin());
