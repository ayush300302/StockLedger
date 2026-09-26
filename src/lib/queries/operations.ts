import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Database, DocumentType, DocumentState } from '../database.types';
import toast from 'react-hot-toast';

export type StockDocumentRow = Database['public']['Tables']['stock_document']['Row'] & {
  warehouse?: { name: string; code: string } | null;
  moves_count?: number;
};

export type StockMoveRow = Database['public']['Tables']['stock_move']['Row'] & {
  product?: { name: string; sku: string; uom: string } | null;
  from_location?: { name: string; code: string; type: string } | null;
  to_location?: { name: string; code: string; type: string } | null;
  available_qty?: number;
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
        .select('*, warehouse!stock_document_warehouse_id_fkey(name, code), stock_move(count)')
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
        moves_count: doc.stock_move ? doc.stock_move[0]?.count ?? 0 : 0,
      })) as StockDocumentRow[];
    },
  });
}

/**
 * useStockDocument - Fetches a single document by ID along with its moves.
 */
export function useStockDocument(docId: string | undefined) {
  return useQuery({
    queryKey: ['stock-document', docId],
    enabled: !!docId,
    queryFn: async () => {
      if (!docId) return null;

      const { data: doc, error: docError } = await supabase
        .from('stock_document')
        .select('*, warehouse!stock_document_warehouse_id_fkey(name, code), profiles!stock_document_validated_by_fkey(name)')
        .eq('id', docId)
        .single();

      if (docError) throw docError;

      const { data: moves, error: movesError } = await supabase
        .from('stock_move')
        .select('*, product(name, sku, uom), from_location:from_location_id(name, code, type), to_location:to_location_id(name, code, type)')
        .eq('document_id', docId)
        .order('created_at', { ascending: true });

      if (movesError) throw movesError;

      return {
        ...doc,
        validated_by_profile: (doc as any).profiles ?? null,
        moves: (moves ?? []).map((m: any) => ({
          ...m,
          product: m.product ?? null,
          from_location: m.from_location ?? null,
          to_location: m.to_location ?? null,
        })) as StockMoveRow[],
      };
    },
  });
}

/**
 * useCreateDocument - Creates a new draft document using next_reference RPC.
 */
export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      type: DocumentType;
      partner_name?: string | null;
      warehouse_id?: string | null;
      scheduled_date?: string | null;
      notes?: string | null;
    }) => {
      const { data: reference, error: refError } = await supabase.rpc('next_reference', {
        doc_type: payload.type,
      });

      if (refError) throw refError;

      const { data: doc, error: docError } = await supabase
        .from('stock_document')
        .insert({
          reference: reference || `WH/${payload.type.toUpperCase()}/0001`,
          type: payload.type,
          state: 'draft',
          partner_name: payload.partner_name || null,
          warehouse_id: payload.warehouse_id || null,
          scheduled_date: payload.scheduled_date || null,
          notes: payload.notes || null,
        })
        .select()
        .single();

      if (docError) throw docError;
      return doc;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-documents'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    },
  });
}

/**
 * useUpdateDocumentState - Transition state (draft -> waiting -> ready -> canceled).
 */
export function useUpdateDocumentState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ docId, state }: { docId: string; state: DocumentState }) => {
      if (state === 'canceled') {
        const { data, error } = await supabase.rpc('cancel_document', { doc_id: docId });
        if (error) throw error;
        return data;
      }

      const { data, error } = await supabase
        .from('stock_document')
        .update({ state })
        .eq('id', docId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success(`Document state updated to ${variables.state}`);
      queryClient.invalidateQueries({ queryKey: ['stock-documents'] });
      queryClient.invalidateQueries({ queryKey: ['stock-document', variables.docId] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update document state');
    },
  });
}

/**
 * useAddMoveLine - Adds a move line to a document.
 */
export function useAddMoveLine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      document_id: string;
      product_id: string;
      qty: number;
      from_location_id: string;
      to_location_id: string;
    }) => {
      const { data, error } = await supabase
        .from('stock_move')
        .insert({
          document_id: payload.document_id,
          product_id: payload.product_id,
          qty: payload.qty,
          from_location_id: payload.from_location_id,
          to_location_id: payload.to_location_id,
          state: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stock-document', variables.document_id] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add line item');
    },
  });
}

/**
 * useDeleteMoveLine - Removes a move line from a document.
 */
export function useDeleteMoveLine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ moveId, docId }: { moveId: string; docId: string }) => {
      const { error } = await supabase.from('stock_move').delete().eq('id', moveId);
      if (error) throw error;
      return { moveId, docId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stock-document', variables.docId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove line item');
    },
  });
}

/**
 * useLocations - Fetches locations for selector options.
 */
export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('location')
        .select('*, warehouse(name, code)')
        .order('name', { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });
}
