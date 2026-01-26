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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          resource_id: string | null
          resource_name: string | null
          resource_type: string
          user_agent: string | null
          user_email: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_name?: string | null
          resource_type: string
          user_agent?: string | null
          user_email?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_name?: string | null
          resource_type?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      brand_images: {
        Row: {
          brand_id: string
          category: string | null
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
          category?: string | null
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
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
          visual_analysis?: Json | null
        }
        Relationships: []
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
          name: string
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
      custom_moodboards: {
        Row: {
          brand_id: string | null
          created_at: string
          description: string | null
          file_path: string
          id: string
          metadata_locked: boolean
          name: string
          thumbnail_url: string
          updated_at: string
          user_id: string
          visual_analysis: Json | null
        }
        Insert: {
          brand_id?: string | null
          created_at?: string
          description?: string | null
          file_path: string
          id?: string
          metadata_locked?: boolean
          name: string
          thumbnail_url: string
          updated_at?: string
          user_id: string
          visual_analysis?: Json | null
        }
        Update: {
          brand_id?: string | null
          created_at?: string
          description?: string | null
          file_path?: string
          id?: string
          metadata_locked?: boolean
          name?: string
          thumbnail_url?: string
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
          created_at: string | null
          error_message: string | null
          folder: string | null
          id: string
          image_url: string
          liked: boolean | null
          moodboard_id: string | null
          negative_prompt: string | null
          product_reference_url: string | null
          prompt: string
          refined_prompt: string | null
          settings: Json | null
          shot_type: string | null
          status: string | null
          thumbnail_url: string | null
          user_id: string
        }
        Insert: {
          brand_id?: string | null
          concept_id?: string | null
          concept_title?: string | null
          context_reference_url?: string | null
          created_at?: string | null
          error_message?: string | null
          folder?: string | null
          id?: string
          image_url: string
          liked?: boolean | null
          moodboard_id?: string | null
          negative_prompt?: string | null
          product_reference_url?: string | null
          prompt: string
          refined_prompt?: string | null
          settings?: Json | null
          shot_type?: string | null
          status?: string | null
          thumbnail_url?: string | null
          user_id: string
        }
        Update: {
          brand_id?: string | null
          concept_id?: string | null
          concept_title?: string | null
          context_reference_url?: string | null
          created_at?: string | null
          error_message?: string | null
          folder?: string | null
          id?: string
          image_url?: string
          liked?: boolean | null
          moodboard_id?: string | null
          negative_prompt?: string | null
          product_reference_url?: string | null
          prompt?: string
          refined_prompt?: string | null
          settings?: Json | null
          shot_type?: string | null
          status?: string | null
          thumbnail_url?: string | null
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
        ]
      }
      saved_concepts: {
        Row: {
          artistic_style: string | null
          aspect_ratio: string | null
          brand_id: string | null
          call_to_action: string | null
          camera_angle: string | null
          consumer_insight: string | null
          content_pillars: Json | null
          core_idea: string | null
          created_at: string
          description: string
          extra_keywords: string[] | null
          id: string
          key_message: string | null
          lighting_style: string | null
          moodboard_id: string | null
          objective: string | null
          output_format: string | null
          product_focus: Json | null
          product_reference_ids: string[] | null
          taglines: string[] | null
          tags: string[] | null
          target_audience: Json | null
          target_persona: string | null
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
          call_to_action?: string | null
          camera_angle?: string | null
          consumer_insight?: string | null
          content_pillars?: Json | null
          core_idea?: string | null
          created_at?: string
          description: string
          extra_keywords?: string[] | null
          id?: string
          key_message?: string | null
          lighting_style?: string | null
          moodboard_id?: string | null
          objective?: string | null
          output_format?: string | null
          product_focus?: Json | null
          product_reference_ids?: string[] | null
          taglines?: string[] | null
          tags?: string[] | null
          target_audience?: Json | null
          target_persona?: string | null
          title: string
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
          call_to_action?: string | null
          camera_angle?: string | null
          consumer_insight?: string | null
          content_pillars?: Json | null
          core_idea?: string | null
          created_at?: string
          description?: string
          extra_keywords?: string[] | null
          id?: string
          key_message?: string | null
          lighting_style?: string | null
          moodboard_id?: string | null
          objective?: string | null
          output_format?: string | null
          product_focus?: Json | null
          product_reference_ids?: string[] | null
          taglines?: string[] | null
          tags?: string[] | null
          target_audience?: Json | null
          target_persona?: string | null
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
      scraped_products: {
        Row: {
          brand_id: string | null
          category: string | null
          collection: string | null
          created_at: string | null
          description: Json | null
          external_id: string
          full_url: string
          id: string
          name: string
          storage_path: string | null
          thumbnail_url: string
          user_id: string
        }
        Insert: {
          brand_id?: string | null
          category?: string | null
          collection?: string | null
          created_at?: string | null
          description?: Json | null
          external_id: string
          full_url: string
          id?: string
          name: string
          storage_path?: string | null
          thumbnail_url: string
          user_id: string
        }
        Update: {
          brand_id?: string | null
          category?: string | null
          collection?: string | null
          created_at?: string | null
          description?: Json | null
          external_id?: string
          full_url?: string
          id?: string
          name?: string
          storage_path?: string | null
          thumbnail_url?: string
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
