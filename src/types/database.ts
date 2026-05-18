export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string | null;
          avatar_url: string | null;
          wallet_address: string | null;
          coins: number;
          xp: number;
          level: number;
          avatar_sprite: string | null;
          selected_pet: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']>;
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      holdings: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          amount: number;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['holdings']['Row']>;
        Update: Partial<Database['public']['Tables']['holdings']['Row']>;
      };
      trades: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          type: string;
          side: string;
          exchange: string;
          entry_price: number;
          amount: number;
          leverage: number;
          pnl: number;
          tp_price: number | null;
          sl_price: number | null;
          entry_fees: number;
          status: string;
          closed_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['trades']['Row']>;
        Update: Partial<Database['public']['Tables']['trades']['Row']>;
      };
      houses: {
        Row: {
          id: string;
          user_id: string;
          style: string;
          level: number;
          decorations: string[] | null;
          vault_level: number;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['houses']['Row']>;
        Update: Partial<Database['public']['Tables']['houses']['Row']>;
      };
      characters: {
        Row: {
          id: string;
          user_id: string;
          trade_id: string;
          type: string;
          exchange: string;
          hp: number;
          atk: number;
          def: number;
          level: number;
          xp: number;
          sprite_path: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['characters']['Row']>;
        Update: Partial<Database['public']['Tables']['characters']['Row']>;
      };
      // ── NUEVO: Logros ──
      achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_key: string;
          name: string;
          description: string;
          icon: string;
          progress: number;
          max_progress: number;
          unlocked: boolean;
          unlocked_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['achievements']['Row']>;
        Update: Partial<Database['public']['Tables']['achievements']['Row']>;
      };
      // ── NUEVO: Equipamiento ──
      equipment: {
        Row: {
          id: string;
          user_id: string;
          slot: string;
          item_key: string;
          item_name: string;
          sprite_path: string;
          level: number;
          equipped: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['equipment']['Row']>;
        Update: Partial<Database['public']['Tables']['equipment']['Row']>;
      };
    };
  };
}
