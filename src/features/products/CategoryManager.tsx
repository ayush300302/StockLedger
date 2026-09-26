import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Edit2, Check, X } from 'lucide-react';
import { Modal, Input, Button, Spinner } from '../../components/ui';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
} from '../../lib/queries/products';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ isOpen, onClose }) => {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createCategory.mutateAsync(newName.trim());
      setNewName('');
      toast.success('Category created');
    } catch (err: any) {
      const msg = err?.message ?? '';
      if (msg.includes('duplicate') || msg.includes('unique')) {
        toast.error('Category already exists');
      } else {
        toast.error('Failed to create category');
      }
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await updateCategory.mutateAsync({ id, name: editName.trim() });
      setEditingId(null);
      setEditName('');
      toast.success('Category renamed');
    } catch {
      toast.error('Failed to rename category');
    }
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Categories" size="sm">
      <div className="space-y-4">
        {/* Create new */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="New category name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={!newName.trim() || createCategory.isPending}
          >
            Add
          </Button>
        </div>

        {/* Existing list */}
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner size="md" className="text-brand-600" />
          </div>
        ) : categories.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">
            No categories yet. Create one above.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {categories.map((cat) => (
              <li key={cat.id} className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 transition-colors">
                {editingId === cat.id ? (
                  <>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdate(cat.id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      className="text-xs flex-1"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdate(cat.id)}
                      disabled={updateCategory.isPending}
                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                      title="Save"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1 text-slate-400 hover:bg-slate-100 rounded transition-colors"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-slate-800">{cat.name}</span>
                    <button
                      onClick={() => startEdit(cat.id, cat.name)}
                      className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                      title="Rename"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
