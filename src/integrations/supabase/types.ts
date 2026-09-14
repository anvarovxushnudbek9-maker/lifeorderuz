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
      ai_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      body_metrics: {
        Row: {
          created_at: string
          id: string
          metric_date: string
          mood: number | null
          sleep_hours: number | null
          steps: number
          user_id: string
          water_ml: number
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          metric_date?: string
          mood?: number | null
          sleep_hours?: number | null
          steps?: number
          user_id: string
          water_ml?: number
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          metric_date?: string
          mood?: number | null
          sleep_hours?: number | null
          steps?: number
          user_id?: string
          water_ml?: number
          weight_kg?: number | null
        }
        Relationships: []
      }
      books: {
        Row: {
          author: string | null
          created_at: string
          current_page: number
          id: string
          notes: string | null
          rating: number | null
          status: string
          title: string
          total_pages: number
          user_id: string
        }
        Insert: {
          author?: string | null
          created_at?: string
          current_page?: number
          id?: string
          notes?: string | null
          rating?: number | null
          status?: string
          title: string
          total_pages?: number
          user_id: string
        }
        Update: {
          author?: string | null
          created_at?: string
          current_page?: number
          id?: string
          notes?: string | null
          rating?: number | null
          status?: string
          title?: string
          total_pages?: number
          user_id?: string
        }
        Relationships: []
      }
      circle_members: {
        Row: {
          circle_id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          circle_id: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          circle_id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_members_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_messages: {
        Row: {
          circle_id: string
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          circle_id: string
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          circle_id?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_messages_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
        ]
      }
      circles: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          emoji: string
          id: string
          is_public: boolean
          name: string
          topic: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          emoji?: string
          id?: string
          is_public?: boolean
          name: string
          topic?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          emoji?: string
          id?: string
          is_public?: boolean
          name?: string
          topic?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string
          id: string
          progress: number
          provider: string | null
          status: string
          title: string
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          progress?: number
          provider?: string | null
          status?: string
          title: string
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          progress?: number
          provider?: string | null
          status?: string
          title?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      habit_logs: {
        Row: {
          created_at: string
          done: boolean
          habit_id: string
          id: string
          log_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          done?: boolean
          habit_id: string
          id?: string
          log_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          done?: boolean
          habit_id?: string
          id?: string
          log_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          archived: boolean
          category: string
          created_at: string
          emoji: string
          id: string
          target_per_week: number
          title: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          category?: string
          created_at?: string
          emoji?: string
          id?: string
          target_per_week?: number
          title: string
          user_id: string
        }
        Update: {
          archived?: boolean
          category?: string
          created_at?: string
          emoji?: string
          id?: string
          target_per_week?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string
          entry_date: string
          id: string
          mood: number | null
          title: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          entry_date?: string
          id?: string
          mood?: number | null
          title?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          entry_date?: string
          id?: string
          mood?: number | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      meals: {
        Row: {
          created_at: string
          eaten_on: string
          id: string
          kcal: number
          meal_type: string
          protein_g: number
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          eaten_on?: string
          id?: string
          kcal?: number
          meal_type?: string
          protein_g?: number
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          eaten_on?: string
          id?: string
          kcal?: number
          meal_type?: string
          protein_g?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          focus_areas: string[]
          full_name: string | null
          id: string
          main_goal: string | null
          onboarding_completed: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          focus_areas?: string[]
          full_name?: string | null
          id: string
          main_goal?: string | null
          onboarding_completed?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          focus_areas?: string[]
          full_name?: string | null
          id?: string
          main_goal?: string | null
          onboarding_completed?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      workouts: {
        Row: {
          calories: number | null
          created_at: string
          duration_min: number
          id: string
          kind: string
          notes: string | null
          performed_on: string
          title: string
          user_id: string
        }
        Insert: {
          calories?: number | null
          created_at?: string
          duration_min?: number
          id?: string
          kind?: string
          notes?: string | null
          performed_on?: string
          title: string
          user_id: string
        }
        Update: {
          calories?: number | null
          created_at?: string
          duration_min?: number
          id?: string
          kind?: string
          notes?: string | null
          performed_on?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_circle_member: {
        Args: { _circle: string; _user: string }
        Returns: boolean
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
  public: {
    Enums: {},
  },
} as const
