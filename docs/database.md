# Diagrama ER — Encantika

```mermaid
erDiagram
  %% ── Auth (Supabase nativo) ─────────────────────────────────
  auth_users {
    uuid id PK
  }

  %% ── Bloque 1: Admin y configuracion ─────────────────────────
  perfiles {
    uuid id PK
    text nombre_completo
    text rol
    timestamptz creado_en
  }
  configuracion_tienda {
    integer id PK
    text nombre_tienda
    text url_logo
    text moneda
    text numero_whatsapp
    text url_instagram
    text url_mercadolibre
    text email_contacto
    text direccion_retiro
    text instrucciones_retiro
    timestamptz actualizado_en
  }

  %% ── Bloque 2: Catalogo ──────────────────────────────────────
  categorias {
    uuid id PK
    text nombre
    text slug
    uuid categoria_padre_id FK
    text url_imagen
    integer orden
    boolean activo
    timestamptz creado_en
    timestamptz actualizado_en
  }
  colecciones {
    uuid id PK
    text nombre
    text slug
    text descripcion
    text url_imagen
    boolean activo
    integer orden
    timestamptz creado_en
    timestamptz actualizado_en
  }
  atributos {
    uuid id PK
    text nombre
    text codigo
    integer orden
    timestamptz creado_en
  }
  valores_atributo {
    uuid id PK
    uuid atributo_id FK
    text valor
    text slug
    text color_hex
    integer orden
    boolean activo
    timestamptz creado_en
  }
  productos {
    uuid id PK
    text nombre
    text slug
    text descripcion
    uuid categoria_id FK
    integer precio_base
    integer precio_comparacion
    text estado
    boolean destacado
    integer dias_tiempo_produccion
    text titulo_seo
    text descripcion_seo
    timestamptz creado_en
    timestamptz actualizado_en
  }
  producto_atributos {
    uuid producto_id FK
    uuid atributo_id FK
  }
  variantes_producto {
    uuid id PK
    uuid producto_id FK
    text sku
    integer precio
    integer precio_comparacion
    integer peso_gramos
    boolean permite_a_pedido
    integer dias_tiempo_produccion
    boolean activo
    timestamptz creado_en
    timestamptz actualizado_en
  }
  variante_valores_atributo {
    uuid variante_id FK
    uuid valor_atributo_id FK
  }
  producto_colecciones {
    uuid producto_id FK
    uuid coleccion_id FK
  }
  imagenes_producto {
    uuid id PK
    uuid producto_id FK
    uuid variante_id FK
    text ruta_almacenamiento
    text texto_alt
    integer orden
    timestamptz creado_en
  }

  %% ── Bloque 3: Inventario ────────────────────────────────────
  movimientos_inventario {
    uuid id PK
    uuid variante_id FK
    integer cantidad
    text tipo
    uuid pedido_id FK
    text nota
    uuid creado_por
    timestamptz creado_en
  }

  %% ── Bloque 4: Ventas ────────────────────────────────────────
  canales_venta {
    uuid id PK
    text codigo
    text nombre
    boolean activo
    timestamptz creado_en
  }
  clientes {
    uuid id PK
    text nombre_completo
    text email
    text telefono
    text notas
    timestamptz creado_en
    timestamptz actualizado_en
  }
  metodos_envio {
    uuid id PK
    text nombre
    text tipo
    integer precio_fijo
    boolean activo
    integer orden
    timestamptz creado_en
    timestamptz actualizado_en
  }
  zonas_envio {
    uuid id PK
    uuid metodo_envio_id FK
    text nombre
    text[] localidades
    integer precio
    integer dias_estimados
    boolean activo
    timestamptz creado_en
    timestamptz actualizado_en
  }
  pedidos {
    uuid id PK
    text numero_pedido
    uuid canal_id FK
    uuid cliente_id FK
    text estado
    text estado_pago
    integer subtotal
    integer costo_envio
    integer descuento_total
    integer total
    integer monto_pagado
    uuid metodo_envio_id FK
    uuid zona_envio_id FK
    jsonb direccion_envio
    text notas_cliente
    text notas_internas
    uuid creado_por
    timestamptz creado_en
    timestamptz actualizado_en
  }
  detalle_pedido {
    uuid id PK
    uuid pedido_id FK
    uuid variante_id FK
    text tipo_item
    text nombre_producto
    text etiqueta_variante
    text sku
    integer precio_unitario
    integer cantidad
    integer total_linea
    jsonb configuracion
    text estado_produccion
    date fecha_estimada_listo
    text ruta_imagen_preview
    timestamptz creado_en
    timestamptz actualizado_en
  }
  historial_estados_pedido {
    uuid id PK
    uuid pedido_id FK
    text estado_anterior
    text estado_nuevo
    uuid cambiado_por
    text nota
    timestamptz creado_en
  }
  pagos {
    uuid id PK
    uuid pedido_id FK
    text proveedor
    text id_pago_proveedor
    text estado
    integer monto
    jsonb datos_crudos
    timestamptz creado_en
    timestamptz actualizado_en
  }

  %% ── Relaciones ─────────────────────────────────────────────
  auth_users               ||--o| perfiles                    : "tiene perfil"

  categorias               ||--o{ categorias                  : "padre"
  categorias               ||--o{ productos                   : "contiene"

  atributos                ||--o{ valores_atributo            : "tiene valores"
  atributos                ||--o{ producto_atributos          : "usado por"
  valores_atributo         ||--o{ variante_valores_atributo   : "asignado a"

  productos                ||--o{ producto_atributos          : "tiene"
  productos                ||--o{ variantes_producto          : "tiene"
  productos                ||--o{ producto_colecciones        : "en"
  productos                ||--o{ imagenes_producto           : "tiene"

  variantes_producto       ||--o{ variante_valores_atributo   : "tiene"
  variantes_producto       ||--o{ imagenes_producto           : "tiene"
  variantes_producto       ||--o{ movimientos_inventario      : "registra"
  variantes_producto       ||--o{ detalle_pedido              : "pedido como"

  colecciones              ||--o{ producto_colecciones        : "contiene"

  canales_venta            ||--o{ pedidos                     : "origen"
  clientes                 ||--o{ pedidos                     : "realiza"

  metodos_envio            ||--o{ zonas_envio                 : "tiene zonas"
  metodos_envio            ||--o{ pedidos                     : "usado en"
  zonas_envio              ||--o{ pedidos                     : "usado en"

  pedidos                  ||--o{ detalle_pedido              : "contiene"
  pedidos                  ||--o{ historial_estados_pedido    : "registra"
  pedidos                  ||--o{ pagos                       : "pagado via"
  pedidos                  ||--o{ movimientos_inventario      : "genera"
```

## Notas

| Tabla/Vista | Notas especiales |
|-------------|-----------------|
| `configuracion_tienda` | Fila singleton forzada por `CHECK (id = 1)` |
| `movimientos_inventario` | Ledger inmutable — trigger bloquea UPDATE y DELETE (bypass solo via `limpiar_datos_prueba()`) |
| `stock_variantes` | Vista con `security_invoker=true`; suma `cantidad` de `movimientos_inventario` por variante |
| `pedidos.numero_pedido` | Generado por secuencia SQL `pedidos_numero_seq` (`JY-000001` en adelante) |
| Precios | Todos en `integer` (CLP entero — e.g. `3990` = $3.990) |
| `es_admin()` | Funcion `SECURITY DEFINER` usada en todas las politicas RLS |
| `obtener_disponibilidad_variantes()` | `SECURITY DEFINER`; expone solo booleanos, nunca el stock exacto |
| `limpiar_datos_prueba()` | Solo ejecutable con `service_role`; usada por `scripts/test-rls.ts` |
