-- ============================================================
-- Bloque 1: Perfiles admin, helper es_admin, configuracion_tienda
-- ============================================================

-- Funcion reutilizable para trigger de actualizado_en
CREATE OR REPLACE FUNCTION actualizar_actualizado_en()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$;

-- perfiles --------------------------------------------------
CREATE TABLE perfiles (
  id              uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_completo text,
  rol             text        NOT NULL CHECK (rol IN ('propietario', 'colaborador')),
  creado_en       timestamptz NOT NULL DEFAULT now()
);

-- Helper SECURITY DEFINER para que las politicas RLS puedan llamarlo con seguridad
CREATE OR REPLACE FUNCTION es_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM perfiles
    WHERE id = auth.uid()
      AND rol IN ('propietario', 'colaborador')
  );
$$;

-- configuracion_tienda (fila singleton forzada por CHECK id = 1) ---
CREATE TABLE configuracion_tienda (
  id                    integer     PRIMARY KEY CHECK (id = 1),
  nombre_tienda         text        NOT NULL DEFAULT 'Encantika',
  url_logo              text,
  moneda                text        NOT NULL DEFAULT 'CLP',
  numero_whatsapp       text,
  url_instagram         text,
  url_mercadolibre      text,
  email_contacto        text,
  direccion_retiro      text,
  instrucciones_retiro  text,
  actualizado_en        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER configuracion_tienda_actualizado_en
  BEFORE UPDATE ON configuracion_tienda
  FOR EACH ROW EXECUTE FUNCTION actualizar_actualizado_en();
