import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Modal, Input, Select, Button } from '../../components/ui';
import {
  useCategories,
  useCreateCategory,
  useCreateProduct,
  useUpdateProduct,
  useCreateInitialStock,
  useInternalLocations,
  type ProductWithStock,
} from '../../lib/queries/products';
import { useAuth } from '../auth/AuthContext';
import { Plus } from 'lucide-react';

const UOM_OPTIONS = [
  { value: 'Units', label: 'Units' },
  { value: 'kg', label: 'kg' },
  { value: 'Litre', label: 'Litre' },
  { value: 'Box', label: 'Box' },
  { value: 'Metre', label: 'Metre' },
];

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductWithStock | null; // null → create, defined → edit
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const isEdit = !!product;
  const { session } = useAuth();

  // ─── Form state ──────────────────────────────────
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [uom, setUom] = useState('Units');
  const [reorderMin, setReorderMin] = useState('0');
  const [reorderMax, setReorderMax] = useState('');
  const [initialStock, setInitialStock] = useState('');
  const [locationId, setLocationId] = useState('');
  const [inlineCategory, setInlineCategory] = useState('');
  const [showInlineCategory, setShowInlineCategory] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Queries & mutations ─────────────────────────
  const { data: categories = [] } = useCategories();
  const { data: locations = [] } = useInternalLocations();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const createInitialStock = useCreateInitialStock();
  const createCategory = useCreateCategory();

  // ─── Reset on open / product change ──────────────
  useEffect(() => {
    if (isOpen) {
      if (product) {
        setName(product.name);
        setSku(product.sku);
        setCategoryId(product.category_id ?? '');
        setUom(product.uom);
        setReorderMin(String(product.reorder_min ?? 0));
        setReorderMax(product.reorder_max != null ? String(product.reorder_max) : '');
      } else {
        setName('');
        setSku('');
        setCategoryId('');
        setUom('Units');
        setReorderMin('0');
        setReorderMax('');
        setInitialStock('');
        setLocationId('');
      }
      setErrors({});
      setInlineCategory('');
      setShowInlineCategory(false);
    }
  }, [isOpen, product]);

  // Auto-select first location
  useEffect(() => {
    if (!isEdit && locations.length > 0 && !locationId) {
      setLocationId(locations[0].id);
    }
  }, [locations, isEdit, locationId]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!sku.trim()) e.sku = 'SKU is required';
    if (!isEdit && initialStock && Number(initialStock) > 0 && !locationId) {
      e.locationId = 'Select a location for initial stock';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      if (isEdit) {
        await updateProduct.mutateAsync({
          id: product!.id,
          name: name.trim(),
          sku: sku.trim().toUpperCase(),
          category_id: categoryId || null,
          uom,
          reorder_min: Number(reorderMin) || 0,
          reorder_max: reorderMax ? Number(reorderMax) : null,
        });
        toast.success('Product updated');
      } else {
        const created = await createProduct.mutateAsync({
          name: name.trim(),
          sku: sku.trim().toUpperCase(),
          category_id: categoryId || null,
          uom,
          reorder_min: Number(reorderMin) || 0,
          reorder_max: reorderMax ? Number(reorderMax) : null,
          created_by: session?.user.id ?? null,
        });

        // Create initial stock via ledger adjustment
        const qty = Number(initialStock);
        if (qty > 0 && locationId) {
          await createInitialStock.mutateAsync({
            product_id: created.id,
            location_id: locationId,
            counted_qty: qty,
          });
        }

        toast.success('Product created');
      }
      onClose();
    } catch (err: any) {
      const msg = err?.message ?? '';
      if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('sku')) {
        setErrors((prev) => ({ ...prev, sku: 'This SKU already exists' }));
      } else {
        toast.error(msg || 'Something went wrong');
      }
    }
  };

  const handleInlineCategoryCreate = async () => {
    if (!inlineCategory.trim()) return;
    try {
      const cat = await createCategory.mutateAsync(inlineCategory.trim());
      setCategoryId(cat.id);
      setInlineCategory('');
      setShowInlineCategory(false);
      toast.success(`Category "${cat.name}" created`);
    } catch {
      toast.error('Failed to create category');
    }
  };

  const busy =
    createProduct.isPending || updateProduct.isPending || createInitialStock.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Product' : 'Create Product'} size="md">
      <div className="space-y-4">
        {/* Name */}
        <Input
          label="Product Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          placeholder="e.g. Steel Plate 6mm"
        />

        {/* SKU */}
        <Input
          label="SKU"
          required
          value={sku}
          onChange={(e) => setSku(e.target.value.toUpperCase())}
          error={errors.sku}
          placeholder="e.g. STL-001"
          disabled={isEdit}
          helperText={isEdit ? 'SKU cannot be changed after creation' : undefined}
        />

        {/* Category */}
        <div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Select
                label="Category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <button
              type="button"
              onClick={() => setShowInlineCategory(!showInlineCategory)}
              className="mb-0.5 p-1.5 rounded-md border border-slate-300 text-slate-500 hover:text-brand-600 hover:border-brand-400 transition-colors"
              title="Create new category"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {showInlineCategory && (
            <div className="flex items-center gap-2 mt-2">
              <Input
                placeholder="New category name"
                value={inlineCategory}
                onChange={(e) => setInlineCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInlineCategoryCreate()}
                className="text-xs"
              />
              <Button
                size="sm"
                onClick={handleInlineCategoryCreate}
                disabled={!inlineCategory.trim() || createCategory.isPending}
              >
                Add
              </Button>
            </div>
          )}
        </div>

        {/* UoM */}
        <Select
          label="Unit of Measure"
          value={uom}
          onChange={(e) => setUom(e.target.value)}
          options={UOM_OPTIONS}
        />

        {/* Reorder Min / Max */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Reorder Min"
            type="number"
            min="0"
            value={reorderMin}
            onChange={(e) => setReorderMin(e.target.value)}
            helperText="Low-stock threshold"
          />
          <Input
            label="Reorder Max"
            type="number"
            min="0"
            value={reorderMax}
            onChange={(e) => setReorderMax(e.target.value)}
            helperText="Target quantity"
          />
        </div>

        {/* Initial Stock (create only) */}
        {!isEdit && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-700 mb-2">Opening Balance</p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Initial Quantity"
                type="number"
                min="0"
                value={initialStock}
                onChange={(e) => setInitialStock(e.target.value)}
                helperText="Creates a ledger adjustment"
              />
              <Select
                label="Location"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                error={errors.locationId}
              >
                <option value="">— Select —</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={busy}>
            {busy ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
