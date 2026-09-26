import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Database, DocumentType, DocumentState } from '../database.types';

export type StockDocumentRow = Database['public']['Tables']['stock_document']['Row'] & {
  warehouse?: { name: string; code: string } | null;
  moves_count?: number;
};

export interface DocumentFilterOptions {
  type?: DocumentType | string | null;
  statuses?: DocumentState[] | string[];
  warehouseId?: string | null;
  categoryId?: string | null;
  search?: string | null;
}

/**
 * useStockDocuments - Fetches stock documents with filtering by type, multi-select status, warehouse, and search.
 */
export function useStockDocuments(filters: DocumentFilterOptions) {
  return useQuery<StockDocumentRow[]>({
    queryKey: ['stock-documents', filters],
    queryFn: async () => {
      let query = supabase
        .from('stock_document')
        .select('*, warehouse!stock_document_warehouse_id_fkey(name, code)')
        .order('created_at', { ascending: false });

      if (filters.type) {
        query = query.eq('type', filters.type as DocumentType);
      }

      if (filters.statuses && filters.statuses.length > 0) {
        query = query.in('state', filters.statuses as DocumentState[]);
      }

      if (filters.warehouseId) {
        query = query.eq('warehouse_id', filters.warehouseId);
      }

      if (filters.search && filters.search.trim()) {
        const term = filters.search.trim();
        query = query.or(`reference.ilike.%${term}%,partner_name.ilike.%${term}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data ?? []).map((doc: any) => ({
        ...doc,
        warehouse: doc.warehouse ?? null,
      })) as StockDocumentRow[];
    },
  });
}

/**
 * useValidateDocument - Validates a document via validate_document RPC.
 * Automatically invalidates kpis so the dashboard updates immediately!
 */
export function useValidateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (docId: string) => {
      const { data, error } = await supabase.rpc('validate_document', {
        doc_id: docId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      queryClient.invalidateQueries({ queryKey: ['stock-documents'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-products'] });
    },
  });
}
