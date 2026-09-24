-- ============================================================
-- Block 4: Sales channels, customers, shipping, orders
-- ============================================================

-- sales_channels --------------------------------------------
CREATE TABLE sales_channels (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  code       text        NOT NULL UNIQUE CHECK (code IN ('web', 'instagram', 'mercadolibre', 'whatsapp', 'in_person')),
  name       text        NOT NULL,
  is_active  boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- customers -------------------------------------------------
CREATE TABLE customers (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   text        NOT NULL,
  email       text,
  phone       text,
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX customers_email_idx ON customers (email);
CREATE INDEX customers_phone_idx ON customers (phone);

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- shipping_methods ------------------------------------------
CREATE TABLE shipping_methods (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  type        text        NOT NULL CHECK (type IN ('flat', 'zone', 'pickup')),
  flat_price  integer,
  is_active   boolean     NOT NULL DEFAULT true,
  sort_order  integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER shipping_methods_updated_at
  BEFORE UPDATE ON shipping_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- shipping_zones --------------------------------------------
CREATE TABLE shipping_zones (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  shipping_method_id  uuid        NOT NULL REFERENCES shipping_methods(id) ON DELETE CASCADE,
  name                text        NOT NULL,
  locations           text[]      NOT NULL DEFAULT '{}',
  price               integer     NOT NULL DEFAULT 0,
  estimated_days      integer,
  is_active           boolean     NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER shipping_zones_updated_at
  BEFORE UPDATE ON shipping_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Sequence for human-readable order numbers ----------------
CREATE SEQUENCE order_number_seq START 1;

-- orders ----------------------------------------------------
CREATE TABLE orders (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number      text        NOT NULL UNIQUE DEFAULT ('JY-' || LPAD(nextval('order_number_seq')::text, 6, '0')),
  channel_id        uuid        REFERENCES sales_channels(id) ON DELETE SET NULL,
  customer_id       uuid        REFERENCES customers(id) ON DELETE SET NULL,
  status            text        NOT NULL DEFAULT 'pending_payment'
                                CHECK (status IN ('pending_payment', 'paid', 'in_production', 'ready', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status    text        NOT NULL DEFAULT 'unpaid'
                                CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded')),
  subtotal          integer     NOT NULL DEFAULT 0,
  shipping_cost     integer     NOT NULL DEFAULT 0,
  discount_total    integer     NOT NULL DEFAULT 0,
  total             integer     NOT NULL DEFAULT 0,
  amount_paid       integer     NOT NULL DEFAULT 0,
  shipping_method_id uuid       REFERENCES shipping_methods(id) ON DELETE SET NULL,
  shipping_zone_id  uuid        REFERENCES shipping_zones(id) ON DELETE SET NULL,
  shipping_address  jsonb,
  customer_notes    text,
  internal_notes    text,
  created_by        uuid,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- order_items -----------------------------------------------
CREATE TABLE order_items (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            uuid        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id          uuid        REFERENCES product_variants(id) ON DELETE SET NULL,
  item_type           text        NOT NULL CHECK (item_type IN ('stock', 'made_to_order', 'custom')),
  product_name        text        NOT NULL,
  variant_label       text,
  sku                 text,
  unit_price          integer     NOT NULL DEFAULT 0,
  quantity            integer     NOT NULL DEFAULT 1,
  line_total          integer     NOT NULL DEFAULT 0,
  configuration       jsonb,
  production_status   text        NOT NULL DEFAULT 'not_required'
                                  CHECK (production_status IN ('not_required', 'pending', 'in_production', 'ready')),
  estimated_ready_date date,
  preview_image_path  text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER order_items_updated_at
  BEFORE UPDATE ON order_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- order_status_history (append-only) -----------------------
CREATE TABLE order_status_history (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     uuid        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status  text,
  to_status    text        NOT NULL,
  changed_by   uuid,
  note         text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- payments --------------------------------------------------
CREATE TABLE payments (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            uuid        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider            text        NOT NULL CHECK (provider IN ('mercadopago', 'transfer', 'cash', 'mercadolibre')),
  provider_payment_id text        UNIQUE,
  status              text        NOT NULL DEFAULT 'pending',
  amount              integer     NOT NULL DEFAULT 0,
  raw_payload         jsonb,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- FK from inventory_movements.order_id ----------------------
ALTER TABLE inventory_movements
  ADD CONSTRAINT inventory_movements_order_id_fkey
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;
