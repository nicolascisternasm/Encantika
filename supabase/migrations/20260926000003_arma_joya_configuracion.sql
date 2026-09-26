-- ============================================================
-- Arma tu Joya — configuración de visualización
-- ============================================================

CREATE TABLE public.configuracion_arma_joya (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  mostrar_precio        boolean     NOT NULL DEFAULT true,
  mostrar_descripcion   boolean     NOT NULL DEFAULT false,
  actualizado_en        timestamptz NOT NULL DEFAULT now()
);

-- Fila única inicial
INSERT INTO public.configuracion_arma_joya (mostrar_precio, mostrar_descripcion)
VALUES (true, false);

-- RLS
ALTER TABLE public.configuracion_arma_joya ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lectura_publica_config_arma_joya"
  ON public.configuracion_arma_joya FOR SELECT USING (true);

CREATE POLICY "admin_config_arma_joya"
  ON public.configuracion_arma_joya FOR ALL USING (es_admin());

-- ── Bucket para imágenes de componentes ──────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('imagenes-componentes', 'imagenes-componentes', true, 10485760)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "lectura_publica_imagenes_componentes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'imagenes-componentes');

CREATE POLICY "admin_upload_imagenes_componentes"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'imagenes-componentes' AND es_admin());

CREATE POLICY "admin_update_imagenes_componentes"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'imagenes-componentes' AND es_admin());

CREATE POLICY "admin_delete_imagenes_componentes"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'imagenes-componentes' AND es_admin());
