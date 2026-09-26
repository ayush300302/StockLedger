import React from 'react';
import { Button, Card } from '../../components/ui';
import { Plus } from 'lucide-react';

export const ProductListPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Products</h1>
          <p className="text-xs text-slate-500 mt-1">Manage SKUs, categories, and derive stock on hand</p>
        </div>
        <Button size="sm" icon={<Plus className="w-4 h-4" />}>
          Create Product
        </Button>
      </div>

      <Card>
        <p className="text-xs text-slate-500">Product list table placeholder.</p>
      </Card>
    </div>
  );
};
