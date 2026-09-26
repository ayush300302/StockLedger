import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { Card, Badge, Button, Spinner } from '../../components/ui';
import { useProduct, type ProductWithStock } from '../../lib/queries/products';
import { ProductFormModal } from './ProductFormModal';

function stockBadge(onHand: number, reorderMin: number) {
  if (onHand === 0)
    return <Badge variant="danger">Out of Stock</Badge>;
  if (onHand <= reorderMin)
    return <Badge variant="warning">Low Stock</Badge>;
  return <Badge variant="success">In Stock</Badge>;
}

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProduct(id);
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spinner size="lg" className="text-brand-600 mb-3" />
        <p className="text-xs text-slate-500">Loading product…</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-slate-500">Product not found.</p>
        <Button variant="ghost" size="sm" className="mt-3" onClick={() => navigate('/products')}>
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/products')}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">{product.name}</h1>
            {stockBadge(product.on_hand, product.reorder_min)}
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">{product.sku}</p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          icon={<Edit2 className="w-4 h-4" />}
          onClick={() => setEditOpen(true)}
        >
          Edit
        </Button>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card title="On Hand">
          <p className="text-2xl font-bold text-slate-900 font-mono">
            {product.on_hand.toLocaleString()}
            <span className="text-xs text-slate-500 font-sans ml-1">{product.uom}</span>
          </p>
        </Card>
        <Card title="Category">
          <p className="text-sm text-slate-700">{product.category_name ?? '—'}</p>
        </Card>
        <Card title="Reorder Point">
          <p className="text-sm text-slate-700">
            Min: <span className="font-semibold">{product.reorder_min}</span>
            {product.reorder_max != null && (
              <span className="ml-3">
                Max: <span className="font-semibold">{product.reorder_max}</span>
              </span>
            )}
          </p>
        </Card>
      </div>

      {/* Edit modal */}
      <ProductFormModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        product={product}
      />
    </div>
  );
};
