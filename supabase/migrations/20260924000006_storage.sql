-- ============================================================
-- Bloque 6: Bucket de Storage para imagenes de productos
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'imagenes-productos',
  'imagenes-productos',
  true,
  10485760,  -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Lectura publica (cualquiera puede leer archivos)
CREATE POLICY "lectura_publica_imagenes_productos_storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'imagenes-productos');

-- Solo admins pueden subir/actualizar/eliminar
CREATE POLICY "admin_insertar_imagenes_productos_storage" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'imagenes-productos' AND es_admin());

CREATE POLICY "admin_actualizar_imagenes_productos_storage" ON storage.objects
  FOR UPDATE USING (bucket_id = 'imagenes-productos' AND es_admin());

CREATE POLICY "admin_eliminar_imagenes_productos_storage" ON storage.objects
  FOR DELETE USING (bucket_id = 'imagenes-productos' AND es_admin());
