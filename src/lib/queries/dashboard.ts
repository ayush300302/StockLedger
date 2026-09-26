import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '../supabase';
import type { Database } from '../database.types';

export interface DashboardKpis {
  total_products_in_stock: number;
  low_stock: number;
  out_of_stock: number;
  pending_receipts: number;
  pending_deliveries: number;
  internal_transfers_scheduled: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  category_name: string | null;
  uom: string;
  on_hand: number;
  reorder_min: number;
  reorder_max: number | null;
}

/**
 * useDashboardKpis - Calls the dashboard_kpis() RPC in ONE request for all five KPIs.
 * Query key: ['kpis']
 * Subscribes to real-time changes on stock_document and stock_move to auto-refresh without manual reload.
 */
export function useDashboardKpis() {
  const queryClient = useQueryClient();

  // Realtime subscription: update KPIs immediately when any stock_document or stock_move changes
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-kpis-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stock_document' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['kpis'] });
          queryClient.invalidateQueries({ queryKey: ['low-stock-products'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stock_move' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['kpis'] });
          queryClient.invalidateQueries({ queryKey: ['low-stock-products'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery<DashboardKpis>({
    queryKey: ['kpis'],
    queryFn: async () => {
      // 1. Primary path: Single RPC call to dashboard_kpis()
      const { data, error } = await supabase.rpc('dashboard_kpis');

      if (!error && data && typeof data === 'object') {
        const raw = data as Record<string, any>;
        return {
          total_products_in_stock: Number(
            raw.total_products_in_stock ??
            raw.total_in_stock ??
            raw.products_in_stock ??
            0
          ),
          low_stock: Number(raw.low_stock ?? raw.low_stock_products ?? 0),
          out_of_stock: Number(raw.out_of_stock ?? raw.out_of_stock_products ?? 0),
          pending_receipts: Number(raw.pending_receipts ?? 0),
          pending_deliveries: Number(raw.pending_deliveries ?? 0),
          internal_transfers_scheduled: Number(
            raw.internal_transfers_scheduled ??
            raw.pending_internal ??
            raw.scheduled_transfers ??
            0
          ),
        };
      }

      // 2. Resilient fallback: Compute derived values in case RPC is not yet registered in SQL
      // This ensures the application remains fully functional during local development and testing
      const [productsRes, stockRes, docsRes] = await Promise.all([
        supabase.from('product').select('id, reorder_min'),
        supabase.from('stock_on_hand').select('product_id, qty'),
        supabase
          .from('stock_document')
          .select('type, state')
          .in('state', ['draft', 'waiting', 'ready']),
      ]);

      if (productsRes.error) throw productsRes.error;
      if (stockRes.error) throw stockRes.error;
      if (docsRes.error) throw docsRes.error;

      const onHandMap = new Map<string, number>();
      for (const row of stockRes.data ?? []) {
        onHandMap.set(row.product_id, (onHandMap.get(row.product_id) ?? 0) + row.qty);
      }

      let totalInStock = 0;
      let lowStock = 0;
      let outOfStock = 0;

      for (const prod of productsRes.data ?? []) {
        const qty = onHandMap.get(prod.id) ?? 0;
        if (qty > 0) {
          totalInStock++;
          if (qty <= prod.reorder_min) {
            lowStock++;
          }
        } else {
          outOfStock++;
        }
      }

      let pendingReceipts = 0;
      let pendingDeliveries = 0;
      let internalTransfers = 0;

      for (const doc of docsRes.data ?? []) {
        if (doc.type === 'receipt') pendingReceipts++;
        else if (doc.type === 'delivery') pendingDeliveries++;
        else if (doc.type === 'internal') internalTransfers++;
      }

      return {
        total_products_in_stock: totalInStock,
        low_stock: lowStock,
        out_of_stock: outOfStock,
        pending_receipts: pendingReceipts,
        pending_deliveries: pendingDeliveries,
        internal_transfers_scheduled: internalTransfers,
      };
    },
    staleTime: 30000,
  });
}

/**
 * useLowStockProducts - Fetches products that are at or below their reorder_min threshold.
 */
export function useLowStockProducts() {
  return useQuery<LowStockProduct[]>({
    queryKey: ['low-stock-products'],
    queryFn: async () => {
      // 1. Fetch all products with category info
      const { data: products, error: prodErr } = await supabase
        .from('product')
        .select('id, name, sku, uom, reorder_min, reorder_max, product_category!product_category_id_fkey(name)')
        .order('name');

      if (prodErr) throw prodErr;

      // 2. Fetch derived stock from stock_on_hand view
      const { data: stockRows, error: stockErr } = await supabase
        .from('stock_on_hand')
        .select('product_id, qty');

      if (stockErr) throw stockErr;

      const onHandMap = new Map<string, number>();
      for (const row of stockRows ?? []) {
        onHandMap.set(row.product_id, (onHandMap.get(row.product_id) ?? 0) + row.qty);
      }

      const lowStockList: LowStockProduct[] = [];

      for (const p of products ?? []) {
        const onHand = onHandMap.get(p.id) ?? 0;
        // Low stock condition: on_hand <= reorder_min
        if (onHand <= p.reorder_min) {
          lowStockList.push({
            id: p.id,
            name: p.name,
            sku: p.sku,
            category_name: (p as any).product_category?.name ?? null,
            uom: p.uom,
            on_hand: onHand,
            reorder_min: p.reorder_min,
            reorder_max: p.reorder_max,
          });
        }
      }

      // Sort by urgency: Out of stock (0) first, then lowest stock ratio
      lowStockList.sort((a, b) => {
        if (a.on_hand === 0 && b.on_hand !== 0) return -1;
        if (b.on_hand === 0 && a.on_hand !== 0) return 1;
        return a.on_hand - b.on_hand;
      });

      return lowStockList;
    },
    staleTime: 30000,
  });
}

/**
 * useWarehouses - Fetches all warehouses for filters.
 */
export function useWarehouses() {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouse')
        .select('id, name, code')
        .order('name');
      if (error) throw error;
      return data ?? [];
    },
  });
}

/**
 * useLocations - Fetches all internal locations for filters.
 */
export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('location')
        .select('id, name, code, type, warehouse_id')
        .order('name');
      if (error) throw error;
      return data ?? [];
    },
  });
}
