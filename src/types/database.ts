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
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          complement: string | null
          created_at: string
          id: string
          is_default: boolean
          neighborhood: string
          number: string
          postal_code: string
          profile_id: string
          recipient_name: string
          state: string
          street: string
        }
        Insert: {
          city: string
          complement?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          neighborhood: string
          number: string
          postal_code: string
          profile_id: string
          recipient_name: string
          state: string
          street: string
        }
        Update: {
          city?: string
          complement?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          neighborhood?: string
          number?: string
          postal_code?: string
          profile_id?: string
          recipient_name?: string
          state?: string
          street?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity: string
          entity_id: string
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity: string
          entity_id: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity?: string
          entity_id?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          customization: Json | null
          id: string
          product_id: string
          quantity: number
        }
        Insert: {
          cart_id: string
          created_at?: string
          customization?: Json | null
          id?: string
          product_id: string
          quantity?: number
        }
        Update: {
          cart_id?: string
          created_at?: string
          customization?: Json | null
          id?: string
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string
          id: string
          profile_id: string | null
          session_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id?: string | null
          session_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string | null
          session_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "carts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          access_count: number
          created_at: string
          description: string | null
          icon_name: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          access_count?: number
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          access_count?: number
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_discount_cents: number | null
          min_subtotal_cents: number
          starts_at: string | null
          updated_at: string
          usage_limit: number | null
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_discount_cents?: number | null
          min_subtotal_cents?: number
          starts_at?: string | null
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_discount_cents?: number | null
          min_subtotal_cents?: number
          starts_at?: string | null
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
        }
        Relationships: []
      }
      home_slides: {
        Row: {
          badge_text: string | null
          bg_theme: string
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          primary_button_text: string | null
          primary_button_url: string | null
          secondary_button_text: string | null
          secondary_button_url: string | null
          slide_type: string
          sort_order: number
          subtitle: string | null
          title: string
          title_highlight: string | null
          updated_at: string
        }
        Insert: {
          badge_text?: string | null
          bg_theme?: string
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          primary_button_text?: string | null
          primary_button_url?: string | null
          secondary_button_text?: string | null
          secondary_button_url?: string | null
          slide_type?: string
          sort_order?: number
          subtitle?: string | null
          title: string
          title_highlight?: string | null
          updated_at?: string
        }
        Update: {
          badge_text?: string | null
          bg_theme?: string
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          primary_button_text?: string | null
          primary_button_url?: string | null
          secondary_button_text?: string | null
          secondary_button_url?: string | null
          slide_type?: string
          sort_order?: number
          subtitle?: string | null
          title?: string
          title_highlight?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          customization: Json | null
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          sku: string
          subtotal_cents: number
          unit_price_cents: number
        }
        Insert: {
          created_at?: string
          customization?: Json | null
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          sku: string
          subtotal_cents: number
          unit_price_cents: number
        }
        Update: {
          created_at?: string
          customization?: Json | null
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          sku?: string
          subtotal_cents?: number
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          coupon_code: string | null
          created_at: string
          customer_id: string | null
          discount_cents: number
          id: string
          label_generated: boolean
          label_generated_at: string | null
          notes: string | null
          order_number: string
          shipping_address: Json
          shipping_cents: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal_cents: number
          total_cents: number
          updated_at: string
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string
          customer_id?: string | null
          discount_cents?: number
          id?: string
          label_generated?: boolean
          label_generated_at?: string | null
          notes?: string | null
          order_number: string
          shipping_address: Json
          shipping_cents?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_cents: number
          total_cents: number
          updated_at?: string
        }
        Update: {
          coupon_code?: string | null
          created_at?: string
          customer_id?: string | null
          discount_cents?: number
          id?: string
          label_generated?: boolean
          label_generated_at?: string | null
          notes?: string | null
          order_number?: string
          shipping_address?: Json
          shipping_cents?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_cents?: number
          total_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          event_id: string
          event_type: string
          gateway: string
          id: string
          payload: Json
          processed_at: string
        }
        Insert: {
          event_id: string
          event_type: string
          gateway: string
          id?: string
          payload: Json
          processed_at?: string
        }
        Update: {
          event_id?: string
          event_type?: string
          gateway?: string
          id?: string
          payload?: Json
          processed_at?: string
        }
        Relationships: []
      }
      payment_gateways: {
        Row: {
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          gateway: string
          gateway_payment_id: string | null
          id: string
          metadata: Json | null
          order_id: string
          payment_method: string | null
          qr_code: string | null
          qr_code_base64: string | null
          status: Database["public"]["Enums"]["payment_status"]
          ticket_url: string | null
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          gateway?: string
          gateway_payment_id?: string | null
          id?: string
          metadata?: Json | null
          order_id: string
          payment_method?: string | null
          qr_code?: string | null
          qr_code_base64?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          ticket_url?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          gateway?: string
          gateway_payment_id?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string
          payment_method?: string | null
          qr_code?: string | null
          qr_code_base64?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          ticket_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string
          created_at: string
          height: number | null
          id: string
          is_primary: boolean
          product_id: string
          public_url: string
          sort_order: number
          storage_path: string
          width: number | null
        }
        Insert: {
          alt_text?: string
          created_at?: string
          height?: number | null
          id?: string
          is_primary?: boolean
          product_id: string
          public_url: string
          sort_order?: number
          storage_path: string
          width?: number | null
        }
        Update: {
          alt_text?: string
          created_at?: string
          height?: number | null
          id?: string
          is_primary?: boolean
          product_id?: string
          public_url?: string
          sort_order?: number
          storage_path?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          colors: string[] | null
          created_at: string
          description: string | null
          featured: boolean
          has_colors: boolean
          has_sizes: boolean
          id: string
          name: string
          price_cents: number
          sale_price_cents: number | null
          short_description: string | null
          sizes: string[] | null
          sku: string
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          stock: number
          updated_at: string
          weight_grams: number | null
        }
        Insert: {
          category_id?: string | null
          colors?: string[] | null
          created_at?: string
          description?: string | null
          featured?: boolean
          has_colors?: boolean
          has_sizes?: boolean
          id?: string
          name: string
          price_cents: number
          sale_price_cents?: number | null
          short_description?: string | null
          sizes?: string[] | null
          sku: string
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          stock?: number
          updated_at?: string
          weight_grams?: number | null
        }
        Update: {
          category_id?: string | null
          colors?: string[] | null
          created_at?: string
          description?: string | null
          featured?: boolean
          has_colors?: boolean
          has_sizes?: boolean
          id?: string
          name?: string
          price_cents?: number
          sale_price_cents?: number | null
          short_description?: string | null
          sizes?: string[] | null
          sku?: string
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          stock?: number
          updated_at?: string
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cpf: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          email: string
          full_name?: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          announcement_banner_active: boolean
          announcement_banner_text: string | null
          brand_features_badge: string | null
          brand_features_cards: Json | null
          brand_features_subtitle: string | null
          brand_features_title: string | null
          canonical_url: string | null
          cnpj: string | null
          contact_page_settings: Json | null
          daily_deals_active: boolean
          daily_deals_bg_color: string | null
          daily_deals_discount_percent: number
          daily_deals_product_limit: number
          daily_deals_title: string | null
          editorial_banner_active: boolean | null
          editorial_banner_badge: string | null
          editorial_banner_button_link: string | null
          editorial_banner_button_text: string | null
          editorial_banner_coupon_active: boolean | null
          editorial_banner_coupon_code: string | null
          editorial_banner_coupon_text: string | null
          editorial_banner_description: string | null
          editorial_banner_image_subtitle: string | null
          editorial_banner_image_tag: string | null
          editorial_banner_image_title: string | null
          editorial_banner_image_url: string | null
          editorial_banner_title: string | null
          editorial_banner_whatsapp_button_text: string | null
          favicon_url: string | null
          footer_text: string | null
          free_shipping_threshold_cents: number
          id: string
          instagram_handle: string | null
          logo_url: string | null
          maintenance_message: string | null
          maintenance_mode: boolean
          meta_description: string | null
          meta_title: string | null
          og_image_url: string | null
          privacy_page_settings: Json | null
          seo_keywords: string | null
          store_description: string | null
          store_name: string
          store_tagline: string | null
          support_email: string | null
          support_hours: string | null
          support_phone: string | null
          terms_page_settings: Json | null
          updated_at: string
        }
        Insert: {
          announcement_banner_active?: boolean
          announcement_banner_text?: string | null
          brand_features_badge?: string | null
          brand_features_cards?: Json | null
          brand_features_subtitle?: string | null
          brand_features_title?: string | null
          canonical_url?: string | null
          cnpj?: string | null
          contact_page_settings?: Json | null
          daily_deals_active?: boolean
          daily_deals_bg_color?: string | null
          daily_deals_discount_percent?: number
          daily_deals_product_limit?: number
          daily_deals_title?: string | null
          editorial_banner_active?: boolean | null
          editorial_banner_badge?: string | null
          editorial_banner_button_link?: string | null
          editorial_banner_button_text?: string | null
          editorial_banner_coupon_active?: boolean | null
          editorial_banner_coupon_code?: string | null
          editorial_banner_coupon_text?: string | null
          editorial_banner_description?: string | null
          editorial_banner_image_subtitle?: string | null
          editorial_banner_image_tag?: string | null
          editorial_banner_image_title?: string | null
          editorial_banner_image_url?: string | null
          editorial_banner_title?: string | null
          editorial_banner_whatsapp_button_text?: string | null
          favicon_url?: string | null
          footer_text?: string | null
          free_shipping_threshold_cents?: number
          id?: string
          instagram_handle?: string | null
          logo_url?: string | null
          maintenance_message?: string | null
          maintenance_mode?: boolean
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          privacy_page_settings?: Json | null
          seo_keywords?: string | null
          store_description?: string | null
          store_name?: string
          store_tagline?: string | null
          support_email?: string | null
          support_hours?: string | null
          support_phone?: string | null
          terms_page_settings?: Json | null
          updated_at?: string
        }
        Update: {
          announcement_banner_active?: boolean
          announcement_banner_text?: string | null
          brand_features_badge?: string | null
          brand_features_cards?: Json | null
          brand_features_subtitle?: string | null
          brand_features_title?: string | null
          canonical_url?: string | null
          cnpj?: string | null
          contact_page_settings?: Json | null
          daily_deals_active?: boolean
          daily_deals_bg_color?: string | null
          daily_deals_discount_percent?: number
          daily_deals_product_limit?: number
          daily_deals_title?: string | null
          editorial_banner_active?: boolean | null
          editorial_banner_badge?: string | null
          editorial_banner_button_link?: string | null
          editorial_banner_button_text?: string | null
          editorial_banner_coupon_active?: boolean | null
          editorial_banner_coupon_code?: string | null
          editorial_banner_coupon_text?: string | null
          editorial_banner_description?: string | null
          editorial_banner_image_subtitle?: string | null
          editorial_banner_image_tag?: string | null
          editorial_banner_image_title?: string | null
          editorial_banner_image_url?: string | null
          editorial_banner_title?: string | null
          editorial_banner_whatsapp_button_text?: string | null
          favicon_url?: string | null
          footer_text?: string | null
          free_shipping_threshold_cents?: number
          id?: string
          instagram_handle?: string | null
          logo_url?: string | null
          maintenance_message?: string | null
          maintenance_mode?: boolean
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          privacy_page_settings?: Json | null
          seo_keywords?: string | null
          store_description?: string | null
          store_name?: string
          store_tagline?: string | null
          support_email?: string | null
          support_hours?: string | null
          support_phone?: string | null
          terms_page_settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_create_customer: {
        Args: {
          p_cpf?: string
          p_email: string
          p_full_name: string
          p_password: string
          p_phone?: string
          p_role?: string
        }
        Returns: Json
      }
      admin_update_customer: {
        Args: {
          p_cpf?: string
          p_email: string
          p_full_name: string
          p_password?: string
          p_phone?: string
          p_role?: string
          p_user_id: string
        }
        Returns: Json
      }
      create_quick_whatsapp_order:
        | {
            Args: {
              p_customer_name?: string
              p_customer_phone?: string
              p_product_id: string
              p_quantity?: number
            }
            Returns: Json
          }
        | {
            Args: {
              p_customer_name?: string
              p_customer_phone?: string
              p_customization?: Json
              p_product_id: string
              p_quantity?: number
            }
            Returns: Json
          }
      increment_category_access: {
        Args: { category_slug: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      order_status:
        | "pending_payment"
        | "paid"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
      payment_status:
        | "pending"
        | "approved"
        | "authorized"
        | "in_process"
        | "rejected"
        | "cancelled"
        | "refunded"
        | "charged_back"
      product_status: "draft" | "published" | "archived"
      user_role: "customer" | "admin"
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
  public: {
    Enums: {
      order_status: [
        "pending_payment",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      payment_status: [
        "pending",
        "approved",
        "authorized",
        "in_process",
        "rejected",
        "cancelled",
        "refunded",
        "charged_back",
      ],
      product_status: ["draft", "published", "archived"],
      user_role: ["customer", "admin"],
    },
  },
} as const
