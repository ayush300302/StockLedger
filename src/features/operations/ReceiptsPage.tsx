import React from 'react';
import { Button, Card } from '../../components/ui';
import { Plus } from 'lucide-react';

export const ReceiptsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Stock Receipts (In)</h1>
          <p className="text-xs text-slate-500 mt-1">Receive stock from vendors into internal locations</p>
        </div>
        <Button size="sm" icon={<Plus className="w-4 h-4" />}>
          New Receipt
        </Button>
      </div>
      <Card>
        <p className="text-xs text-slate-500">Receipts documents placeholder.</p>
      </Card>
    </div>
  );
};
