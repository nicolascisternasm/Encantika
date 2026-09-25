-- Tabla: imagenes_sitio
-- Biblioteca centralizada de imágenes para usar en secciones del sitio
CREATE TABLE public.imagenes_sitio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  storage_path text NOT NULL,
  url text NOT NULL,
  ancho integer NOT NULL,
  alto integer NOT NULL,
  orientacion text GENERATED ALWAYS AS (
    CASE
      WHEN ancho > alto * 1.2 THEN 'horizontal'
      WHEN alto > ancho * 1.2 THEN 'vertical'
      ELSE 'cuadrada'
    END
  ) STORED,
  usos_sugeridos text[] GENERATED ALWAYS AS (
    CASE
      WHEN ancho > alto * 1.2
        THEN ARRAY['hero','banner','fondo']
      WHEN alto > ancho * 1.2
        THEN ARRAY['historia','categoria','producto']
      ELSE ARRAY['producto','categoria','insumo']
    END
  ) STORED,
  tamano_bytes integer,
  creado_en timestamptz DEFAULT now()
);

ALTER TABLE public.imagenes_sitio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_select_imagenes_sitio"
  ON public.imagenes_sitio FOR SELECT
  USING (es_admin());

CREATE POLICY "admins_insert_imagenes_sitio"
  ON public.imagenes_sitio FOR INSERT
  WITH CHECK (es_admin());

CREATE POLICY "admins_update_imagenes_sitio"
  ON public.imagenes_sitio FOR UPDATE
  USING (es_admin());

CREATE POLICY "admins_delete_imagenes_sitio"
  ON public.imagenes_sitio FOR DELETE
  USING (es_admin());

-- Nuevas columnas en configuracion_tienda para imágenes de secciones
ALTER TABLE public.configuracion_tienda
  ADD COLUMN IF NOT EXISTS hero_imagen_id uuid REFERENCES public.imagenes_sitio(id),
  ADD COLUMN IF NOT EXISTS hero_posicion text DEFAULT 'center center'
    CHECK (hero_posicion IN (
      'top left','top center','top right',
      'center left','center center','center right',
      'bottom left','bottom center','bottom right'
    )),
  ADD COLUMN IF NOT EXISTS banner_joya_imagen_id uuid REFERENCES public.imagenes_sitio(id),
  ADD COLUMN IF NOT EXISTS banner_joya_posicion text DEFAULT 'center center'
    CHECK (banner_joya_posicion IN (
      'top left','top center','top right',
      'center left','center center','center right',
      'bottom left','bottom center','bottom right'
    )),
  ADD COLUMN IF NOT EXISTS historia_imagen_id uuid REFERENCES public.imagenes_sitio(id),
  ADD COLUMN IF NOT EXISTS historia_posicion text DEFAULT 'center center'
    CHECK (historia_posicion IN (
      'top left','top center','top right',
      'center left','center center','center right',
      'bottom left','bottom center','bottom right'
    ));

-- Bucket de Storage para imágenes del sitio (separado de imagenes-productos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('imagenes-sitio', 'imagenes-sitio', true)
ON CONFLICT (id) DO NOTHING;

-- RLS de Storage: lectura pública, escritura solo admins
CREATE POLICY "imagenes_sitio_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'imagenes-sitio');

CREATE POLICY "imagenes_sitio_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'imagenes-sitio' AND es_admin());

CREATE POLICY "imagenes_sitio_admin_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'imagenes-sitio' AND es_admin());
