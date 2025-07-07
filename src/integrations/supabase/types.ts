export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_date: string
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          end_time: string
          id: string
          party_size: number
          special_requests: string | null
          start_time: string
          status: string
          table_id: string
          updated_at: string
        }
        Insert: {
          booking_date: string
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          end_time: string
          id?: string
          party_size: number
          special_requests?: string | null
          start_time: string
          status?: string
          table_id: string
          updated_at?: string
        }
        Update: {
          booking_date?: string
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          end_time?: string
          id?: string
          party_size?: number
          special_requests?: string | null
          start_time?: string
          status?: string
          table_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_analysis: {
        Row: {
          analyzed_at: string | null
          backlink_count: number | null
          competitor_url: string
          domain_authority: number | null
          id: string
          page_authority: number | null
          project_id: string
          ranking_keywords: number | null
          social_signals: Json | null
          top_keywords: Json | null
        }
        Insert: {
          analyzed_at?: string | null
          backlink_count?: number | null
          competitor_url: string
          domain_authority?: number | null
          id?: string
          page_authority?: number | null
          project_id: string
          ranking_keywords?: number | null
          social_signals?: Json | null
          top_keywords?: Json | null
        }
        Update: {
          analyzed_at?: string | null
          backlink_count?: number | null
          competitor_url?: string
          domain_authority?: number | null
          id?: string
          page_authority?: number | null
          project_id?: string
          ranking_keywords?: number | null
          social_signals?: Json | null
          top_keywords?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_analysis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          agent_id: string
          caller_email: string | null
          caller_name: string | null
          caller_phone: string | null
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          caller_email?: string | null
          caller_name?: string | null
          caller_phone?: string | null
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          caller_email?: string | null
          caller_name?: string | null
          caller_phone?: string | null
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      keyword_analysis: {
        Row: {
          competition_level: string | null
          content_gaps: Json | null
          created_at: string | null
          ctr_potential: number | null
          id: string
          intent_analysis: string | null
          keyword_id: string
          project_id: string
          related_keywords: Json | null
          seasonal_trends: Json | null
          serp_features: Json | null
          updated_at: string | null
        }
        Insert: {
          competition_level?: string | null
          content_gaps?: Json | null
          created_at?: string | null
          ctr_potential?: number | null
          id?: string
          intent_analysis?: string | null
          keyword_id: string
          project_id: string
          related_keywords?: Json | null
          seasonal_trends?: Json | null
          serp_features?: Json | null
          updated_at?: string | null
        }
        Update: {
          competition_level?: string | null
          content_gaps?: Json | null
          created_at?: string | null
          ctr_potential?: number | null
          id?: string
          intent_analysis?: string | null
          keyword_id?: string
          project_id?: string
          related_keywords?: Json | null
          seasonal_trends?: Json | null
          serp_features?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "keyword_analysis_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "keyword_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "keyword_analysis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      keyword_rankings: {
        Row: {
          difficulty_score: number | null
          id: string
          keyword: string
          position: number | null
          previous_position: number | null
          project_id: string
          search_volume: number | null
          tracked_at: string | null
        }
        Insert: {
          difficulty_score?: number | null
          id?: string
          keyword: string
          position?: number | null
          previous_position?: number | null
          project_id: string
          search_volume?: number | null
          tracked_at?: string | null
        }
        Update: {
          difficulty_score?: number | null
          id?: string
          keyword?: string
          position?: number | null
          previous_position?: number | null
          project_id?: string
          search_volume?: number | null
          tracked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "keyword_rankings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          conversation_id: string
          id: string
          message: string
          source: string
          timestamp: string
        }
        Insert: {
          conversation_id: string
          id?: string
          message: string
          source: string
          timestamp?: string
        }
        Update: {
          conversation_id?: string
          id?: string
          message?: string
          source?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      page_insights: {
        Row: {
          accessibility_score: number | null
          analyzed_at: string | null
          broken_links_count: number | null
          content_quality_score: number | null
          content_suggestions: Json | null
          external_links_count: number | null
          heading_structure_score: number | null
          id: string
          image_optimization_score: number | null
          internal_links_count: number | null
          load_time: number | null
          meta_tags_score: number | null
          mobile_friendly_score: number | null
          project_id: string
          technical_issues: Json | null
          url: string
        }
        Insert: {
          accessibility_score?: number | null
          analyzed_at?: string | null
          broken_links_count?: number | null
          content_quality_score?: number | null
          content_suggestions?: Json | null
          external_links_count?: number | null
          heading_structure_score?: number | null
          id?: string
          image_optimization_score?: number | null
          internal_links_count?: number | null
          load_time?: number | null
          meta_tags_score?: number | null
          mobile_friendly_score?: number | null
          project_id: string
          technical_issues?: Json | null
          url: string
        }
        Update: {
          accessibility_score?: number | null
          analyzed_at?: string | null
          broken_links_count?: number | null
          content_quality_score?: number | null
          content_suggestions?: Json | null
          external_links_count?: number | null
          heading_structure_score?: number | null
          id?: string
          image_optimization_score?: number | null
          internal_links_count?: number | null
          load_time?: number | null
          meta_tags_score?: number | null
          mobile_friendly_score?: number | null
          project_id?: string
          technical_issues?: Json | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_insights_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string | null
          full_name: string | null
          id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          created_at: string | null
          end_time: string
          id: string
          space_id: string
          start_time: string
          status: string
          total_price: number
          updated_at: string | null
          user_id: string
          user_name: string | null
        }
        Insert: {
          created_at?: string | null
          end_time: string
          id?: string
          space_id: string
          start_time: string
          status?: string
          total_price: number
          updated_at?: string | null
          user_id: string
          user_name?: string | null
        }
        Update: {
          created_at?: string | null
          end_time?: string
          id?: string
          space_id?: string
          start_time?: string
          status?: string
          total_price?: number
          updated_at?: string | null
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_projects: {
        Row: {
          analysis_frequency: string | null
          business_id: string
          created_at: string | null
          id: string
          status: string
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          analysis_frequency?: string | null
          business_id: string
          created_at?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          analysis_frequency?: string | null
          business_id?: string
          created_at?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_projects_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_reports: {
        Row: {
          created_at: string | null
          id: string
          metrics: Json
          project_id: string
          recommendations: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metrics?: Json
          project_id: string
          recommendations?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metrics?: Json
          project_id?: string
          recommendations?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      spaces: {
        Row: {
          capacity: number | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          price_per_hour: number
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price_per_hour: number
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price_per_hour?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      tables: {
        Row: {
          capacity: number
          created_at: string
          id: string
          name: string
          section: string
          updated_at: string
        }
        Insert: {
          capacity: number
          created_at?: string
          id?: string
          name: string
          section: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          id?: string
          name?: string
          section?: string
          updated_at?: string
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          id: string
          name: string
          address: string
          cuisine: string
          rating: number | null
          image_url: string | null
          phone: string | null
          email: string | null
          opening_hours: Json | null
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          cuisine: string
          rating?: number | null
          image_url?: string | null
          phone?: string | null
          email?: string | null
          opening_hours?: Json | null
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          cuisine?: string
          rating?: number | null
          image_url?: string | null
          phone?: string | null
          email?: string | null
          opening_hours?: Json | null
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      url_analysis: {
        Row: {
          analyzed_at: string | null
          id: string
          indexability: Json | null
          meta_data: Json | null
          mobile_friendliness: Json | null
          performance_metrics: Json | null
          project_id: string
          recommendations: Json | null
          schema_markup: Json | null
          security_headers: Json | null
          seo_issues: Json | null
          social_tags: Json | null
        }
        Insert: {
          analyzed_at?: string | null
          id?: string
          indexability?: Json | null
          meta_data?: Json | null
          mobile_friendliness?: Json | null
          performance_metrics?: Json | null
          project_id: string
          recommendations?: Json | null
          schema_markup?: Json | null
          security_headers?: Json | null
          seo_issues?: Json | null
          social_tags?: Json | null
        }
        Update: {
          analyzed_at?: string | null
          id?: string
          indexability?: Json | null
          meta_data?: Json | null
          mobile_friendliness?: Json | null
          performance_metrics?: Json | null
          project_id?: string
          recommendations?: Json | null
          schema_markup?: Json | null
          security_headers?: Json | null
          seo_issues?: Json | null
          social_tags?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "url_analysis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          elevenlabs_agent_id: string | null
          elevenlabs_api_key: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          elevenlabs_agent_id?: string | null
          elevenlabs_api_key?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          elevenlabs_agent_id?: string | null
          elevenlabs_api_key?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
