// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          ativo: boolean | null
          configuracoes: Json | null
          created_at: string | null
          email_contato: string
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          configuracoes?: Json | null
          created_at?: string | null
          email_contato: string
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean | null
          configuracoes?: Json | null
          created_at?: string | null
          email_contato?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      usuarios_cliente: {
        Row: {
          ativo: boolean | null
          cliente_id: string | null
          created_at: string | null
          email: string
          id: string
          nome_usuario: string
        }
        Insert: {
          ativo?: boolean | null
          cliente_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          nome_usuario: string
        }
        Update: {
          ativo?: boolean | null
          cliente_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          nome_usuario?: string
        }
        Relationships: [
          {
            foreignKeyName: 'usuarios_cliente_cliente_id_fkey'
            columns: ['cliente_id']
            isOneToOne: false
            referencedRelation: 'clientes'
            referencedColumns: ['id']
          },
        ]
      }
      widgets: {
        Row: {
          ativo: boolean | null
          cliente_id: string | null
          created_at: string | null
          id: string
          nome_relatorio: string
          ordem: number
          url_looker: string
        }
        Insert: {
          ativo?: boolean | null
          cliente_id?: string | null
          created_at?: string | null
          id?: string
          nome_relatorio: string
          ordem?: number
          url_looker: string
        }
        Update: {
          ativo?: boolean | null
          cliente_id?: string | null
          created_at?: string | null
          id?: string
          nome_relatorio?: string
          ordem?: number
          url_looker?: string
        }
        Relationships: [
          {
            foreignKeyName: 'widgets_cliente_id_fkey'
            columns: ['cliente_id']
            isOneToOne: false
            referencedRelation: 'clientes'
            referencedColumns: ['id']
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: clientes
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   email_contato: text (not null)
//   configuracoes: jsonb (nullable, default: '{}'::jsonb)
//   ativo: boolean (nullable, default: true)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: usuarios_cliente
//   id: uuid (not null, default: gen_random_uuid())
//   cliente_id: uuid (nullable)
//   nome_usuario: text (not null)
//   email: text (not null)
//   ativo: boolean (nullable, default: true)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: widgets
//   id: uuid (not null, default: gen_random_uuid())
//   cliente_id: uuid (nullable)
//   nome_relatorio: text (not null)
//   url_looker: text (not null)
//   ordem: integer (not null, default: 0)
//   ativo: boolean (nullable, default: true)
//   created_at: timestamp with time zone (nullable, default: now())

// --- CONSTRAINTS ---
// Table: clientes
//   PRIMARY KEY clientes_pkey: PRIMARY KEY (id)
// Table: usuarios_cliente
//   FOREIGN KEY usuarios_cliente_cliente_id_fkey: FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
//   UNIQUE usuarios_cliente_email_key: UNIQUE (email)
//   PRIMARY KEY usuarios_cliente_pkey: PRIMARY KEY (id)
// Table: widgets
//   FOREIGN KEY widgets_cliente_id_fkey: FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
//   PRIMARY KEY widgets_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: clientes
//   Policy "admin_all_clientes" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)
//     WITH CHECK: (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)
//   Policy "cliente_select_clientes" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (id IN ( SELECT usuarios_cliente.cliente_id    FROM usuarios_cliente   WHERE (usuarios_cliente.email = (auth.jwt() ->> 'email'::text))))
// Table: usuarios_cliente
//   Policy "admin_all_usuarios" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (COALESCE(((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text), ''::text) = 'admin'::text)
//     WITH CHECK: (COALESCE(((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text), ''::text) = 'admin'::text)
//   Policy "cliente_select_usuarios" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (email = (auth.jwt() ->> 'email'::text))
// Table: widgets
//   Policy "admin_all_widgets" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (COALESCE(((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text), ''::text) = 'admin'::text)
//     WITH CHECK: (COALESCE(((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text), ''::text) = 'admin'::text)
//   Policy "cliente_select_widgets" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (cliente_id IN ( SELECT usuarios_cliente.cliente_id    FROM usuarios_cliente   WHERE (usuarios_cliente.email = (auth.jwt() ->> 'email'::text))))

// --- INDEXES ---
// Table: usuarios_cliente
//   CREATE UNIQUE INDEX usuarios_cliente_email_key ON public.usuarios_cliente USING btree (email)
