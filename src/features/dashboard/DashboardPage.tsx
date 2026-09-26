import React from 'react';
import { Card } from '../../components/ui';
import { Package, ArrowDownRight, ArrowUpRight, AlertTriangle } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">Real-time overview of inventory and warehouse movements</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card bodyClassName="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-brand-50 text-brand-600">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total SKUs</p>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">0</h3>
          </div>
        </Card>

        <Card bodyClassName="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
            <ArrowDownRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Pending Receipts</p>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">0</h3>
          </div>
        </Card>

        <Card bodyClassName="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Pending Deliveries</p>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">0</h3>
          </div>
        </Card>

        <Card bodyClassName="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Low Stock SKUs</p>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">0</h3>
          </div>
        </Card>
      </div>

      <Card title="Recent Operations">
        <p className="text-xs text-slate-500">No recent operations logged.</p>
      </Card>
    </div>
  );
};
