# Diagrama ER — Encantika

```mermaid
erDiagram
  %% ── Auth (Supabase built-in) ──────────────────────────────
  auth_users {
    uuid id PK
  }

  %% ── Block 1: Admin & config ───────────────────────────────
  profiles {
    uuid id PK
    text full_name
    text role
    timestamptz created_at
  }
  store_settings {
    integer id PK
    text store_name
    text logo_url
    text currency
    text whatsapp_number
    text instagram_url
    text mercadolibre_url
    text contact_email
    text pickup_address
    text pickup_instructions
    timestamptz updated_at
  }

  %% ── Block 2: Catalog ──────────────────────────────────────
  categories {
    uuid id PK
    text name
    text slug
    uuid parent_id FK
    text image_url
    integer sort_order
    boolean is_active
    timestamptz created_at
    timestamptz updated_at
  }
  collections {
    uuid id PK
    text name
    text slug
    text description
    text image_url
    boolean is_active
    integer sort_order
    timestamptz created_at
    timestamptz updated_at
  }
  attributes {
    uuid id PK
    text name
    text code
    integer sort_order
    timestamptz created_at
  }
  attribute_values {
    uuid id PK
    uuid attribute_id FK
    text value
    text slug
    text hex_color
    integer sort_order
    boolean is_active
    timestamptz created_at
  }
  products {
    uuid id PK
    text name
    text slug
    text description
    uuid category_id FK
    integer base_price
    integer compare_at_price
    text status
    boolean is_featured
    integer default_lead_time_days
    text seo_title
    text seo_description
    timestamptz created_at
    timestamptz updated_at
  }
  product_attributes {
    uuid product_id FK
    uuid attribute_id FK
  }
  product_variants {
    uuid id PK
    uuid product_id FK
    text sku
    integer price
    integer compare_at_price
    integer weight_grams
    boolean allow_made_to_order
    integer lead_time_days
    boolean is_active
    timestamptz created_at
    timestamptz updated_at
  }
  variant_attribute_values {
    uuid variant_id FK
    uuid attribute_value_id FK
  }
  product_collections {
    uuid product_id FK
    uuid collection_id FK
  }
  product_images {
    uuid id PK
    uuid product_id FK
    uuid variant_id FK
    text storage_path
    text alt_text
    integer sort_order
    timestamptz created_at
  }

  %% ── Block 3: Inventory ────────────────────────────────────
  inventory_movements {
    uuid id PK
    uuid variant_id FK
    integer quantity
    text type
    uuid order_id FK
    text note
    uuid created_by
    timestamptz created_at
  }

  %% ── Block 4: Sales ────────────────────────────────────────
  sales_channels {
    uuid id PK
    text code
    text name
    boolean is_active
    timestamptz created_at
  }
  customers {
    uuid id PK
    text full_name
    text email
    text phone
    text notes
    timestamptz created_at
    timestamptz updated_at
  }
  shipping_methods {
    uuid id PK
    text name
    text type
    integer flat_price
    boolean is_active
    integer sort_order
    timestamptz created_at
    timestamptz updated_at
  }
  shipping_zones {
    uuid id PK
    uuid shipping_method_id FK
    text name
    text[] locations
    integer price
    integer estimated_days
    boolean is_active
    timestamptz created_at
    timestamptz updated_at
  }
  orders {
    uuid id PK
    text order_number
    uuid channel_id FK
    uuid customer_id FK
    text status
    text payment_status
    integer subtotal
    integer shipping_cost
    integer discount_total
    integer total
    integer amount_paid
    uuid shipping_method_id FK
    uuid shipping_zone_id FK
    jsonb shipping_address
    text customer_notes
    text internal_notes
    uuid created_by
    timestamptz created_at
    timestamptz updated_at
  }
  order_items {
    uuid id PK
    uuid order_id FK
    uuid variant_id FK
    text item_type
    text product_name
    text variant_label
    text sku
    integer unit_price
    integer quantity
    integer line_total
    jsonb configuration
    text production_status
    date estimated_ready_date
    timestamptz created_at
    timestamptz updated_at
  }
  order_status_history {
    uuid id PK
    uuid order_id FK
    text from_status
    text to_status
    uuid changed_by
    text note
    timestamptz created_at
  }
  payments {
    uuid id PK
    uuid order_id FK
    text provider
    text provider_payment_id
    text status
    integer amount
    jsonb raw_payload
    timestamptz created_at
    timestamptz updated_at
  }

  %% ── Relationships ─────────────────────────────────────────
  auth_users       ||--o| profiles                  : "has profile"

  categories       ||--o{ categories                : "parent"
  categories       ||--o{ products                  : "contains"

  attributes       ||--o{ attribute_values          : "has values"
  attributes       ||--o{ product_attributes        : "used by"
  attribute_values ||--o{ variant_attribute_values  : "assigned to"

  products         ||--o{ product_attributes        : "has"
  products         ||--o{ product_variants          : "has"
  products         ||--o{ product_collections       : "in"
  products         ||--o{ product_images            : "has"

  product_variants ||--o{ variant_attribute_values  : "has"
  product_variants ||--o{ product_images            : "has"
  product_variants ||--o{ inventory_movements       : "tracks"
  product_variants ||--o{ order_items               : "ordered as"

  collections      ||--o{ product_collections       : "contains"

  sales_channels   ||--o{ orders                    : "sourced from"
  customers        ||--o{ orders                    : "places"

  shipping_methods ||--o{ shipping_zones            : "has zones"
  shipping_methods ||--o{ orders                    : "used by"
  shipping_zones   ||--o{ orders                    : "used by"

  orders           ||--o{ order_items               : "contains"
  orders           ||--o{ order_status_history      : "tracks"
  orders           ||--o{ payments                  : "paid via"
  orders           ||--o{ inventory_movements       : "triggers"
```

## Notas

| Tabla | Notas especiales |
|-------|-----------------|
| `store_settings` | Fila singleton forzada por `CHECK (id = 1)` |
| `inventory_movements` | Ledger inmutable — reglas PostgreSQL bloquean UPDATE y DELETE |
| `variant_stock` | Vista que suma `quantity` de `inventory_movements` por variante |
| `orders.order_number` | Generado por secuencia SQL (`JY-000001` en adelante) |
| Precios | Todos en `integer` (centavos CLP — e.g. `3990` = $3.990) |
| `is_admin()` | Función `SECURITY DEFINER` usada en todas las políticas RLS |
