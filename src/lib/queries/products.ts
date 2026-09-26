import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Database } from '../database.types';

type Product = Database['public']['Tables']['product']['Row'];
type ProductInsert = Database['public']['Tables']['product']['Insert'];
type ProductUpdate = Database['public']['Tables']['product']['Update'];
type Category = Database['public']['Tables']['product_category']['Row'];
type Location = Database['public']['Tables']['location']['Row'];

/** Product row enriched with category name and aggregated on-hand qty */
export interface ProductWithStock extends Product {
  category_name: string | null;
  on_hand: number;
}

// ─── Products ────────────────────────────────────────────────────────────────

export function useProducts(search: string, categoryId: string | null) {
  return useQuery<ProductWithStock[]>({
    queryKey: ['products', { search, categoryId }],
    queryFn: async () => {
      // 1. Fetch products joined with category
      let query = supabase
        .from('product')
        .select('*, product_category!product_category_id_fkey(name)')
        .order('created_at', { ascending: false });

      if (search.trim()) {
        query = query.or(`name.ilike.%${search.trim()}%,sku.ilike.%${search.trim()}%`);
      }
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data: products, error } = await query;
      if (error) throw error;

      // 2. Fetch all on-hand quantities from the derived view
      const { data: stockRows, error: stockErr } = await supabase
        .from('stock_on_hand')
        .select('product_id, qty');
      if (stockErr) throw stockErr;

      // Aggregate per product (sum across all locations)
      const onHandMap = new Map<string, number>();
      for (const row of stockRows ?? []) {
        onHandMap.set(row.product_id, (onHandMap.get(row.product_id) ?? 0) + row.qty);
      }

      return (products ?? []).map((p) => ({
        ...p,
        category_name: (p as any).product_category?.name ?? null,
        on_hand: onHandMap.get(p.id) ?? 0,
      })) as ProductWithStock[];
    },
  });
}

export function useProduct(id: string | undefined) {
  return useQuery<ProductWithStock | null>({
    queryKey: ['products', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product')
        .select('*, product_category!product_category_id_fkey(name)')
        .eq('id', id!)
        .single();
      if (error) throw error;

      const { data: stockRows, error: stockErr } = await supabase
        .from('stock_on_hand')
        .select('qty')
        .eq('product_id', id!);
      if (stockErr) throw stockErr;

      const on_hand = (stockRows ?? []).reduce((s, r) => s + r.qty, 0);

      return {
        ...data,
        category_name: (data as any).product_category?.name ?? null,
        on_hand,
      } as ProductWithStock;
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: ProductInsert) => {
      const { data, error } = await supabase.from('product').insert(values).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: ProductUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('product')
        .update(values)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ─── Initial stock via the create_adjustment RPC ─────────────────────────────

export function useCreateInitialStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      product_id,
      location_id,
      counted_qty,
    }: {
      product_id: string;
      location_id: string;
      counted_qty: number;
    }) => {
      const { data, error } = await supabase.rpc('create_adjustment', {
        product_id,
        location_id,
        counted_qty,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ─── Categories ──────────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_category')
        .select('*')
        .order('name');
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('product_category')
        .insert({ name })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from('product_category')
        .update({ name })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ─── Locations (for initial stock selector) ──────────────────────────────────

export function useInternalLocations() {
  return useQuery<Location[]>({
    queryKey: ['locations', 'internal'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('location')
        .select('*')
        .eq('type', 'internal')
        .order('name');
      if (error) throw error;
      return data ?? [];
    },
  });
}
