-- ============================================================
-- Bloque 7: Limpieza de datos de prueba
-- ============================================================
-- Modifica el trigger de inmutabilidad para admitir un bypass
-- transaction-local via variable de sesion, luego crea
-- limpiar_datos_prueba() (solo ejecutable con service_role)
-- para que test-rls.ts no deje filas en la base remota.

-- Re-define el trigger de inmutabilidad para respetar la variable de sesion.
-- Cuando app.limpieza_datos_prueba = 'true' (transaction-local, activado solo por
-- limpiar_datos_prueba), el trigger devuelve OLD en lugar de lanzar excepcion.
CREATE OR REPLACE FUNCTION movimientos_inventario_inmutable()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('app.limpieza_datos_prueba', true) = 'true' THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'movimientos_inventario es inmutable; registra un movimiento de ajuste';
END;
$$;

-- limpiar_datos_prueba: elimina todas las filas creadas por test-rls.ts.
-- Solo ejecutable con service_role (REVOKE FROM PUBLIC + GRANT TO service_role).
-- Activa una variable de sesion transaction-local para que el trigger de
-- inmutabilidad permita el DELETE en movimientos_inventario.
CREATE OR REPLACE FUNCTION limpiar_datos_prueba()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Activar bypass del trigger (transaction-local: se resetea al commit)
  PERFORM set_config('app.limpieza_datos_prueba', 'true', true);

  -- Movimientos (ON DELETE RESTRICT → borrar antes que las variantes)
  DELETE FROM movimientos_inventario
  WHERE variante_id IN (
    SELECT vp.id
    FROM   variantes_producto vp
    JOIN   productos p ON p.id = vp.producto_id
    WHERE  starts_with(p.slug, '__test__')
  );

  -- Productos → CASCADE borra variantes_producto, variante_valores_atributo,
  -- producto_atributos, producto_colecciones, imagenes_producto
  DELETE FROM productos WHERE starts_with(slug, '__test__');
END;
$$;

REVOKE EXECUTE ON FUNCTION limpiar_datos_prueba() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION limpiar_datos_prueba() TO   service_role;
