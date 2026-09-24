-- ============================================================
-- Bloque 5: Row Level Security en TODAS las tablas
-- ============================================================

-- Habilitar RLS ---------------------------------------------
ALTER TABLE perfiles                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_tienda      ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias                ENABLE ROW LEVEL SECURITY;
ALTER TABLE colecciones               ENABLE ROW LEVEL SECURITY;
ALTER TABLE atributos                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE valores_atributo          ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE producto_atributos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE variantes_producto        ENABLE ROW LEVEL SECURITY;
ALTER TABLE variante_valores_atributo ENABLE ROW LEVEL SECURITY;
ALTER TABLE producto_colecciones      ENABLE ROW LEVEL SECURITY;
ALTER TABLE imagenes_producto         ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_inventario    ENABLE ROW LEVEL SECURITY;
ALTER TABLE canales_venta             ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE metodos_envio             ENABLE ROW LEVEL SECURITY;
ALTER TABLE zonas_envio               ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_pedido            ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_estados_pedido  ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos                     ENABLE ROW LEVEL SECURITY;

-- ── LECTURA PUBLICA (anon) ──────────────────────────────────

-- configuracion_tienda
CREATE POLICY "lectura_publica_configuracion_tienda" ON configuracion_tienda
  FOR SELECT USING (true);

-- categorias (solo activas)
CREATE POLICY "lectura_publica_categorias_activas" ON categorias
  FOR SELECT USING (activo = true);

-- colecciones (solo activas)
CREATE POLICY "lectura_publica_colecciones_activas" ON colecciones
  FOR SELECT USING (activo = true);

-- atributos
CREATE POLICY "lectura_publica_atributos" ON atributos
  FOR SELECT USING (true);

-- valores_atributo (solo activos)
CREATE POLICY "lectura_publica_valores_atributo_activos" ON valores_atributo
  FOR SELECT USING (activo = true);

-- canales_venta (solo activos)
CREATE POLICY "lectura_publica_canales_venta_activos" ON canales_venta
  FOR SELECT USING (activo = true);

-- metodos_envio (solo activos)
CREATE POLICY "lectura_publica_metodos_envio_activos" ON metodos_envio
  FOR SELECT USING (activo = true);

-- zonas_envio (solo activas)
CREATE POLICY "lectura_publica_zonas_envio_activas" ON zonas_envio
  FOR SELECT USING (activo = true);

-- productos (solo activos)
CREATE POLICY "lectura_publica_productos_activos" ON productos
  FOR SELECT USING (estado = 'activo');

-- producto_atributos (de productos activos)
CREATE POLICY "lectura_publica_producto_atributos" ON producto_atributos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM productos p WHERE p.id = producto_atributos.producto_id AND p.estado = 'activo')
  );

-- variantes_producto (variantes activas de productos activos)
CREATE POLICY "lectura_publica_variantes_producto_activas" ON variantes_producto
  FOR SELECT USING (
    activo = true
    AND EXISTS (SELECT 1 FROM productos p WHERE p.id = variantes_producto.producto_id AND p.estado = 'activo')
  );

-- variante_valores_atributo
CREATE POLICY "lectura_publica_variante_valores_atributo" ON variante_valores_atributo
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM variantes_producto vp
      JOIN productos p ON p.id = vp.producto_id
      WHERE vp.id = variante_valores_atributo.variante_id
        AND vp.activo = true
        AND p.estado = 'activo'
    )
  );

-- producto_colecciones
CREATE POLICY "lectura_publica_producto_colecciones" ON producto_colecciones
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM productos p WHERE p.id = producto_colecciones.producto_id AND p.estado = 'activo')
    AND EXISTS (SELECT 1 FROM colecciones c WHERE c.id = producto_colecciones.coleccion_id AND c.activo = true)
  );

-- imagenes_producto
CREATE POLICY "lectura_publica_imagenes_producto" ON imagenes_producto
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM productos p WHERE p.id = imagenes_producto.producto_id AND p.estado = 'activo')
  );

-- ── ACCESO COMPLETO PARA ADMIN ──────────────────────────────

-- perfiles: admin puede leer/escribir todos; usuarios pueden leer el propio
CREATE POLICY "admin_todos_perfiles" ON perfiles
  FOR ALL USING (es_admin()) WITH CHECK (es_admin());

CREATE POLICY "propio_perfil_lectura" ON perfiles
  FOR SELECT USING (id = auth.uid());

-- configuracion_tienda
CREATE POLICY "admin_escribe_configuracion_tienda" ON configuracion_tienda
  FOR ALL USING (es_admin()) WITH CHECK (es_admin());

-- categorias
CREATE POLICY "admin_todas_categorias" ON categorias
  FOR ALL USING (es_admin()) WITH CHECK (es_admin());

-- colecciones
CREATE POLICY "admin_todas_colecciones" ON colecciones
  FOR ALL USING (es_admin()) WITH CHECK (es_admin());

-- atributos
CREATE POLICY "admin_todos_atributos" ON atributos
  FOR ALL USING (es_admin()) WITH CHECK (es_admin());

-- valores_atributo
CREATE POLICY "admin_todos_valores_atributo" ON valores_atributo
  FOR ALL USING (es_admin()) WITH CHECK (es_admin());

-- productos
CREATE POLICY "admin_todos_productos" ON productos
  FOR ALL USING (es_admin()) WITH CHECK (es_admin());

-- producto_atributos
CREATE POLICY "admin_todos_producto_atributos" ON producto_atributos
  FOR ALL USING (es_admin()) WITH CHECK (es_admin());

-- variantes_producto
CREATE POLICY "admin_todas_variantes_producto" ON variantes_producto
  FOR ALL USING (es_admin()) WITH CHECK (es_admin());

-- variante_valores_atributo
CREATE POLICY "admin_todos_variante_valores_atributo" ON variante_valores_atributo
  FOR ALL USING (es_admin()) WITH CHECK (es_admin());

-- producto_colecciones
CREATE POLICY "admin_todos_producto_colecciones" ON producto_colecciones
  FOR ALL USING (es_admin()) WITH CHECK (es_admin());

-- imagenes_producto
CREATE POLICY "admin_todas_imagenes_producto" ON imagenes_producto
  FOR ALL USING (es_admin()) WITH CHECK (es_admin());

-- movimientos_inventario: solo admin (inmutabilidad aplicada por trigger en 000003)
CREATE POLICY "admin_todos_movimientos_inventario" ON movimientos_inventario
  FOR ALL USING (es_admin()) WITH CHECK (es_admin());

-- canales_venta
CREATE POLICY "admin_todos_canales_venta" ON canales_venta
  FOR ALL USING (es_admin()) WITH CHECK (es_admin());

-- clientes
CREATE POLICY "admin_todos_clientes" ON clientes
  FOR ALL USING (es_admin()) WITH CHECK (es_admin());

-- metodos_envio
CREATE POLICY "admin_todos_metodos_envio" ON metodos_envio
  FOR ALL USING (es_admin()) WITH CHECK (es_admin());

-- zonas_envio
CREATE POLICY "admin_todas_zonas_envio" ON zonas_envio
  FOR ALL USING (es_admin()) WITH CHECK (es_admin());

-- pedidos
CREATE POLICY "admin_todos_pedidos" ON pedidos
  FOR ALL USING (es_admin()) WITH CHECK (es_admin());

-- detalle_pedido
CREATE POLICY "admin_todos_detalle_pedido" ON detalle_pedido
  FOR ALL USING (es_admin()) WITH CHECK (es_admin());

-- historial_estados_pedido
CREATE POLICY "admin_todos_historial_estados_pedido" ON historial_estados_pedido
  FOR ALL USING (es_admin()) WITH CHECK (es_admin());

-- pagos
CREATE POLICY "admin_todos_pagos" ON pagos
  FOR ALL USING (es_admin()) WITH CHECK (es_admin());
