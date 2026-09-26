import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, SlidersHorizontal, Building2 } from 'lucide-react';
import { Button, Card, Badge, Spinner, EmptyState } from '../../components/ui';
import { FilterBar, type DocumentStateFilter } from '../../components/FilterBar';
import { useStockDocuments } from '../../lib/queries/operations';

function statusBadge(state: string) {
  switch (state) {
    case 'draft':
      return <Badge variant="neutral" size="sm">Draft</Badge>;
    case 'waiting':
      return <Badge variant="warning" size="sm">Waiting</Badge>;
    case 'ready':
      return <Badge variant="info" size="sm">Ready</Badge>;
    case 'done':
      return <Badge variant="success" size="sm">Done</Badge>;
    case 'canceled':
      return <Badge variant="danger" size="sm">Canceled</Badge>;
    default:
      return <Badge variant="neutral" size="sm">{state}</Badge>;
  }
}

export const AdjustmentsPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const statusParam = searchParams.get('status') || '';
  const statuses = statusParam ? (statusParam.split(',').filter(Boolean) as DocumentStateFilter[]) : [];
  const warehouse = searchParams.get('warehouse') || null;
  const category = searchParams.get('category') || null;

  const { data: documents = [], isLoading } = useStockDocuments({
    type: 'adjustment',
    statuses,
    warehouseId: warehouse,
    categoryId: category,
  });

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Inventory Adjustments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Reconcile physical inventory counts with ledger balances via inventory loss moves
          </p>
        </div>
        <Button size="sm" icon={<Plus className="w-4 h-4" />}>
          New Adjustment
        </Button>
      </div>

      {/* Reusable FilterBar */}
      <FilterBar fixedDocType="adjustment" hideDocType />

      {/* Documents List */}
      <Card bodyClassName="p-0">
        {isLoading ? (
          <div className="p-8 flex flex-col items-center justify-center">
            <Spinner size="md" className="text-brand-600 mb-2" />
            <p className="text-xs text-slate-500">Loading adjustments...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<SlidersHorizontal className="w-8 h-8 text-slate-400" />}
              title="No Adjustments Found"
              description={
                statuses.length > 0 || warehouse
                  ? "No adjustment records match your current active filters."
                  : "No inventory adjustments have been recorded yet."
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 pl-4 pr-3">Reference</th>
                  <th className="py-3 px-3">Warehouse</th>
                  <th className="py-3 px-3">Notes</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 pl-3 pr-4 text-right">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer">
                    <td className="py-3 pl-4 pr-3 font-mono font-bold text-slate-900">
                      {doc.reference}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{doc.warehouse?.name || 'Central WH'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-500 italic">
                      {doc.notes || 'Routine physical stock count'}
                    </td>
                    <td className="py-3 px-3 text-center">{statusBadge(doc.state)}</td>
                    <td className="py-3 pl-3 pr-4 text-right text-slate-400">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
