export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type LocationType = 'internal' | 'vendor' | 'customer' | 'inventory_loss'
export type DocumentType = 'receipt' | 'delivery' | 'internal' | 'adjustment'
export type DocumentState = 'draft' | 'waiting' | 'ready' | 'done' | 'canceled'
export type MoveState = 'draft' | 'done' | 'canceled'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          role: 'manager' | 'staff'
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role?: 'manager' | 'staff'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'manager' | 'staff'
          created_at?: string
        }
        Relationships: []
      }
      warehouse: {
        Row: {
          id: string
          name: string
          code: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          created_at?: string
        }
        Relationships: []
      }
      location: {
        Row: {
          id: string
          warehouse_id: string | null
          name: string
          code: string
          type: LocationType
          created_at: string
        }
        Insert: {
          id?: string
          warehouse_id?: string | null
          name: string
          code: string
          type?: LocationType
          created_at?: string
        }
        Update: {
          id?: string
          warehouse_id?: string | null
          name?: string
          code?: string
          type?: LocationType
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouse"
            referencedColumns: ["id"]
          }
        ]
      }
      product_category: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      product: {
        Row: {
          id: string
          name: string
          sku: string
          category_id: string | null
          uom: string
          reorder_min: number
          reorder_max: number | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          sku: string
          category_id?: string | null
          uom?: string
          reorder_min?: number
          reorder_max?: number | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          sku?: string
          category_id?: string | null
          uom?: string
          reorder_min?: number
          reorder_max?: number | null
          created_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      stock_document: {
        Row: {
          id: string
          reference: string
          type: DocumentType
          state: DocumentState
          partner_name: string | null
          scheduled_date: string | null
          warehouse_id: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          validated_by: string | null
          validated_at: string | null
        }
        Insert: {
          id?: string
          reference: string
          type: DocumentType
          state?: DocumentState
          partner_name?: string | null
          scheduled_date?: string | null
          warehouse_id?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          validated_by?: string | null
          validated_at?: string | null
        }
        Update: {
          id?: string
          reference?: string
          type?: DocumentType
          state?: DocumentState
          partner_name?: string | null
          scheduled_date?: string | null
          warehouse_id?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          validated_by?: string | null
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_document_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouse"
            referencedColumns: ["id"]
          }
        ]
      }
      stock_move: {
        Row: {
          id: string
          document_id: string
          product_id: string
          qty: number
          from_location_id: string
          to_location_id: string
          state: MoveState
          done_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          product_id: string
          qty: number
          from_location_id: string
          to_location_id: string
          state?: MoveState
          done_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          product_id?: string
          qty?: number
          from_location_id?: string
          to_location_id?: string
          state?: MoveState
          done_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_move_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "stock_document"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_move_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      stock_on_hand: {
        Row: {
          product_id: string
          location_id: string
          qty: number
        }
        Relationships: []
      }
    }
    Functions: {
      next_reference: {
        Args: { doc_type: DocumentType }
        Returns: string
      }
      validate_document: {
        Args: { doc_id: string }
        Returns: Database['public']['Tables']['stock_document']['Row']
      }
      cancel_document: {
        Args: { doc_id: string }
        Returns: Database['public']['Tables']['stock_document']['Row']
      }
      create_adjustment: {
        Args: { product_id: string; location_id: string; counted_qty: number }
        Returns: string
      }
      dashboard_kpis: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      location_type: LocationType
      document_type: DocumentType
      document_state: DocumentState
      move_state: MoveState
    }
  }
}
