import React from 'react';
import { Card, Button } from '../../components/ui';
import { Plus } from 'lucide-react';

export const WarehousesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Warehouses & Locations</h1>
          <p className="text-xs text-slate-500 mt-1">Configure physical and virtual stock locations</p>
        </div>
        <Button size="sm" icon={<Plus className="w-4 h-4" />}>
          Add Warehouse
        </Button>
      </div>
      <Card>
        <p className="text-xs text-slate-500">Warehouse configuration placeholder.</p>
      </Card>
    </div>
  );
};
