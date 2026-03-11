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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ad_creatives: {
        Row: {
          brand_id: string | null
          created_at: string
          id: string
          image_url: string
          name: string | null
          tags: string[] | null
          user_id: string
        }
        Insert: {
          brand_id?: string | null
          created_at?: string
          id?: string
          image_url: string
          name?: string | null
          tags?: string[] | null
          user_id: string
        }
        Update: {
          brand_id?: string | null
          created_at?: string
          id?: string
          image_url?: string
          name?: string | null
          tags?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_creatives_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_images: {
        Row: {
          brand_id: string
          category: string
          created_at: string
          id: string
          image_url: string
          thumbnail_url: string | null
          updated_at: string
          user_id: string
          visual_analysis: Json | null
        }
        Insert: {
          brand_id: string
          category?: string
          created_at?: string
          id?: string
          image_url: string
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
          visual_analysis?: Json | null
        }
        Update: {
          brand_id?: string
          category?: string
          created_at?: string
          id?: string
          image_url?: string
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
          visual_analysis?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_images_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          assets: Json | null
          brand_context: Json | null
          created_at: string
          id: string
          industry: string | null
          markets: string[] | null
          name: string
          personality: string | null
          social_connections: Json | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          assets?: Json | null
          brand_context?: Json | null
          created_at?: string
          id?: string
          industry?: string | null
          markets?: string[] | null
          name?: string
          personality?: string | null
          social_connections?: Json | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          assets?: Json | null
          brand_context?: Json | null
          created_at?: string
          id?: string
          industry?: string | null
          markets?: string[] | null
          name?: string
          personality?: string | null
          social_connections?: Json | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      color_samples: {
        Row: {
          brand_id: string | null
          color: string | null
          color_hex: string | null
          component_type: string | null
          created_at: string
          id: string
          image_url: string
          material: string | null
          name: string | null
          user_id: string
        }
        Insert: {
          brand_id?: string | null
          color?: string | null
          color_hex?: string | null
          component_type?: string | null
          created_at?: string
          id?: string
          image_url: string
          material?: string | null
          name?: string | null
          user_id: string
        }
        Update: {
          brand_id?: string | null
          color?: string | null
          color_hex?: string | null
          component_type?: string | null
          created_at?: string
          id?: string
          image_url?: string
          material?: string | null
          name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "color_samples_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_backgrounds: {
        Row: {
          ai_analysis: Json | null
          brand_id: string
          created_at: string
          id: string
          name: string
          prompt: string
          reference_urls: string[] | null
          thumbnail_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          brand_id: string
          created_at?: string
          id?: string
          name: string
          prompt: string
          reference_urls?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_analysis?: Json | null
          brand_id?: string
          created_at?: string
          id?: string
          name?: string
          prompt?: string
          reference_urls?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_backgrounds_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_moodboards: {
        Row: {
          brand_id: string | null
          created_at: string
          description: string | null
          file_path: string | null
          id: string
          name: string
          thumbnail_url: string | null
          updated_at: string
          user_id: string
          visual_analysis: Json | null
        }
        Insert: {
          brand_id?: string | null
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          name?: string
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
          visual_analysis?: Json | null
        }
        Update: {
          brand_id?: string | null
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          name?: string
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
          visual_analysis?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_moodboards_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_images: {
        Row: {
          brand_id: string | null
          concept_id: string | null
          concept_title: string | null
          context_reference_url: string | null
          created_at: string
          error_message: string | null
          generation_step: string | null
          id: string
          image_url: string | null
          integrity_analysis: Json | null
          moodboard_id: string | null
          parent_image_id: string | null
          product_reference_url: string | null
          prompt: string | null
          refined_prompt: string | null
          settings: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_id?: string | null
          concept_id?: string | null
          concept_title?: string | null
          context_reference_url?: string | null
          created_at?: string
          error_message?: string | null
          generation_step?: string | null
          id?: string
          image_url?: string | null
          integrity_analysis?: Json | null
          moodboard_id?: string | null
          parent_image_id?: string | null
          product_reference_url?: string | null
          prompt?: string | null
          refined_prompt?: string | null
          settings?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_id?: string | null
          concept_id?: string | null
          concept_title?: string | null
          context_reference_url?: string | null
          created_at?: string
          error_message?: string | null
          generation_step?: string | null
          id?: string
          image_url?: string | null
          integrity_analysis?: Json | null
          moodboard_id?: string | null
          parent_image_id?: string | null
          product_reference_url?: string | null
          prompt?: string | null
          refined_prompt?: string | null
          settings?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_images_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_images_parent_image_id_fkey"
            columns: ["parent_image_id"]
            isOneToOne: false
            referencedRelation: "generated_images"
            referencedColumns: ["id"]
          },
        ]
      }
      product_skus: {
        Row: {
          brand_id: string | null
          category: string | null
          components: Json | null
          composite_image_url: string | null
          created_at: string
          description: Json | null
          id: string
          last_used_at: string | null
          name: string
          sku_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_id?: string | null
          category?: string | null
          components?: Json | null
          composite_image_url?: string | null
          created_at?: string
          description?: Json | null
          id?: string
          last_used_at?: string | null
          name?: string
          sku_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_id?: string | null
          category?: string | null
          components?: Json | null
          composite_image_url?: string | null
          created_at?: string
          description?: Json | null
          id?: string
          last_used_at?: string | null
          name?: string
          sku_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_skus_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string | null
          id: string
          sku_id: string
          sort_order: number | null
          thumbnail_url: string | null
          variant_name: string
          variant_type: string
          variant_value: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          sku_id: string
          sort_order?: number | null
          thumbnail_url?: string | null
          variant_name: string
          variant_type: string
          variant_value?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          sku_id?: string
          sort_order?: number | null
          thumbnail_url?: string | null
          variant_name?: string
          variant_type?: string
          variant_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "product_skus"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_concepts: {
        Row: {
          artistic_style: string | null
          aspect_ratio: string | null
          brand_id: string | null
          camera_angle: string | null
          consumer_insight: string | null
          content_pillars: Json | null
          core_idea: string | null
          created_at: string
          description: string
          extra_keywords: string[] | null
          id: string
          lighting_style: string | null
          moodboard_id: string | null
          product_focus: Json | null
          product_reference_ids: string[] | null
          taglines: string[] | null
          tags: string[] | null
          target_audience: Json | null
          title: string
          tonality: Json | null
          updated_at: string
          use_case: string | null
          user_id: string
          visual_world: Json | null
        }
        Insert: {
          artistic_style?: string | null
          aspect_ratio?: string | null
          brand_id?: string | null
          camera_angle?: string | null
          consumer_insight?: string | null
          content_pillars?: Json | null
          core_idea?: string | null
          created_at?: string
          description?: string
          extra_keywords?: string[] | null
          id?: string
          lighting_style?: string | null
          moodboard_id?: string | null
          product_focus?: Json | null
          product_reference_ids?: string[] | null
          taglines?: string[] | null
          tags?: string[] | null
          target_audience?: Json | null
          title?: string
          tonality?: Json | null
          updated_at?: string
          use_case?: string | null
          user_id: string
          visual_world?: Json | null
        }
        Update: {
          artistic_style?: string | null
          aspect_ratio?: string | null
          brand_id?: string | null
          camera_angle?: string | null
          consumer_insight?: string | null
          content_pillars?: Json | null
          core_idea?: string | null
          created_at?: string
          description?: string
          extra_keywords?: string[] | null
          id?: string
          lighting_style?: string | null
          moodboard_id?: string | null
          product_focus?: Json | null
          product_reference_ids?: string[] | null
          taglines?: string[] | null
          tags?: string[] | null
          target_audience?: Json | null
          title?: string
          tonality?: Json | null
          updated_at?: string
          use_case?: string | null
          user_id?: string
          visual_world?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_concepts_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      scene_images: {
        Row: {
          brand_id: string
          category: string
          created_at: string
          id: string
          image_url: string
          name: string
          region: string
          user_id: string
        }
        Insert: {
          brand_id: string
          category?: string
          created_at?: string
          id?: string
          image_url: string
          name?: string
          region?: string
          user_id: string
        }
        Update: {
          brand_id?: string
          category?: string
          created_at?: string
          id?: string
          image_url?: string
          name?: string
          region?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scene_images_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      scraped_products: {
        Row: {
          angle: string | null
          brand_id: string | null
          category: string | null
          collection: string | null
          created_at: string
          description: Json | null
          external_id: string | null
          full_url: string | null
          id: string
          name: string | null
          sku_id: string | null
          storage_path: string | null
          thumbnail_url: string | null
          user_id: string
        }
        Insert: {
          angle?: string | null
          brand_id?: string | null
          category?: string | null
          collection?: string | null
          created_at?: string
          description?: Json | null
          external_id?: string | null
          full_url?: string | null
          id?: string
          name?: string | null
          sku_id?: string | null
          storage_path?: string | null
          thumbnail_url?: string | null
          user_id: string
        }
        Update: {
          angle?: string | null
          brand_id?: string | null
          category?: string | null
          collection?: string | null
          created_at?: string
          description?: Json | null
          external_id?: string | null
          full_url?: string | null
          id?: string
          name?: string | null
          sku_id?: string | null
          storage_path?: string | null
          thumbnail_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scraped_products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scraped_products_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "product_skus"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
