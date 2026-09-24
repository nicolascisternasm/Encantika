# Glosario de base de datos — Encantika

Regla de idioma: código (TypeScript, archivos, variables) → inglés.
Base de datos (tablas, columnas, vistas, funciones SQL, valores de CHECK) → español, snake_case, sin tildes ni ñ.
`id` y `slug` se mantienen en todos los casos.

---

## Tablas

| Inglés (anterior)         | Español (vigente)           |
|---------------------------|-----------------------------|
| `profiles`                | `perfiles`                  |
| `store_settings`          | `configuracion_tienda`      |
| `categories`              | `categorias`                |
| `collections`             | `colecciones`               |
| `attributes`              | `atributos`                 |
| `attribute_values`        | `valores_atributo`          |
| `products`                | `productos`                 |
| `product_attributes`      | `producto_atributos`        |
| `product_variants`        | `variantes_producto`        |
| `variant_attribute_values`| `variante_valores_atributo` |
| `product_collections`     | `producto_colecciones`      |
| `product_images`          | `imagenes_producto`         |
| `inventory_movements`     | `movimientos_inventario`    |
| `sales_channels`          | `canales_venta`             |
| `customers`               | `clientes`                  |
| `shipping_methods`        | `metodos_envio`             |
| `shipping_zones`          | `zonas_envio`               |
| `orders`                  | `pedidos`                   |
| `order_items`             | `detalle_pedido`            |
| `order_status_history`    | `historial_estados_pedido`  |
| `payments`                | `pagos`                     |

## Vistas

| Inglés              | Español           |
|---------------------|-------------------|
| `variant_stock`     | `stock_variantes` |

## Funciones SQL

| Inglés                       | Español                              |
|------------------------------|--------------------------------------|
| `update_updated_at()`        | `actualizar_actualizado_en()`        |
| `is_admin()`                 | `es_admin()`                         |
| `inventory_movements_immutable()` | `movimientos_inventario_inmutable()` |
| `get_variant_availability()` | `obtener_disponibilidad_variantes()` |
| `limpiar_datos_prueba()`     | `limpiar_datos_prueba()` *(sin cambio)* |

## Variables de sesión

| Inglés                      | Español                       |
|-----------------------------|-------------------------------|
| `app.cleanup_test_data`     | `app.limpieza_datos_prueba`   |

## Secuencias

| Inglés              | Español                 |
|---------------------|-------------------------|
| `order_number_seq`  | `pedidos_numero_seq`    |

## Buckets de Storage

| Inglés            | Español               |
|-------------------|-----------------------|
| `product-images`  | `imagenes-productos`  |

---

## Columnas por tabla

### perfiles
| Inglés       | Español          |
|--------------|------------------|
| `id`         | `id`             |
| `full_name`  | `nombre_completo`|
| `role`       | `rol`            |
| `created_at` | `creado_en`      |

### configuracion_tienda
| Inglés                 | Español                |
|------------------------|------------------------|
| `id`                   | `id`                   |
| `store_name`           | `nombre_tienda`        |
| `logo_url`             | `url_logo`             |
| `currency`             | `moneda`               |
| `whatsapp_number`      | `numero_whatsapp`      |
| `instagram_url`        | `url_instagram`        |
| `mercadolibre_url`     | `url_mercadolibre`     |
| `contact_email`        | `email_contacto`       |
| `pickup_address`       | `direccion_retiro`     |
| `pickup_instructions`  | `instrucciones_retiro` |
| `updated_at`           | `actualizado_en`       |

### categorias
| Inglés       | Español              |
|--------------|----------------------|
| `id`         | `id`                 |
| `name`       | `nombre`             |
| `slug`       | `slug`               |
| `parent_id`  | `categoria_padre_id` |
| `image_url`  | `url_imagen`         |
| `sort_order` | `orden`              |
| `is_active`  | `activo`             |
| `created_at` | `creado_en`          |
| `updated_at` | `actualizado_en`     |

### colecciones
| Inglés        | Español          |
|---------------|------------------|
| `id`          | `id`             |
| `name`        | `nombre`         |
| `slug`        | `slug`           |
| `description` | `descripcion`    |
| `image_url`   | `url_imagen`     |
| `is_active`   | `activo`         |
| `sort_order`  | `orden`          |
| `created_at`  | `creado_en`      |
| `updated_at`  | `actualizado_en` |

### atributos
| Inglés       | Español     |
|--------------|-------------|
| `id`         | `id`        |
| `name`       | `nombre`    |
| `code`       | `codigo`    |
| `sort_order` | `orden`     |
| `created_at` | `creado_en` |

### valores_atributo
| Inglés         | Español       |
|----------------|---------------|
| `id`           | `id`          |
| `attribute_id` | `atributo_id` |
| `value`        | `valor`       |
| `slug`         | `slug`        |
| `hex_color`    | `color_hex`   |
| `sort_order`   | `orden`       |
| `is_active`    | `activo`      |
| `created_at`   | `creado_en`   |

### productos
| Inglés                    | Español                 |
|---------------------------|-------------------------|
| `id`                      | `id`                    |
| `name`                    | `nombre`                |
| `slug`                    | `slug`                  |
| `description`             | `descripcion`           |
| `category_id`             | `categoria_id`          |
| `base_price`              | `precio_base`           |
| `compare_at_price`        | `precio_comparacion`    |
| `status`                  | `estado`                |
| `is_featured`             | `destacado`             |
| `default_lead_time_days`  | `dias_tiempo_produccion`|
| `seo_title`               | `titulo_seo`            |
| `seo_description`         | `descripcion_seo`       |
| `created_at`              | `creado_en`             |
| `updated_at`              | `actualizado_en`        |

### producto_atributos
| Inglés         | Español       |
|----------------|---------------|
| `product_id`   | `producto_id` |
| `attribute_id` | `atributo_id` |

### variantes_producto
| Inglés                   | Español                  |
|--------------------------|--------------------------|
| `id`                     | `id`                     |
| `product_id`             | `producto_id`            |
| `sku`                    | `sku`                    |
| `price`                  | `precio`                 |
| `compare_at_price`       | `precio_comparacion`     |
| `weight_grams`           | `peso_gramos`            |
| `allow_made_to_order`    | `permite_a_pedido`       |
| `lead_time_days`         | `dias_tiempo_produccion` |
| `is_active`              | `activo`                 |
| `created_at`             | `creado_en`              |
| `updated_at`             | `actualizado_en`         |

### variante_valores_atributo
| Inglés               | Español            |
|----------------------|--------------------|
| `variant_id`         | `variante_id`      |
| `attribute_value_id` | `valor_atributo_id`|

### producto_colecciones
| Inglés          | Español        |
|-----------------|----------------|
| `product_id`    | `producto_id`  |
| `collection_id` | `coleccion_id` |

### imagenes_producto
| Inglés           | Español                  |
|------------------|--------------------------|
| `id`             | `id`                     |
| `product_id`     | `producto_id`            |
| `variant_id`     | `variante_id`            |
| `storage_path`   | `ruta_almacenamiento`    |
| `alt_text`       | `texto_alt`              |
| `sort_order`     | `orden`                  |
| `created_at`     | `creado_en`              |

### movimientos_inventario
| Inglés       | Español        |
|--------------|----------------|
| `id`         | `id`           |
| `variant_id` | `variante_id`  |
| `quantity`   | `cantidad`     |
| `type`       | `tipo`         |
| `order_id`   | `pedido_id`    |
| `note`       | `nota`         |
| `created_by` | `creado_por`   |
| `created_at` | `creado_en`    |

### canales_venta
| Inglés       | Español     |
|--------------|-------------|
| `id`         | `id`        |
| `code`       | `codigo`    |
| `name`       | `nombre`    |
| `is_active`  | `activo`    |
| `created_at` | `creado_en` |

### clientes
| Inglés       | Español          |
|--------------|------------------|
| `id`         | `id`             |
| `full_name`  | `nombre_completo`|
| `email`      | `email`          |
| `phone`      | `telefono`       |
| `notes`      | `notas`          |
| `created_at` | `creado_en`      |
| `updated_at` | `actualizado_en` |

### metodos_envio
| Inglés       | Español          |
|--------------|------------------|
| `id`         | `id`             |
| `name`       | `nombre`         |
| `type`       | `tipo`           |
| `flat_price` | `precio_fijo`    |
| `is_active`  | `activo`         |
| `sort_order` | `orden`          |
| `created_at` | `creado_en`      |
| `updated_at` | `actualizado_en` |

### zonas_envio
| Inglés               | Español            |
|----------------------|--------------------|
| `id`                 | `id`               |
| `shipping_method_id` | `metodo_envio_id`  |
| `name`               | `nombre`           |
| `locations`          | `localidades`      |
| `price`              | `precio`           |
| `estimated_days`     | `dias_estimados`   |
| `is_active`          | `activo`           |
| `created_at`         | `creado_en`        |
| `updated_at`         | `actualizado_en`   |

### pedidos
| Inglés               | Español            |
|----------------------|--------------------|
| `id`                 | `id`               |
| `order_number`       | `numero_pedido`    |
| `channel_id`         | `canal_id`         |
| `customer_id`        | `cliente_id`       |
| `status`             | `estado`           |
| `payment_status`     | `estado_pago`      |
| `subtotal`           | `subtotal`         |
| `shipping_cost`      | `costo_envio`      |
| `discount_total`     | `descuento_total`  |
| `total`              | `total`            |
| `amount_paid`        | `monto_pagado`     |
| `shipping_method_id` | `metodo_envio_id`  |
| `shipping_zone_id`   | `zona_envio_id`    |
| `shipping_address`   | `direccion_envio`  |
| `customer_notes`     | `notas_cliente`    |
| `internal_notes`     | `notas_internas`   |
| `created_by`         | `creado_por`       |
| `created_at`         | `creado_en`        |
| `updated_at`         | `actualizado_en`   |

### detalle_pedido
| Inglés                 | Español                 |
|------------------------|-------------------------|
| `id`                   | `id`                    |
| `order_id`             | `pedido_id`             |
| `variant_id`           | `variante_id`           |
| `item_type`            | `tipo_item`             |
| `product_name`         | `nombre_producto`       |
| `variant_label`        | `etiqueta_variante`     |
| `sku`                  | `sku`                   |
| `unit_price`           | `precio_unitario`       |
| `quantity`             | `cantidad`              |
| `line_total`           | `total_linea`           |
| `configuration`        | `configuracion`         |
| `production_status`    | `estado_produccion`     |
| `estimated_ready_date` | `fecha_estimada_listo`  |
| `preview_image_path`   | `ruta_imagen_preview`   |
| `created_at`           | `creado_en`             |
| `updated_at`           | `actualizado_en`        |

### historial_estados_pedido
| Inglés        | Español          |
|---------------|------------------|
| `id`          | `id`             |
| `order_id`    | `pedido_id`      |
| `from_status` | `estado_anterior`|
| `to_status`   | `estado_nuevo`   |
| `changed_by`  | `cambiado_por`   |
| `note`        | `nota`           |
| `created_at`  | `creado_en`      |

### pagos
| Inglés               | Español             |
|----------------------|---------------------|
| `id`                 | `id`                |
| `order_id`           | `pedido_id`         |
| `provider`           | `proveedor`         |
| `provider_payment_id`| `id_pago_proveedor` |
| `status`             | `estado`            |
| `amount`             | `monto`             |
| `raw_payload`        | `datos_crudos`      |
| `created_at`         | `creado_en`         |
| `updated_at`         | `actualizado_en`    |

---

## Valores de CHECK constraints

### perfiles.rol
| Inglés    | Español       |
|-----------|---------------|
| `owner`   | `propietario` |
| `staff`   | `colaborador` |

### productos.estado
| Inglés     | Español     |
|------------|-------------|
| `draft`    | `borrador`  |
| `active`   | `activo`    |
| `archived` | `archivado` |

### canales_venta.codigo
| Inglés      | Español      |
|-------------|--------------|
| `web`       | `web`        |
| `instagram` | `instagram`  |
| `mercadolibre` | `mercadolibre` |
| `whatsapp`  | `whatsapp`   |
| `in_person` | `presencial` |

### metodos_envio.tipo
| Inglés   | Español       |
|----------|---------------|
| `flat`   | `tarifa_fija` |
| `zone`   | `por_zona`    |
| `pickup` | `retiro`      |

### movimientos_inventario.tipo
| Inglés       | Español      |
|--------------|--------------|
| `purchase`   | `compra`     |
| `sale`       | `venta`      |
| `adjustment` | `ajuste`     |
| `return`     | `devolucion` |

### pedidos.estado
| Inglés            | Español           |
|-------------------|-------------------|
| `pending_payment` | `pendiente_pago`  |
| `paid`            | `pagado`          |
| `in_production`   | `en_produccion`   |
| `ready`           | `listo`           |
| `shipped`         | `enviado`         |
| `delivered`       | `entregado`       |
| `cancelled`       | `cancelado`       |
| `refunded`        | `reembolsado`     |

### pedidos.estado_pago
| Inglés    | Español       |
|-----------|---------------|
| `unpaid`  | `sin_pagar`   |
| `partial` | `parcial`     |
| `paid`    | `pagado`      |
| `refunded`| `reembolsado` |

### detalle_pedido.tipo_item
| Inglés           | Español        |
|------------------|----------------|
| `stock`          | `stock`        |
| `made_to_order`  | `a_pedido`     |
| `custom`         | `personalizado`|

### detalle_pedido.estado_produccion
| Inglés           | Español          |
|------------------|------------------|
| `not_required`   | `no_requiere`    |
| `pending`        | `pendiente`      |
| `in_production`  | `en_produccion`  |
| `ready`          | `listo`          |

### pagos.proveedor
| Inglés         | Español        |
|----------------|----------------|
| `mercadopago`  | `mercadopago`  |
| `transfer`     | `transferencia`|
| `cash`         | `efectivo`     |
| `mercadolibre` | `mercadolibre` |

---

## Vista stock_variantes

| Columna      | Tipo    | Descripcion                                     |
|--------------|---------|-------------------------------------------------|
| `variante_id`| uuid    | FK a `variantes_producto.id`                    |
| `stock`      | integer | Suma de `movimientos_inventario.cantidad`        |

## Funcion obtener_disponibilidad_variantes

Parametros: `variante_ids uuid[]`

| Columna de retorno  | Tipo    |
|---------------------|---------|
| `variante_id`       | uuid    |
| `en_stock`          | boolean |
| `stock_bajo`        | boolean |
| `permite_a_pedido`  | boolean |

---

## Fase 6 — Arma tu joya (pendiente de implementar)

Tablas previstas (ya en espanol segun la misma regla):

| Tabla                | Descripcion                         |
|----------------------|-------------------------------------|
| `plantillas_joya`    | Plantillas de producto personalizable|
| `pasos_plantilla`    | Pasos del configurador por plantilla |
| `componentes_joya`   | Componentes seleccionables por paso  |
| `imagenes_componente`| Imagenes de cada componente          |
| `opciones_piedra`    | Piedras disponibles por componente   |
| `precios_talla`      | Precios adicionales por talla        |
