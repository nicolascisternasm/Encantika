ALTER TABLE public.configuracion_tienda
  DROP CONSTRAINT IF EXISTS configuracion_tienda_layout_check;

ALTER TABLE public.configuracion_tienda
  ADD CONSTRAINT configuracion_tienda_layout_check
    CHECK (layout IN ('clasico','lateral','split','magazine','inmersivo','landing'));
