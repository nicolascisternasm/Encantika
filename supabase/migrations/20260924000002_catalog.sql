-- ============================================================
-- Block 2: Full product catalog
-- ============================================================

-- categories ------------------------------------------------
CREATE TABLE categories (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  slug        text        NOT NULL UNIQUE,
  parent_id   uuid        REFERENCES categories(id) ON DELETE SET NULL,
  image_url   text,
  sort_order  integer     NOT NULL DEFAULT 0,
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- collections -----------------------------------------------
CREATE TABLE collections (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  slug        text        NOT NULL UNIQUE,
  description text,
  image_url   text,
  is_active   boolean     NOT NULL DEFAULT true,
  sort_order  integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- attributes ------------------------------------------------
CREATE TABLE attributes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  code        text        NOT NULL UNIQUE,
  sort_order  integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- attribute_values ------------------------------------------
CREATE TABLE attribute_values (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  attribute_id  uuid        NOT NULL REFERENCES attributes(id) ON DELETE CASCADE,
  value         text        NOT NULL,
  slug          text        NOT NULL,
  hex_color     text,
  sort_order    integer     NOT NULL DEFAULT 0,
  is_active     boolean     NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (attribute_id, slug)
);

-- products --------------------------------------------------
CREATE TABLE products (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text        NOT NULL,
  slug                  text        NOT NULL UNIQUE,
  description           text,
  category_id           uuid        REFERENCES categories(id) ON DELETE SET NULL,
  base_price            integer     NOT NULL DEFAULT 0,
  compare_at_price      integer,
  status                text        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  is_featured           boolean     NOT NULL DEFAULT false,
  default_lead_time_days integer,
  seo_title             text,
  seo_description       text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- product_attributes ----------------------------------------
CREATE TABLE product_attributes (
  product_id    uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  attribute_id  uuid NOT NULL REFERENCES attributes(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, attribute_id)
);

-- product_variants ------------------------------------------
CREATE TABLE product_variants (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id          uuid        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku                 text        NOT NULL UNIQUE,
  price               integer     NOT NULL DEFAULT 0,
  compare_at_price    integer,
  weight_grams        integer,
  allow_made_to_order boolean     NOT NULL DEFAULT false,
  lead_time_days      integer,
  is_active           boolean     NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- variant_attribute_values ----------------------------------
CREATE TABLE variant_attribute_values (
  variant_id          uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  attribute_value_id  uuid NOT NULL REFERENCES attribute_values(id) ON DELETE CASCADE,
  PRIMARY KEY (variant_id, attribute_value_id)
);

-- product_collections ---------------------------------------
CREATE TABLE product_collections (
  product_id     uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  collection_id  uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, collection_id)
);

-- product_images --------------------------------------------
CREATE TABLE product_images (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    uuid        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id    uuid        REFERENCES product_variants(id) ON DELETE SET NULL,
  storage_path  text        NOT NULL,
  alt_text      text,
  sort_order    integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);
