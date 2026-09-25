ALTER TABLE public.configuracion_tienda
  ADD COLUMN IF NOT EXISTS layout text NOT NULL DEFAULT 'clasico'
    CHECK (layout IN ('clasico','lateral','split','magazine','inmersivo'));
