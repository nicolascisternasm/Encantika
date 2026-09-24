-- ============================================================
-- Bloque 3: Movimientos de inventario (libro mayor inmutable) + vista de stock
-- ============================================================

CREATE TABLE movimientos_inventario (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  variante_id uuid        NOT NULL REFERENCES variantes_producto(id) ON DELETE RESTRICT,
  cantidad    integer     NOT NULL,
  tipo        text        NOT NULL CHECK (tipo IN ('compra', 'venta', 'ajuste', 'devolucion')),
  pedido_id   uuid,
  nota        text,
  creado_por  uuid,
  creado_en   timestamptz NOT NULL DEFAULT now()
);

-- Inmutabilidad aplicada por trigger (preferido sobre RULES: mas claro, mas dificil de eludir,
-- visible en introspection). La funcion es reemplazada en la migracion 000007 para admitir
-- el bypass de limpieza de datos de prueba.
CREATE OR REPLACE FUNCTION movimientos_inventario_inmutable()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'movimientos_inventario es inmutable; registra un movimiento de ajuste';
END;
$$;

CREATE TRIGGER movimientos_inventario_sin_modificar
  BEFORE UPDATE OR DELETE ON movimientos_inventario
  FOR EACH ROW EXECUTE FUNCTION movimientos_inventario_inmutable();

-- stock_variantes: nivel de stock actual por variante.
-- security_invoker = true evalua el RLS del llamador:
-- anon no ve nada porque movimientos_inventario bloquea anon via RLS.
CREATE VIEW stock_variantes
  WITH (security_invoker = true)
AS
  SELECT
    variante_id,
    COALESCE(SUM(cantidad), 0)::integer AS stock
  FROM movimientos_inventario
  GROUP BY variante_id;

-- obtener_disponibilidad_variantes: consulta publica de disponibilidad.
-- SECURITY DEFINER para leer movimientos_inventario sin importar permisos del llamador,
-- pero nunca retorna el conteo exacto de stock.
CREATE OR REPLACE FUNCTION obtener_disponibilidad_variantes(variante_ids uuid[])
RETURNS TABLE (
  variante_id      uuid,
  en_stock         boolean,
  stock_bajo       boolean,
  permite_a_pedido boolean
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    vp.id                                                AS variante_id,
    (COALESCE(SUM(mi.cantidad), 0) > 0)                 AS en_stock,
    (COALESCE(SUM(mi.cantidad), 0) BETWEEN 1 AND 3)     AS stock_bajo,
    vp.permite_a_pedido
  FROM variantes_producto vp
  LEFT JOIN movimientos_inventario mi ON mi.variante_id = vp.id
  JOIN productos p ON p.id = vp.producto_id
  WHERE vp.id = ANY(variante_ids)
    AND vp.activo = true
    AND p.estado = 'activo'
  GROUP BY vp.id, vp.permite_a_pedido;
$$;

GRANT EXECUTE ON FUNCTION obtener_disponibilidad_variantes(uuid[]) TO anon, authenticated;
