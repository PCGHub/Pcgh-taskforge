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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
          request_id: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
          request_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
          request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json
          id: string
          message: string
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          message: string
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          message?: string
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          country_code: string | null
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          first_name: string | null
          last_name: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          country_code?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          first_name?: string | null
          last_name?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          country_code?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          first_name?: string | null
          last_name?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      task_assignments: {
        Row: {
          approved_at: string | null
          assigned_at: string
          assigned_by: string | null
          attempt_count: number
          claimed_at: string | null
          completed_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          rejection_reason: string | null
          review_notes: string | null
          reviewed_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["assignment_status"]
          submitted_at: string | null
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          assigned_at?: string
          assigned_by?: string | null
          attempt_count?: number
          claimed_at?: string | null
          completed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          rejection_reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          submitted_at?: string | null
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          assigned_at?: string
          assigned_by?: string | null
          attempt_count?: number
          claimed_at?: string | null
          completed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          rejection_reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          submitted_at?: string | null
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      task_events: {
        Row: {
          actor_user_id: string | null
          assignment_id: string
          created_at: string
          event_type: string
          id: string
          metadata: Json
        }
        Insert: {
          actor_user_id?: string | null
          assignment_id: string
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
        }
        Update: {
          actor_user_id?: string | null
          assignment_id?: string
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "task_events_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_events_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "task_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      task_evidence: {
        Row: {
          content_hash: string | null
          created_at: string
          evidence_type: Database["public"]["Enums"]["evidence_type"]
          external_url: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          id: string
          metadata: Json
          mime_type: string | null
          reference_value: string | null
          submission_id: string
          text_value: string | null
        }
        Insert: {
          content_hash?: string | null
          created_at?: string
          evidence_type: Database["public"]["Enums"]["evidence_type"]
          external_url?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          metadata?: Json
          mime_type?: string | null
          reference_value?: string | null
          submission_id: string
          text_value?: string | null
        }
        Update: {
          content_hash?: string | null
          created_at?: string
          evidence_type?: Database["public"]["Enums"]["evidence_type"]
          external_url?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          metadata?: Json
          mime_type?: string | null
          reference_value?: string | null
          submission_id?: string
          text_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_evidence_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "task_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      task_requirements: {
        Row: {
          created_at: string
          description: string
          id: string
          is_required: boolean
          requirement_type: string
          sort_order: number
          task_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_required?: boolean
          requirement_type: string
          sort_order?: number
          task_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_required?: boolean
          requirement_type?: string
          sort_order?: number
          task_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_requirements_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_submissions: {
        Row: {
          assignment_id: string
          comment: string | null
          created_at: string
          id: string
          review_comment: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["submission_status"]
          submission_number: number
          submitted_at: string
          submitted_by: string
          updated_at: string
        }
        Insert: {
          assignment_id: string
          comment?: string | null
          created_at?: string
          id?: string
          review_comment?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submission_number: number
          submitted_at?: string
          submitted_by: string
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          review_comment?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submission_number?: number
          submitted_at?: string
          submitted_by?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "task_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_submissions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_submissions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          category: string
          closed_at: string | null
          completion_window_hours: number | null
          created_at: string
          created_by: string
          currency: string
          deadline: string | null
          description: string
          id: string
          max_workers: number | null
          published_at: string | null
          reward_amount: number
          status: Database["public"]["Enums"]["task_status"]
          target_url: string | null
          task_code: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          closed_at?: string | null
          completion_window_hours?: number | null
          created_at?: string
          created_by: string
          currency?: string
          deadline?: string | null
          description: string
          id?: string
          max_workers?: number | null
          published_at?: string | null
          reward_amount?: number
          status?: Database["public"]["Enums"]["task_status"]
          target_url?: string | null
          task_code: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          closed_at?: string | null
          completion_window_hours?: number | null
          created_at?: string
          created_by?: string
          currency?: string
          deadline?: string | null
          description?: string
          id?: string
          max_workers?: number | null
          published_at?: string | null
          reward_amount?: number
          status?: Database["public"]["Enums"]["task_status"]
          target_url?: string | null
          task_code?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_user_id: string
          created_at: string
          email: string
          email_verified_at: string | null
          id: string
          last_login_at: string | null
          phone: string | null
          phone_verified_at: string | null
          role_id: string
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          email: string
          email_verified_at?: string | null
          id?: string
          last_login_at?: string | null
          phone?: string | null
          phone_verified_at?: string | null
          role_id: string
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          email?: string
          email_verified_at?: string | null
          id?: string
          last_login_at?: string | null
          phone?: string | null
          phone_verified_at?: string | null
          role_id?: string
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          direction: Database["public"]["Enums"]["transaction_direction"]
          id: string
          reference_id: string | null
          reference_type: string | null
          status: Database["public"]["Enums"]["wallet_transaction_status"]
          transaction_type: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          direction: Database["public"]["Enums"]["transaction_direction"]
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          status?: Database["public"]["Enums"]["wallet_transaction_status"]
          transaction_type: string
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          direction?: Database["public"]["Enums"]["transaction_direction"]
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          status?: Database["public"]["Enums"]["wallet_transaction_status"]
          transaction_type?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          created_at: string
          currency: string
          id: string
          status: Database["public"]["Enums"]["wallet_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          status?: Database["public"]["Enums"]["wallet_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          status?: Database["public"]["Enums"]["wallet_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawals: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string
          currency: string
          destination_reference: string
          failure_reason: string | null
          id: string
          idempotency_key: string
          method: string
          processed_at: string | null
          processed_by: string | null
          requested_at: string
          status: Database["public"]["Enums"]["withdrawal_status"]
          updated_at: string
          user_id: string
          wallet_id: string
          withdrawal_code: string
        }
        Insert: {
          admin_note?: string | null
          amount: number
          created_at?: string
          currency?: string
          destination_reference: string
          failure_reason?: string | null
          id?: string
          idempotency_key: string
          method: string
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["withdrawal_status"]
          updated_at?: string
          user_id: string
          wallet_id: string
          withdrawal_code: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          currency?: string
          destination_reference?: string
          failure_reason?: string | null
          id?: string
          idempotency_key?: string
          method?: string
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["withdrawal_status"]
          updated_at?: string
          user_id?: string
          wallet_id?: string
          withdrawal_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawals_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_create_task: {
        Args: {
          p_category: string
          p_completion_window_hours?: number
          p_currency?: string
          p_deadline?: string
          p_description: string
          p_max_workers?: number
          p_requirements?: Json
          p_reward_amount: number
          p_target_url?: string
          p_title: string
        }
        Returns: string
      }
      admin_pause_task: { Args: { p_task_id: string }; Returns: string }
      admin_publish_task: { Args: { p_task_id: string }; Returns: string }
      admin_update_withdrawal: {
        Args: { p_decision: string; p_note?: string; p_withdrawal_id: string }
        Returns: Json
      }
      claim_task: { Args: { p_task_id: string }; Returns: string }
      create_evidence_record: {
        Args: {
          p_content_hash?: string
          p_evidence_type: Database["public"]["Enums"]["evidence_type"]
          p_external_url?: string
          p_file_name: string
          p_file_path: string
          p_file_size: number
          p_mime_type: string
          p_reference_value?: string
          p_submission_id: string
          p_text_value?: string
        }
        Returns: string
      }
      create_notification: {
        Args: {
          p_data?: Json
          p_message: string
          p_title: string
          p_type: Database["public"]["Enums"]["notification_type"]
          p_user_id: string
        }
        Returns: string
      }
      current_app_role: { Args: never; Returns: string }
      current_app_user_id: { Args: never; Returns: string }
      mark_notification_read: {
        Args: { p_notification_id: string }
        Returns: undefined
      }
      request_withdrawal: {
        Args: {
          p_amount: number
          p_currency: string
          p_destination_reference: string
          p_idempotency_key: string
          p_method: string
        }
        Returns: string
      }
      review_submission: {
        Args: {
          p_comment?: string
          p_decision: string
          p_submission_id: string
        }
        Returns: Json
      }
      submit_task: {
        Args: { p_assignment_id: string; p_comment: string }
        Returns: string
      }
      wallet_available_balance: {
        Args: { p_currency?: string; p_user_id: string }
        Returns: number
      }
      write_audit_log: {
        Args: {
          p_action: string
          p_entity_id?: string
          p_entity_type: string
          p_metadata?: Json
          p_request_id?: string
        }
        Returns: string
      }
    }
    Enums: {
      assignment_status:
        | "ASSIGNED"
        | "CLAIMED"
        | "IN_PROGRESS"
        | "SUBMITTED"
        | "UNDER_REVIEW"
        | "MORE_PROOF_REQUIRED"
        | "APPROVED"
        | "REJECTED"
        | "EXPIRED"
        | "CANCELLED"
        | "REWARDED"
      evidence_type:
        | "SCREENSHOT"
        | "VIDEO"
        | "DOCUMENT"
        | "TEXT"
        | "URL"
        | "REFERENCE_ID"
        | "EMAIL"
      notification_type:
        | "TASK_ASSIGNED"
        | "TASK_SUBMITTED"
        | "TASK_APPROVED"
        | "TASK_REJECTED"
        | "MORE_PROOF_REQUIRED"
        | "REWARD_CREATED"
        | "WITHDRAWAL_REQUESTED"
        | "WITHDRAWAL_UPDATED"
        | "SYSTEM"
      submission_status:
        | "PENDING"
        | "UNDER_REVIEW"
        | "APPROVED"
        | "REJECTED"
        | "MORE_INFORMATION_REQUIRED"
      task_status:
        | "DRAFT"
        | "PUBLISHED"
        | "PAUSED"
        | "FULL"
        | "CLOSED"
        | "EXPIRED"
        | "CANCELLED"
      transaction_direction: "CREDIT" | "DEBIT"
      user_status: "PENDING" | "ACTIVE" | "SUSPENDED" | "BANNED" | "DEACTIVATED"
      wallet_status: "ACTIVE" | "SUSPENDED" | "CLOSED"
      wallet_transaction_status: "PENDING" | "POSTED" | "REVERSED" | "CANCELLED"
      withdrawal_status:
        | "REQUESTED"
        | "UNDER_REVIEW"
        | "APPROVED"
        | "PROCESSING"
        | "PAID"
        | "FAILED"
        | "REJECTED"
        | "CANCELLED"
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
      assignment_status: [
        "ASSIGNED",
        "CLAIMED",
        "IN_PROGRESS",
        "SUBMITTED",
        "UNDER_REVIEW",
        "MORE_PROOF_REQUIRED",
        "APPROVED",
        "REJECTED",
        "EXPIRED",
        "CANCELLED",
        "REWARDED",
      ],
      evidence_type: [
        "SCREENSHOT",
        "VIDEO",
        "DOCUMENT",
        "TEXT",
        "URL",
        "REFERENCE_ID",
        "EMAIL",
      ],
      notification_type: [
        "TASK_ASSIGNED",
        "TASK_SUBMITTED",
        "TASK_APPROVED",
        "TASK_REJECTED",
        "MORE_PROOF_REQUIRED",
        "REWARD_CREATED",
        "WITHDRAWAL_REQUESTED",
        "WITHDRAWAL_UPDATED",
        "SYSTEM",
      ],
      submission_status: [
        "PENDING",
        "UNDER_REVIEW",
        "APPROVED",
        "REJECTED",
        "MORE_INFORMATION_REQUIRED",
      ],
      task_status: [
        "DRAFT",
        "PUBLISHED",
        "PAUSED",
        "FULL",
        "CLOSED",
        "EXPIRED",
        "CANCELLED",
      ],
      transaction_direction: ["CREDIT", "DEBIT"],
      user_status: ["PENDING", "ACTIVE", "SUSPENDED", "BANNED", "DEACTIVATED"],
      wallet_status: ["ACTIVE", "SUSPENDED", "CLOSED"],
      wallet_transaction_status: ["PENDING", "POSTED", "REVERSED", "CANCELLED"],
      withdrawal_status: [
        "REQUESTED",
        "UNDER_REVIEW",
        "APPROVED",
        "PROCESSING",
        "PAID",
        "FAILED",
        "REJECTED",
        "CANCELLED",
      ],
    },
  },
} as const
