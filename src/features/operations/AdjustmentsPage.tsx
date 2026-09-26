import React from 'react';
import { Button, Card } from '../../components/ui';
import { Plus } from 'lucide-react';

export const AdjustmentsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Inventory Adjustments</h1>
          <p className="text-xs text-slate-500 mt-1">Reconcile physical counts with ledger stock</p>
        </div>
        <Button size="sm" icon={<Plus className="w-4 h-4" />}>
          New Adjustment
        </Button>
      </div>
      <Card>
        <p className="text-xs text-slate-500">Inventory adjustments placeholder.</p>
      </Card>
    </div>
  );
};
