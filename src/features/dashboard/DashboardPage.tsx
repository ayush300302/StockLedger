import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ArrowDownRight,
  ArrowUpRight,
  ArrowRightLeft,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Boxes,
} from 'lucide-react';
import { Card, Badge, Button } from '../../components/ui';
import { useDashboardKpis, useLowStockProducts } from '../../lib/queries/dashboard';
import { clsx } from 'clsx';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: kpis, isLoading: kpisLoading } = useDashboardKpis();
  const { data: lowStockProducts = [], isLoading: lowStockLoading } = useLowStockProducts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Inventory Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time ledger metrics derived dynamically from verified movements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={<Boxes className="w-3.5 h-3.5 text-slate-600" />}
            onClick={() => navigate('/products')}
          >
            Product Catalog
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={<ArrowDownRight className="w-3.5 h-3.5" />}
            onClick={() => navigate('/operations/receipts')}
          >
            New Receipt
          </Button>
        </div>
      </div>

      {/* 5 KPI Cards in a Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpisLoading ? (
          // Skeleton loader — never show 0 while loading!
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm animate-pulse flex flex-col justify-between h-32"
            >
              <div className="flex items-center justify-between">
                <div className="h-3.5 bg-slate-200 rounded w-24"></div>
                <div className="w-8 h-8 rounded-lg bg-slate-200"></div>
              </div>
              <div className="h-7 bg-slate-200 rounded w-16 my-2"></div>
              <div className="h-3 bg-slate-100 rounded w-32"></div>
            </div>
          ))
        ) : (
          <>
            {/* Card 1: Total Products in Stock */}
            <div
              onClick={() => navigate('/products')}
              className="group bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-brand-400 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-slate-600 group-hover:text-brand-600 transition-colors">
                  Total Products in Stock
                </span>
                <div className="p-2 rounded-lg bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="my-2">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {kpis?.total_products_in_stock ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>SKUs with qty &gt; 0</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Card 2: Low Stock / Out of Stock (shows both numbers, amber & red) */}
            <div
              onClick={() => {
                const el = document.getElementById('low-stock-panel');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/products');
                }
              }}
              className="group bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-slate-600 group-hover:text-amber-700 transition-colors">
                  Low Stock / Out of Stock
                </span>
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="my-2 flex items-baseline gap-2">
                {/* Amber: Low Stock */}
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-extrabold text-amber-600 tracking-tight">
                    {kpis?.low_stock ?? 0}
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.5 rounded uppercase">
                    Low
                  </span>
                </div>
                <span className="text-slate-300 font-light text-lg">/</span>
                {/* Red: Out of Stock */}
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-extrabold text-rose-600 tracking-tight">
                    {kpis?.out_of_stock ?? 0}
                  </span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1 py-0.5 rounded uppercase">
                    Out
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Requires reorder attention</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Card 3: Pending Receipts */}
            <div
              onClick={() => navigate('/operations/receipts?status=draft,waiting,ready')}
              className="group bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-slate-600 group-hover:text-emerald-700 transition-colors">
                  Pending Receipts
                </span>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
              <div className="my-2">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {kpis?.pending_receipts ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Draft, waiting or ready</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Card 4: Pending Deliveries */}
            <div
              onClick={() => navigate('/operations/deliveries?status=draft,waiting,ready')}
              className="group bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-slate-600 group-hover:text-blue-700 transition-colors">
                  Pending Deliveries
                </span>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="my-2">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {kpis?.pending_deliveries ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Orders awaiting dispatch</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Card 5: Internal Transfers Scheduled */}
            <div
              onClick={() => navigate('/operations/internal?status=draft,waiting,ready')}
              className="group bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-slate-600 group-hover:text-indigo-700 transition-colors">
                  Internal Transfers
                </span>
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
              </div>
              <div className="my-2">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {kpis?.internal_transfers_scheduled ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Location rebalancing</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* LowStockAlert Panel */}
      <div id="low-stock-panel">
        <Card
          title={
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Low Stock & Reorder Alerts</span>
              {!lowStockLoading && lowStockProducts.length > 0 && (
                <span className="ml-1.5 px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-100 text-amber-800">
                  {lowStockProducts.length}
                </span>
              )}
            </div>
          }
          subtitle="Products currently at or below their configured minimum reorder threshold"
          action={
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate('/products')}
              className="text-xs text-slate-600 hover:text-slate-900"
            >
              Manage Products
            </Button>
          }
        >
          {lowStockLoading ? (
            <div className="space-y-2 py-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-md animate-pulse"></div>
              ))}
            </div>
          ) : lowStockProducts.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">Inventory Levels are Optimal</p>
              <p className="text-xs text-slate-500 mt-0.5 max-w-sm">
                No products are currently at or below their reorder minimum. All stock is well-balanced.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 -my-4">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 pl-4 pr-3">Product / SKU</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Current Stock</th>
                    <th className="py-2.5 px-3 text-right">Reorder Min</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 pl-3 pr-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {lowStockProducts.map((p) => {
                    const isOutOfStock = p.on_hand === 0;
                    return (
                      <tr
                        key={p.id}
                        onClick={() => navigate(`/products/${p.id}`)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                      >
                        <td className="py-3 pl-4 pr-3">
                          <div className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                            {p.name}
                          </div>
                          <div className="font-mono text-[11px] text-slate-400">{p.sku}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-slate-600">
                            {p.category_name ?? '—'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span
                            className={clsx(
                              'font-bold font-mono text-sm',
                              isOutOfStock ? 'text-rose-600' : 'text-amber-600'
                            )}
                          >
                            {p.on_hand}
                          </span>{' '}
                          <span className="text-slate-400 text-[11px]">{p.uom}</span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-600">
                          {p.reorder_min} {p.uom}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {isOutOfStock ? (
                            <Badge variant="danger" size="sm">
                              Out of Stock
                            </Badge>
                          ) : (
                            <Badge variant="warning" size="sm">
                              Low Stock
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 pl-3 pr-4 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 group-hover:text-brand-700 group-hover:underline">
                            <span>Details</span>
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Navigation to Operation Lists */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/operations/receipts')}
          className="p-4 rounded-lg bg-white border border-slate-200 hover:border-slate-300 shadow-sm cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Receipts (In)</h4>
              <p className="text-[11px] text-slate-500">Inbound purchase orders & vendor delivery</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </div>

        <div
          onClick={() => navigate('/operations/deliveries')}
          className="p-4 rounded-lg bg-white border border-slate-200 hover:border-slate-300 shadow-sm cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Deliveries (Out)</h4>
              <p className="text-[11px] text-slate-500">Customer dispatches & outbound sales</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </div>

        <div
          onClick={() => navigate('/operations/internal')}
          className="p-4 rounded-lg bg-white border border-slate-200 hover:border-slate-300 shadow-sm cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Internal Transfers</h4>
              <p className="text-[11px] text-slate-500">Inter-warehouse & bin relocations</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};
