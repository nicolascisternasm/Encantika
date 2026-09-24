-- ============================================================
-- Block 3: Inventory movements (immutable ledger) + stock view
-- ============================================================

CREATE TABLE inventory_movements (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id  uuid        NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantity    integer     NOT NULL,
  type        text        NOT NULL CHECK (type IN ('purchase', 'sale', 'adjustment', 'return')),
  order_id    uuid,
  note        text,
  created_by  uuid,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Immutability enforced by a trigger (preferred over RULES, which can be
-- bypassed by superusers and are harder to introspect)
CREATE OR REPLACE FUNCTION inventory_movements_immutable()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'inventory_movements es inmutable; registra un movimiento de ajuste';
END;
$$;

CREATE TRIGGER inventory_movements_no_update_delete
  BEFORE UPDATE OR DELETE ON inventory_movements
  FOR EACH ROW EXECUTE FUNCTION inventory_movements_immutable();

-- variant_stock view: current stock level per variant.
-- security_invoker = true means the view evaluates the caller's RLS context,
-- so anon sees nothing (inventory_movements blocks anon via RLS).
CREATE VIEW variant_stock
  WITH (security_invoker = true)
AS
  SELECT
    variant_id,
    COALESCE(SUM(quantity), 0)::integer AS stock
  FROM inventory_movements
  GROUP BY variant_id;

-- get_variant_availability: public-safe availability check.
-- SECURITY DEFINER so it can read inventory_movements regardless of caller
-- permissions, but it intentionally never returns the raw stock count.
CREATE OR REPLACE FUNCTION get_variant_availability(variant_ids uuid[])
RETURNS TABLE (
  variant_id           uuid,
  in_stock             boolean,
  low_stock            boolean,
  allow_made_to_order  boolean
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    pv.id                                               AS variant_id,
    (COALESCE(SUM(im.quantity), 0) > 0)                AS in_stock,
    (COALESCE(SUM(im.quantity), 0) BETWEEN 1 AND 3)    AS low_stock,
    pv.allow_made_to_order
  FROM product_variants pv
  LEFT JOIN inventory_movements im ON im.variant_id = pv.id
  JOIN products p ON p.id = pv.product_id
  WHERE pv.id = ANY(variant_ids)
    AND pv.is_active = true
    AND p.status = 'active'
  GROUP BY pv.id, pv.allow_made_to_order;
$$;

GRANT EXECUTE ON FUNCTION get_variant_availability(uuid[]) TO anon, authenticated;
