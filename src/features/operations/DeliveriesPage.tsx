import React from 'react';
import { Button, Card } from '../../components/ui';
import { Plus } from 'lucide-react';

export const DeliveriesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Stock Deliveries (Out)</h1>
          <p className="text-xs text-slate-500 mt-1">Deliver stock from internal locations to customers</p>
        </div>
        <Button size="sm" icon={<Plus className="w-4 h-4" />}>
          New Delivery
        </Button>
      </div>
      <Card>
        <p className="text-xs text-slate-500">Deliveries documents placeholder.</p>
      </Card>
    </div>
  );
};
