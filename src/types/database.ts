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
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['characters']['Row']>;
        Update: Partial<Database['public']['Tables']['characters']['Row']>;
      };
    };
  };
}
