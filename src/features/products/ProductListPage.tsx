import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Settings2 } from 'lucide-react';
import { Button, Badge, Input, Select } from '../../components/ui';
import { Table, type Column } from '../../components/ui/Table';
import { useProducts, useCategories, type ProductWithStock } from '../../lib/queries/products';
import { ProductFormModal } from './ProductFormModal';
import { CategoryManager } from './CategoryManager';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function stockBadge(onHand: number, reorderMin: number) {
  if (onHand === 0)
    return <Badge variant="danger" size="sm">Out of Stock</Badge>;
  if (onHand <= reorderMin)
    return <Badge variant="warning" size="sm">Low Stock</Badge>;
  return <Badge variant="success" size="sm">In Stock</Badge>;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const ProductListPage: React.FC = () => {
  const navigate = useNavigate();

  // Search with 300ms debounce
  const [rawSearch, setRawSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    timerRef.current = setTimeout(() => setDebouncedSearch(rawSearch), 300);
    return () => clearTimeout(timerRef.current);
  }, [rawSearch]);

  // Category filter
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductWithStock | null>(null);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);

  // Queries
  const { data: products = [], isLoading } = useProducts(debouncedSearch, categoryFilter || null);
  const { data: categories = [] } = useCategories();

  const openCreate = useCallback(() => {
    setEditProduct(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((p: ProductWithStock) => {
    setEditProduct(p);
    setModalOpen(true);
  }, []);

  // ─── Table columns ────────────────────────────────
  const columns: Column<ProductWithStock>[] = [
    {
      key: 'sku',
      header: 'SKU',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-slate-800">{row.sku}</span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <span className="text-sm font-medium text-slate-900">{row.name}</span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => (
        <span className="text-xs text-slate-600">{row.category_name ?? '—'}</span>
      ),
    },
    {
      key: 'uom',
      header: 'UoM',
      render: (row) => <span className="text-xs text-slate-600">{row.uom}</span>,
    },
    {
      key: 'on_hand',
      header: 'On Hand',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-sm font-semibold text-slate-800">
          {row.on_hand.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => stockBadge(row.on_hand, row.reorder_min),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Products</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage SKUs, categories, and derive stock on hand
          </p>
        </div>
        <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
          Create Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-end gap-3">
        <div className="flex-1 max-w-xs">
          <Input
            placeholder="Search by name or SKU…"
            value={rawSearch}
            onChange={(e) => setRawSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="w-48">
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={<Settings2 className="w-4 h-4" />}
          onClick={() => setCategoryManagerOpen(true)}
        >
          Categories
        </Button>
      </div>

      {/* Table */}
      <Table<ProductWithStock>
        columns={columns}
        data={products}
        loading={isLoading}
        rowKey={(row) => row.id}
        onRowClick={(row) => navigate(`/products/${row.id}`)}
        emptyTitle="No products yet"
        emptyDescription="Start by creating your first product. Stock quantities are derived from the ledger automatically."
        emptyAction={
          <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
            Create Product
          </Button>
        }
      />

      {/* Form modal */}
      <ProductFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={editProduct}
      />

      {/* Category manager modal */}
      <CategoryManager
        isOpen={categoryManagerOpen}
        onClose={() => setCategoryManagerOpen(false)}
      />
    </div>
  );
};
