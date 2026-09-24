-- ============================================================
-- Block 5 (continued): Storage bucket for product images
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760,  -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Public read (anyone can read files)
CREATE POLICY "public_read_product_images_storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Only admins can upload/update/delete
CREATE POLICY "admin_insert_product_images_storage" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "admin_update_product_images_storage" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "admin_delete_product_images_storage" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND is_admin());
