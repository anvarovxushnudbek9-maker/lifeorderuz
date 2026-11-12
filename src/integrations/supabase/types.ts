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
    PostgrestVersion: "14.17"
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
      ai_requests: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_usage_counters: {
        Row: {
          request_times: string[]
          user_id: string
        }
        Insert: {
          request_times?: string[]
          user_id: string
        }
        Update: {
          request_times?: string[]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_counters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      body_metrics: {
        Row: {
          created_at: string
          id: string
          metric_date: string
          mood: number | null
          sleep_hours: number | null
          sleep_quality: number | null
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
          sleep_quality?: number | null
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
          sleep_quality?: number | null
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
      buddy_attempts: {
        Row: {
          attempts: number
          user_id: string
          window_start: string
        }
        Insert: {
          attempts?: number
          user_id: string
          window_start?: string
        }
        Update: {
          attempts?: number
          user_id?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "buddy_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      buddy_links: {
        Row: {
          created_at: string
          invite_code: string
          invite_expires_at: string
          partner_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          invite_code: string
          invite_expires_at?: string
          partner_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          invite_code?: string
          invite_expires_at?: string
          partner_id?: string | null
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
      community_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      daily_checkins: {
        Row: {
          checkin_date: string
          closed_at: string | null
          created_at: string
          energy: number | null
          user_id: string
        }
        Insert: {
          checkin_date?: string
          closed_at?: string | null
          created_at?: string
          energy?: number | null
          user_id: string
        }
        Update: {
          checkin_date?: string
          closed_at?: string | null
          created_at?: string
          energy?: number | null
          user_id?: string
        }
        Relationships: []
      }
      daily_plan_items: {
        Row: {
          completed_at: string | null
          created_at: string
          domain: string
          id: string
          minutes: number
          plan_date: string
          position: number
          skip_reason: string | null
          source: string
          status: string
          title: string
          user_id: string
          why: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          domain?: string
          id?: string
          minutes?: number
          plan_date?: string
          position?: number
          skip_reason?: string | null
          source?: string
          status?: string
          title: string
          user_id: string
          why?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          domain?: string
          id?: string
          minutes?: number
          plan_date?: string
          position?: number
          skip_reason?: string | null
          source?: string
          status?: string
          title?: string
          user_id?: string
          why?: string | null
        }
        Relationships: []
      }
      distraction_logs: {
        Row: {
          breach: boolean
          created_at: string
          id: string
          logged_on: string
          minutes: number
          recovered_at: string | null
          recovery: string | null
          source: string
          user_id: string
        }
        Insert: {
          breach?: boolean
          created_at?: string
          id?: string
          logged_on?: string
          minutes: number
          recovered_at?: string | null
          recovery?: string | null
          source: string
          user_id: string
        }
        Update: {
          breach?: boolean
          created_at?: string
          id?: string
          logged_on?: string
          minutes?: number
          recovered_at?: string | null
          recovery?: string | null
          source?: string
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
      payment_orders: {
        Row: {
          amount_uzs: number
          created_at: string
          id: string
          provider: string
          provider_reference: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount_uzs?: number
          created_at?: string
          id?: string
          provider: string
          provider_reference?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount_uzs?: number
          created_at?: string
          id?: string
          provider?: string
          provider_reference?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_entitlements: {
        Row: {
          premium_until: string | null
          trial_ends_at: string
          trial_started_at: string
          user_id: string
        }
        Insert: {
          premium_until?: string | null
          trial_ends_at?: string
          trial_started_at?: string
          user_id: string
        }
        Update: {
          premium_until?: string | null
          trial_ends_at?: string
          trial_started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_entitlements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          archetype: string | null
          avatar_url: string | null
          biggest_obstacle: string | null
          bio: string | null
          coach_mode: string
          created_at: string
          digital_habits: Json
          dopamine_triggers: string[]
          focus_areas: string[]
          full_name: string | null
          gender: string | null
          goal_type: string | null
          height_cm: number | null
          id: string
          main_goal: string | null
          onboarding_completed: boolean
          sport_preference: string | null
          updated_at: string
          weight_kg: number | null
          why_now: string | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          archetype?: string | null
          avatar_url?: string | null
          biggest_obstacle?: string | null
          bio?: string | null
          coach_mode?: string
          created_at?: string
          digital_habits?: Json
          dopamine_triggers?: string[]
          focus_areas?: string[]
          full_name?: string | null
          gender?: string | null
          goal_type?: string | null
          height_cm?: number | null
          id: string
          main_goal?: string | null
          onboarding_completed?: boolean
          sport_preference?: string | null
          updated_at?: string
          weight_kg?: number | null
          why_now?: string | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          archetype?: string | null
          avatar_url?: string | null
          biggest_obstacle?: string | null
          bio?: string | null
          coach_mode?: string
          created_at?: string
          digital_habits?: Json
          dopamine_triggers?: string[]
          focus_areas?: string[]
          full_name?: string | null
          gender?: string | null
          goal_type?: string | null
          height_cm?: number | null
          id?: string
          main_goal?: string | null
          onboarding_completed?: boolean
          sport_preference?: string | null
          updated_at?: string
          weight_kg?: number | null
          why_now?: string | null
        }
        Relationships: []
      }
      reminder_deliveries: {
        Row: {
          channel: string
          local_date: string
          reminder_id: string
          sent_at: string
          user_id: string
        }
        Insert: {
          channel?: string
          local_date: string
          reminder_id: string
          sent_at?: string
          user_id: string
        }
        Update: {
          channel?: string
          local_date?: string
          reminder_id?: string
          sent_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_deliveries_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "reminders"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          created_at: string
          done_on: string[]
          end_time: string | null
          id: string
          note: string | null
          remind_date: string
          repeat: string
          start_time: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          done_on?: string[]
          end_time?: string | null
          id?: string
          note?: string | null
          remind_date?: string
          repeat?: string
          start_time: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          done_on?: string[]
          end_time?: string | null
          id?: string
          note?: string | null
          remind_date?: string
          repeat?: string
          start_time?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      schedule_blocks: {
        Row: {
          block_date: string
          created_at: string
          hour: number
          id: string
          title: string
          user_id: string
        }
        Insert: {
          block_date?: string
          created_at?: string
          hour: number
          id?: string
          title: string
          user_id: string
        }
        Update: {
          block_date?: string
          created_at?: string
          hour?: number
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      telegram_links: {
        Row: {
          chat_id: number | null
          code_expires_at: string | null
          created_at: string
          link_code: string | null
          linked_at: string | null
          timezone: string
          user_id: string
        }
        Insert: {
          chat_id?: number | null
          code_expires_at?: string | null
          created_at?: string
          link_code?: string | null
          linked_at?: string | null
          timezone?: string
          user_id: string
        }
        Update: {
          chat_id?: number | null
          code_expires_at?: string | null
          created_at?: string
          link_code?: string | null
          linked_at?: string | null
          timezone?: string
          user_id?: string
        }
        Relationships: []
      }
      top_tasks: {
        Row: {
          created_at: string
          done: boolean
          id: string
          position: number
          task_date: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          done?: boolean
          id?: string
          position: number
          task_date?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          done?: boolean
          id?: string
          position?: number
          task_date?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_reviews: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string
          week_start: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_id: string
          week_start: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      accept_buddy: { Args: { _code: string }; Returns: boolean }
      buddy_today: {
        Args: never
        Returns: {
          done: number
          partner_name: string
          total: number
        }[]
      }
      circle_leaderboard: {
        Args: { _circle: string }
        Returns: {
          display_name: string
          is_me: boolean
          points: number
        }[]
      }
      claim_life_ai_request: { Args: never; Returns: number }
      disconnect_buddy: { Args: never; Returns: undefined }
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
