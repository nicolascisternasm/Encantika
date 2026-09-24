-- ============================================================
-- Block 7: Test data cleanup helper
-- ============================================================
-- Modifies the immutability trigger to allow a transaction-local
-- bypass via a session variable, then creates limpiar_datos_prueba()
-- (callable only with service_role) so test-rls.ts leaves no rows behind.

-- Re-define the immutability guard to respect the session variable.
-- When app.cleanup_test_data = 'true' (transaction-local, set only by
-- limpiar_datos_prueba), the trigger returns OLD instead of raising.
CREATE OR REPLACE FUNCTION inventory_movements_immutable()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('app.cleanup_test_data', true) = 'true' THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'inventory_movements es inmutable; registra un movimiento de ajuste';
END;
$$;

-- limpiar_datos_prueba: removes all rows whose slug starts with '__test__'.
-- 1. Sets a transaction-local session variable so the immutability trigger
--    allows the DELETE on inventory_movements.
-- 2. Deletes inventory_movements for test variants first (ON DELETE RESTRICT).
-- 3. Deletes test products; cascade removes variants, images, attributes, etc.
CREATE OR REPLACE FUNCTION limpiar_datos_prueba()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Activar bypass del trigger de inmutabilidad (transaction-local: se resetea al commit)
  PERFORM set_config('app.cleanup_test_data', 'true', true);

  -- Movimientos de inventario (ON DELETE RESTRICT → borrar antes que las variantes)
  DELETE FROM inventory_movements
  WHERE variant_id IN (
    SELECT pv.id
    FROM   product_variants pv
    JOIN   products p ON p.id = pv.product_id
    WHERE  starts_with(p.slug, '__test__')
  );

  -- Productos → CASCADE borra product_variants, variant_attribute_values,
  -- product_attributes, product_collections, product_images
  DELETE FROM products WHERE starts_with(slug, '__test__');
END;
$$;

REVOKE EXECUTE ON FUNCTION limpiar_datos_prueba() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION limpiar_datos_prueba() TO   service_role;
