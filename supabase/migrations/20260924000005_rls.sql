-- ============================================================
-- Block 5: Row Level Security on ALL tables
-- ============================================================

-- Enable RLS ------------------------------------------------
ALTER TABLE profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories              ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections             ENABLE ROW LEVEL SECURITY;
ALTER TABLE attributes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE attribute_values        ENABLE ROW LEVEL SECURITY;
ALTER TABLE products                ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_attributes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants        ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collections     ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images          ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_channels          ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers               ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_methods        ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_zones          ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history    ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments                ENABLE ROW LEVEL SECURITY;

-- ── PUBLIC READ (anon) ──────────────────────────────────────

-- store_settings
CREATE POLICY "public_read_store_settings" ON store_settings
  FOR SELECT USING (true);

-- categories (active only)
CREATE POLICY "public_read_active_categories" ON categories
  FOR SELECT USING (is_active = true);

-- collections (active only)
CREATE POLICY "public_read_active_collections" ON collections
  FOR SELECT USING (is_active = true);

-- attributes
CREATE POLICY "public_read_attributes" ON attributes
  FOR SELECT USING (true);

-- attribute_values (active only)
CREATE POLICY "public_read_active_attribute_values" ON attribute_values
  FOR SELECT USING (is_active = true);

-- sales_channels (active only)
CREATE POLICY "public_read_active_sales_channels" ON sales_channels
  FOR SELECT USING (is_active = true);

-- shipping_methods (active only)
CREATE POLICY "public_read_active_shipping_methods" ON shipping_methods
  FOR SELECT USING (is_active = true);

-- shipping_zones (active only)
CREATE POLICY "public_read_active_shipping_zones" ON shipping_zones
  FOR SELECT USING (is_active = true);

-- products (active only)
CREATE POLICY "public_read_active_products" ON products
  FOR SELECT USING (status = 'active');

-- product_attributes (for active products)
CREATE POLICY "public_read_product_attributes" ON product_attributes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM products p WHERE p.id = product_attributes.product_id AND p.status = 'active')
  );

-- product_variants (active variants of active products)
CREATE POLICY "public_read_active_product_variants" ON product_variants
  FOR SELECT USING (
    is_active = true
    AND EXISTS (SELECT 1 FROM products p WHERE p.id = product_variants.product_id AND p.status = 'active')
  );

-- variant_attribute_values
CREATE POLICY "public_read_variant_attribute_values" ON variant_attribute_values
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM product_variants pv
      JOIN products p ON p.id = pv.product_id
      WHERE pv.id = variant_attribute_values.variant_id
        AND pv.is_active = true
        AND p.status = 'active'
    )
  );

-- product_collections
CREATE POLICY "public_read_product_collections" ON product_collections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM products p WHERE p.id = product_collections.product_id AND p.status = 'active')
    AND EXISTS (SELECT 1 FROM collections c WHERE c.id = product_collections.collection_id AND c.is_active = true)
  );

-- product_images
CREATE POLICY "public_read_product_images" ON product_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM products p WHERE p.id = product_images.product_id AND p.status = 'active')
  );

-- ── ADMIN FULL ACCESS ───────────────────────────────────────

-- profiles: admins can read/write all profiles; users can read their own
CREATE POLICY "admin_all_profiles" ON profiles
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "self_read_profile" ON profiles
  FOR SELECT USING (id = auth.uid());

-- store_settings
CREATE POLICY "admin_write_store_settings" ON store_settings
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- categories
CREATE POLICY "admin_all_categories" ON categories
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- collections
CREATE POLICY "admin_all_collections" ON collections
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- attributes
CREATE POLICY "admin_all_attributes" ON attributes
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- attribute_values
CREATE POLICY "admin_all_attribute_values" ON attribute_values
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- products
CREATE POLICY "admin_all_products" ON products
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- product_attributes
CREATE POLICY "admin_all_product_attributes" ON product_attributes
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- product_variants
CREATE POLICY "admin_all_product_variants" ON product_variants
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- variant_attribute_values
CREATE POLICY "admin_all_variant_attribute_values" ON variant_attribute_values
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- product_collections
CREATE POLICY "admin_all_product_collections" ON product_collections
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- product_images
CREATE POLICY "admin_all_product_images" ON product_images
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- inventory_movements: admins only (immutability enforced by trigger in 000003)
CREATE POLICY "admin_all_inventory_movements" ON inventory_movements
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- sales_channels
CREATE POLICY "admin_all_sales_channels" ON sales_channels
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- customers
CREATE POLICY "admin_all_customers" ON customers
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- shipping_methods
CREATE POLICY "admin_all_shipping_methods" ON shipping_methods
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- shipping_zones
CREATE POLICY "admin_all_shipping_zones" ON shipping_zones
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- orders
CREATE POLICY "admin_all_orders" ON orders
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- order_items
CREATE POLICY "admin_all_order_items" ON order_items
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- order_status_history
CREATE POLICY "admin_all_order_status_history" ON order_status_history
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- payments
CREATE POLICY "admin_all_payments" ON payments
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
