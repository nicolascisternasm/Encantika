export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      atributos: {
        Row: {
          codigo: string
          creado_en: string
          id: string
          nombre: string
          orden: number
        }
        Insert: {
          codigo: string
          creado_en?: string
          id?: string
          nombre: string
          orden?: number
        }
        Update: {
          codigo?: string
          creado_en?: string
          id?: string
          nombre?: string
          orden?: number
        }
        Relationships: []
      }
      canales_venta: {
        Row: {
          activo: boolean
          codigo: string
          creado_en: string
          id: string
          nombre: string
        }
        Insert: {
          activo?: boolean
          codigo: string
          creado_en?: string
          id?: string
          nombre: string
        }
        Update: {
          activo?: boolean
          codigo?: string
          creado_en?: string
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      categorias: {
        Row: {
          activo: boolean
          actualizado_en: string
          categoria_padre_id: string | null
          creado_en: string
          id: string
          nombre: string
          orden: number
          slug: string
          url_imagen: string | null
        }
        Insert: {
          activo?: boolean
          actualizado_en?: string
          categoria_padre_id?: string | null
          creado_en?: string
          id?: string
          nombre: string
          orden?: number
          slug: string
          url_imagen?: string | null
        }
        Update: {
          activo?: boolean
          actualizado_en?: string
          categoria_padre_id?: string | null
          creado_en?: string
          id?: string
          nombre?: string
          orden?: number
          slug?: string
          url_imagen?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categorias_categoria_padre_id_fkey"
            columns: ["categoria_padre_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          actualizado_en: string
          creado_en: string
          email: string | null
          id: string
          nombre_completo: string
          notas: string | null
          telefono: string | null
        }
        Insert: {
          actualizado_en?: string
          creado_en?: string
          email?: string | null
          id?: string
          nombre_completo: string
          notas?: string | null
          telefono?: string | null
        }
        Update: {
          actualizado_en?: string
          creado_en?: string
          email?: string | null
          id?: string
          nombre_completo?: string
          notas?: string | null
          telefono?: string | null
        }
        Relationships: []
      }
      colecciones: {
        Row: {
          activo: boolean
          actualizado_en: string
          creado_en: string
          descripcion: string | null
          id: string
          nombre: string
          orden: number
          slug: string
          url_imagen: string | null
        }
        Insert: {
          activo?: boolean
          actualizado_en?: string
          creado_en?: string
          descripcion?: string | null
          id?: string
          nombre: string
          orden?: number
          slug: string
          url_imagen?: string | null
        }
        Update: {
          activo?: boolean
          actualizado_en?: string
          creado_en?: string
          descripcion?: string | null
          id?: string
          nombre?: string
          orden?: number
          slug?: string
          url_imagen?: string | null
        }
        Relationships: []
      }
      configuracion_tienda: {
        Row: {
          actualizado_en: string
          direccion_retiro: string | null
          email_contacto: string | null
          historia: string | null
          id: number
          instrucciones_retiro: string | null
          moneda: string
          mostrar_historia: boolean
          nombre_tienda: string
          numero_whatsapp: string | null
          seo_descripcion: string | null
          seo_titulo: string | null
          url_instagram: string | null
          url_logo: string | null
          url_mercadolibre: string | null
        }
        Insert: {
          actualizado_en?: string
          direccion_retiro?: string | null
          email_contacto?: string | null
          historia?: string | null
          id: number
          instrucciones_retiro?: string | null
          moneda?: string
          mostrar_historia?: boolean
          nombre_tienda?: string
          numero_whatsapp?: string | null
          seo_descripcion?: string | null
          seo_titulo?: string | null
          url_instagram?: string | null
          url_logo?: string | null
          url_mercadolibre?: string | null
        }
        Update: {
          actualizado_en?: string
          direccion_retiro?: string | null
          email_contacto?: string | null
          historia?: string | null
          id?: number
          instrucciones_retiro?: string | null
          moneda?: string
          mostrar_historia?: boolean
          nombre_tienda?: string
          numero_whatsapp?: string | null
          seo_descripcion?: string | null
          seo_titulo?: string | null
          url_instagram?: string | null
          url_logo?: string | null
          url_mercadolibre?: string | null
        }
        Relationships: []
      }
      detalle_pedido: {
        Row: {
          actualizado_en: string
          cantidad: number
          configuracion: Json | null
          creado_en: string
          estado_produccion: string
          etiqueta_variante: string | null
          fecha_estimada_listo: string | null
          id: string
          nombre_producto: string
          pedido_id: string
          precio_unitario: number
          ruta_imagen_preview: string | null
          sku: string | null
          tipo_item: string
          total_linea: number
          variante_id: string | null
        }
        Insert: {
          actualizado_en?: string
          cantidad?: number
          configuracion?: Json | null
          creado_en?: string
          estado_produccion?: string
          etiqueta_variante?: string | null
          fecha_estimada_listo?: string | null
          id?: string
          nombre_producto: string
          pedido_id: string
          precio_unitario?: number
          ruta_imagen_preview?: string | null
          sku?: string | null
          tipo_item: string
          total_linea?: number
          variante_id?: string | null
        }
        Update: {
          actualizado_en?: string
          cantidad?: number
          configuracion?: Json | null
          creado_en?: string
          estado_produccion?: string
          etiqueta_variante?: string | null
          fecha_estimada_listo?: string | null
          id?: string
          nombre_producto?: string
          pedido_id?: string
          precio_unitario?: number
          ruta_imagen_preview?: string | null
          sku?: string | null
          tipo_item?: string
          total_linea?: number
          variante_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "detalle_pedido_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "detalle_pedido_variante_id_fkey"
            columns: ["variante_id"]
            isOneToOne: false
            referencedRelation: "variantes_producto"
            referencedColumns: ["id"]
          },
        ]
      }
      historial_estados_pedido: {
        Row: {
          cambiado_por: string | null
          creado_en: string
          estado_anterior: string | null
          estado_nuevo: string
          id: string
          nota: string | null
          pedido_id: string
        }
        Insert: {
          cambiado_por?: string | null
          creado_en?: string
          estado_anterior?: string | null
          estado_nuevo: string
          id?: string
          nota?: string | null
          pedido_id: string
        }
        Update: {
          cambiado_por?: string | null
          creado_en?: string
          estado_anterior?: string | null
          estado_nuevo?: string
          id?: string
          nota?: string | null
          pedido_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "historial_estados_pedido_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      imagenes_producto: {
        Row: {
          creado_en: string
          id: string
          orden: number
          producto_id: string
          ruta_almacenamiento: string
          texto_alt: string | null
          variante_id: string | null
        }
        Insert: {
          creado_en?: string
          id?: string
          orden?: number
          producto_id: string
          ruta_almacenamiento: string
          texto_alt?: string | null
          variante_id?: string | null
        }
        Update: {
          creado_en?: string
          id?: string
          orden?: number
          producto_id?: string
          ruta_almacenamiento?: string
          texto_alt?: string | null
          variante_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "imagenes_producto_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imagenes_producto_variante_id_fkey"
            columns: ["variante_id"]
            isOneToOne: false
            referencedRelation: "variantes_producto"
            referencedColumns: ["id"]
          },
        ]
      }
      metodos_envio: {
        Row: {
          activo: boolean
          actualizado_en: string
          creado_en: string
          id: string
          nombre: string
          orden: number
          precio_fijo: number | null
          tipo: string
        }
        Insert: {
          activo?: boolean
          actualizado_en?: string
          creado_en?: string
          id?: string
          nombre: string
          orden?: number
          precio_fijo?: number | null
          tipo: string
        }
        Update: {
          activo?: boolean
          actualizado_en?: string
          creado_en?: string
          id?: string
          nombre?: string
          orden?: number
          precio_fijo?: number | null
          tipo?: string
        }
        Relationships: []
      }
      movimientos_inventario: {
        Row: {
          cantidad: number
          creado_en: string
          creado_por: string | null
          id: string
          nota: string | null
          pedido_id: string | null
          tipo: string
          variante_id: string
        }
        Insert: {
          cantidad: number
          creado_en?: string
          creado_por?: string | null
          id?: string
          nota?: string | null
          pedido_id?: string | null
          tipo: string
          variante_id: string
        }
        Update: {
          cantidad?: number
          creado_en?: string
          creado_por?: string | null
          id?: string
          nota?: string | null
          pedido_id?: string | null
          tipo?: string
          variante_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_inventario_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_inventario_variante_id_fkey"
            columns: ["variante_id"]
            isOneToOne: false
            referencedRelation: "variantes_producto"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos: {
        Row: {
          actualizado_en: string
          creado_en: string
          datos_crudos: Json | null
          estado: string
          id: string
          id_pago_proveedor: string | null
          monto: number
          pedido_id: string
          proveedor: string
        }
        Insert: {
          actualizado_en?: string
          creado_en?: string
          datos_crudos?: Json | null
          estado?: string
          id?: string
          id_pago_proveedor?: string | null
          monto?: number
          pedido_id: string
          proveedor: string
        }
        Update: {
          actualizado_en?: string
          creado_en?: string
          datos_crudos?: Json | null
          estado?: string
          id?: string
          id_pago_proveedor?: string | null
          monto?: number
          pedido_id?: string
          proveedor?: string
        }
        Relationships: [
          {
            foreignKeyName: "pagos_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          actualizado_en: string
          canal_id: string | null
          cliente_id: string | null
          costo_envio: number
          creado_en: string
          creado_por: string | null
          descuento_total: number
          direccion_envio: Json | null
          estado: string
          estado_pago: string
          id: string
          metodo_envio_id: string | null
          monto_pagado: number
          notas_cliente: string | null
          notas_internas: string | null
          numero_pedido: string
          subtotal: number
          total: number
          zona_envio_id: string | null
        }
        Insert: {
          actualizado_en?: string
          canal_id?: string | null
          cliente_id?: string | null
          costo_envio?: number
          creado_en?: string
          creado_por?: string | null
          descuento_total?: number
          direccion_envio?: Json | null
          estado?: string
          estado_pago?: string
          id?: string
          metodo_envio_id?: string | null
          monto_pagado?: number
          notas_cliente?: string | null
          notas_internas?: string | null
          numero_pedido?: string
          subtotal?: number
          total?: number
          zona_envio_id?: string | null
        }
        Update: {
          actualizado_en?: string
          canal_id?: string | null
          cliente_id?: string | null
          costo_envio?: number
          creado_en?: string
          creado_por?: string | null
          descuento_total?: number
          direccion_envio?: Json | null
          estado?: string
          estado_pago?: string
          id?: string
          metodo_envio_id?: string | null
          monto_pagado?: number
          notas_cliente?: string | null
          notas_internas?: string | null
          numero_pedido?: string
          subtotal?: number
          total?: number
          zona_envio_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canales_venta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_metodo_envio_id_fkey"
            columns: ["metodo_envio_id"]
            isOneToOne: false
            referencedRelation: "metodos_envio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_zona_envio_id_fkey"
            columns: ["zona_envio_id"]
            isOneToOne: false
            referencedRelation: "zonas_envio"
            referencedColumns: ["id"]
          },
        ]
      }
      perfiles: {
        Row: {
          creado_en: string
          id: string
          nombre_completo: string | null
          rol: string
        }
        Insert: {
          creado_en?: string
          id: string
          nombre_completo?: string | null
          rol: string
        }
        Update: {
          creado_en?: string
          id?: string
          nombre_completo?: string | null
          rol?: string
        }
        Relationships: []
      }
      producto_atributos: {
        Row: {
          atributo_id: string
          producto_id: string
        }
        Insert: {
          atributo_id: string
          producto_id: string
        }
        Update: {
          atributo_id?: string
          producto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "producto_atributos_atributo_id_fkey"
            columns: ["atributo_id"]
            isOneToOne: false
            referencedRelation: "atributos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "producto_atributos_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      producto_colecciones: {
        Row: {
          coleccion_id: string
          producto_id: string
        }
        Insert: {
          coleccion_id: string
          producto_id: string
        }
        Update: {
          coleccion_id?: string
          producto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "producto_colecciones_coleccion_id_fkey"
            columns: ["coleccion_id"]
            isOneToOne: false
            referencedRelation: "colecciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "producto_colecciones_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      productos: {
        Row: {
          actualizado_en: string
          categoria_id: string | null
          creado_en: string
          descripcion: string | null
          descripcion_seo: string | null
          destacado: boolean
          dias_tiempo_produccion: number | null
          estado: string
          id: string
          nombre: string
          precio_base: number
          precio_comparacion: number | null
          slug: string
          titulo_seo: string | null
        }
        Insert: {
          actualizado_en?: string
          categoria_id?: string | null
          creado_en?: string
          descripcion?: string | null
          descripcion_seo?: string | null
          destacado?: boolean
          dias_tiempo_produccion?: number | null
          estado?: string
          id?: string
          nombre: string
          precio_base?: number
          precio_comparacion?: number | null
          slug: string
          titulo_seo?: string | null
        }
        Update: {
          actualizado_en?: string
          categoria_id?: string | null
          creado_en?: string
          descripcion?: string | null
          descripcion_seo?: string | null
          destacado?: boolean
          dias_tiempo_produccion?: number | null
          estado?: string
          id?: string
          nombre?: string
          precio_base?: number
          precio_comparacion?: number | null
          slug?: string
          titulo_seo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "productos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      valores_atributo: {
        Row: {
          activo: boolean
          atributo_id: string
          color_hex: string | null
          creado_en: string
          id: string
          orden: number
          slug: string
          valor: string
        }
        Insert: {
          activo?: boolean
          atributo_id: string
          color_hex?: string | null
          creado_en?: string
          id?: string
          orden?: number
          slug: string
          valor: string
        }
        Update: {
          activo?: boolean
          atributo_id?: string
          color_hex?: string | null
          creado_en?: string
          id?: string
          orden?: number
          slug?: string
          valor?: string
        }
        Relationships: [
          {
            foreignKeyName: "valores_atributo_atributo_id_fkey"
            columns: ["atributo_id"]
            isOneToOne: false
            referencedRelation: "atributos"
            referencedColumns: ["id"]
          },
        ]
      }
      variante_valores_atributo: {
        Row: {
          valor_atributo_id: string
          variante_id: string
        }
        Insert: {
          valor_atributo_id: string
          variante_id: string
        }
        Update: {
          valor_atributo_id?: string
          variante_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "variante_valores_atributo_valor_atributo_id_fkey"
            columns: ["valor_atributo_id"]
            isOneToOne: false
            referencedRelation: "valores_atributo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "variante_valores_atributo_variante_id_fkey"
            columns: ["variante_id"]
            isOneToOne: false
            referencedRelation: "variantes_producto"
            referencedColumns: ["id"]
          },
        ]
      }
      variantes_producto: {
        Row: {
          activo: boolean
          actualizado_en: string
          creado_en: string
          dias_tiempo_produccion: number | null
          id: string
          permite_a_pedido: boolean
          peso_gramos: number | null
          precio: number
          precio_comparacion: number | null
          producto_id: string
          sku: string
        }
        Insert: {
          activo?: boolean
          actualizado_en?: string
          creado_en?: string
          dias_tiempo_produccion?: number | null
          id?: string
          permite_a_pedido?: boolean
          peso_gramos?: number | null
          precio?: number
          precio_comparacion?: number | null
          producto_id: string
          sku: string
        }
        Update: {
          activo?: boolean
          actualizado_en?: string
          creado_en?: string
          dias_tiempo_produccion?: number | null
          id?: string
          permite_a_pedido?: boolean
          peso_gramos?: number | null
          precio?: number
          precio_comparacion?: number | null
          producto_id?: string
          sku?: string
        }
        Relationships: [
          {
            foreignKeyName: "variantes_producto_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      zonas_envio: {
        Row: {
          activo: boolean
          actualizado_en: string
          creado_en: string
          dias_estimados: number | null
          id: string
          localidades: string[]
          metodo_envio_id: string
          nombre: string
          precio: number
        }
        Insert: {
          activo?: boolean
          actualizado_en?: string
          creado_en?: string
          dias_estimados?: number | null
          id?: string
          localidades?: string[]
          metodo_envio_id: string
          nombre: string
          precio?: number
        }
        Update: {
          activo?: boolean
          actualizado_en?: string
          creado_en?: string
          dias_estimados?: number | null
          id?: string
          localidades?: string[]
          metodo_envio_id?: string
          nombre?: string
          precio?: number
        }
        Relationships: [
          {
            foreignKeyName: "zonas_envio_metodo_envio_id_fkey"
            columns: ["metodo_envio_id"]
            isOneToOne: false
            referencedRelation: "metodos_envio"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      stock_variantes: {
        Row: {
          stock: number | null
          variante_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_inventario_variante_id_fkey"
            columns: ["variante_id"]
            isOneToOne: false
            referencedRelation: "variantes_producto"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      es_admin: { Args: never; Returns: boolean }
      limpiar_datos_prueba: { Args: never; Returns: undefined }
      obtener_disponibilidad_variantes: {
        Args: { variante_ids: string[] }
        Returns: {
          en_stock: boolean
          permite_a_pedido: boolean
          stock_bajo: boolean
          variante_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
