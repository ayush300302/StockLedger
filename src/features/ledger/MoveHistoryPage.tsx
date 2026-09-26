import React from 'react';
import { Card } from '../../components/ui';

export const MoveHistoryPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Move History</h1>
        <p className="text-xs text-slate-500 mt-1">Append-only audit trail of all executed stock moves</p>
      </div>
      <Card>
        <p className="text-xs text-slate-500">Stock move history ledger table placeholder.</p>
      </Card>
    </div>
  );
};
