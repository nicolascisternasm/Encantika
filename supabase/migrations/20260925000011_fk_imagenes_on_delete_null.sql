-- Corrige las FK de imagenes_sitio que no tenían ON DELETE SET NULL,
-- lo que impedía eliminar imágenes usadas en la configuración.

ALTER TABLE public.configuracion_tienda
  DROP CONSTRAINT IF EXISTS configuracion_tienda_hero_imagen_id_fkey,
  DROP CONSTRAINT IF EXISTS configuracion_tienda_banner_joya_imagen_id_fkey,
  DROP CONSTRAINT IF EXISTS configuracion_tienda_historia_imagen_id_fkey;

ALTER TABLE public.configuracion_tienda
  ADD CONSTRAINT configuracion_tienda_hero_imagen_id_fkey
    FOREIGN KEY (hero_imagen_id) REFERENCES public.imagenes_sitio(id) ON DELETE SET NULL,
  ADD CONSTRAINT configuracion_tienda_banner_joya_imagen_id_fkey
    FOREIGN KEY (banner_joya_imagen_id) REFERENCES public.imagenes_sitio(id) ON DELETE SET NULL,
  ADD CONSTRAINT configuracion_tienda_historia_imagen_id_fkey
    FOREIGN KEY (historia_imagen_id) REFERENCES public.imagenes_sitio(id) ON DELETE SET NULL;
