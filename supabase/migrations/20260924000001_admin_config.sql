-- ============================================================
-- Block 1: Admin profiles, is_admin helper, store settings
-- ============================================================

-- Reusable updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- profiles --------------------------------------------------
CREATE TABLE profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  text,
  role       text NOT NULL CHECK (role IN ('owner', 'staff')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Security-definer helper so RLS policies can call it safely
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND role IN ('owner', 'staff')
  );
$$;

-- store_settings (singleton row enforced by CHECK id = 1) ---
CREATE TABLE store_settings (
  id                   integer  PRIMARY KEY CHECK (id = 1),
  store_name           text     NOT NULL DEFAULT 'Encantika',
  logo_url             text,
  currency             text     NOT NULL DEFAULT 'CLP',
  whatsapp_number      text,
  instagram_url        text,
  mercadolibre_url     text,
  contact_email        text,
  pickup_address       text,
  pickup_instructions  text,
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER store_settings_updated_at
  BEFORE UPDATE ON store_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
