export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRole = "OWNER" | "MANAGER" | "KITCHEN" | "WAITER";
export type OrderStatus = "ACCEPTED" | "PREPARING" | "READY" | "DELIVERED";

export type Database = {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo: string | null;
          phone: string | null;
          whatsapp: string | null;
          address: string | null;
          theme_color: string;
          tax_rate: number;
          service_charge_rate: number;
          whatsapp_notifications_enabled: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["restaurants"]["Row"]> & { name: string; slug: string };
        Update: Partial<Database["public"]["Tables"]["restaurants"]["Row"]>;
        Relationships: [];
      };
      restaurant_members: {
        Row: { id: string; restaurant_id: string; user_id: string; role: AppRole; created_at: string };
        Insert: { restaurant_id: string; user_id: string; role?: AppRole };
        Update: Partial<Database["public"]["Tables"]["restaurant_members"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "restaurant_members_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "restaurant_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      tables: {
        Row: { id: string; restaurant_id: string; table_number: number; qr_code_url: string | null; created_at: string };
        Insert: { restaurant_id: string; table_number: number; qr_code_url?: string | null };
        Update: Partial<Database["public"]["Tables"]["tables"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "tables_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          }
        ];
      };
      categories: {
        Row: { id: string; restaurant_id: string; name: string; sort_order: number; created_at: string };
        Insert: { restaurant_id: string; name: string; sort_order?: number };
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "categories_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          }
        ];
      };
      menu_items: {
        Row: {
          id: string;
          restaurant_id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          image_url: string | null;
          price: number;
          veg: boolean;
          available: boolean;
          popular: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["menu_items"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["menu_items"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "menu_items_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "menu_items_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          id: string;
          restaurant_id: string;
          table_id: string | null;
          order_number: number;
          customer_name: string;
          customer_phone: string;
          notes: string | null;
          status: OrderStatus;
          subtotal: number;
          tax: number;
          service_charge: number;
          total: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["orders"]["Row"], "id" | "order_number" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "orders_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_table_id_fkey";
            columns: ["table_id"];
            isOneToOne: false;
            referencedRelation: "tables";
            referencedColumns: ["id"];
          }
        ];
      };
      order_items: {
        Row: { id: string; order_id: string; menu_item_id: string | null; quantity: number; price: number; item_name: string };
        Insert: Omit<Database["public"]["Tables"]["order_items"]["Row"], "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_menu_item_id_fkey";
            columns: ["menu_item_id"];
            isOneToOne: false;
            referencedRelation: "menu_items";
            referencedColumns: ["id"];
          }
        ];
      };
      users: {
        Row: { id: string; email: string; role: AppRole; created_at: string };
        Insert: { id: string; email: string; role?: AppRole };
        Update: { email?: string; role?: AppRole };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: AppRole;
      order_status: OrderStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
