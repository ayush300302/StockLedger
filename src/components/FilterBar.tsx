import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  X,
  ChevronDown,
  RotateCcw,
  Check,
  Building2,
  Tag,
  FileText,
  Activity,
} from 'lucide-react';
import { useWarehouses, useLocations } from '../lib/queries/dashboard';
import { useCategories } from '../lib/queries/products';
import { clsx } from 'clsx';

export type DocumentTypeFilter = 'receipt' | 'delivery' | 'internal' | 'adjustment';
export type DocumentStateFilter = 'draft' | 'waiting' | 'ready' | 'done' | 'canceled';

export interface FilterBarProps {
  /** If specified, locks or defaults the document type filter (e.g. for ReceiptsPage) */
  fixedDocType?: DocumentTypeFilter;
  /** Whether to hide the document type selector entirely */
  hideDocType?: boolean;
  className?: string;
}

const DOCUMENT_TYPES: { label: string; value: DocumentTypeFilter }[] = [
  { label: 'Receipts', value: 'receipt' },
  { label: 'Delivery Orders', value: 'delivery' },
  { label: 'Internal Transfers', value: 'internal' },
  { label: 'Adjustments', value: 'adjustment' },
];

const DOCUMENT_STATUSES: { label: string; value: DocumentStateFilter; color: string }[] = [
  { label: 'Draft', value: 'draft', color: 'bg-slate-100 text-slate-700' },
  { label: 'Waiting', value: 'waiting', color: 'bg-amber-100 text-amber-700' },
  { label: 'Ready', value: 'ready', color: 'bg-sky-100 text-sky-700' },
  { label: 'Done', value: 'done', color: 'bg-emerald-100 text-emerald-700' },
  { label: 'Canceled', value: 'canceled', color: 'bg-rose-100 text-rose-700' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  fixedDocType,
  hideDocType = false,
  className,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Queries for select options
  const { data: warehouses = [] } = useWarehouses();
  const { data: categories = [] } = useCategories();

  // Multi-select status dropdown open state
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Close status dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setStatusDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Parse active filters from URL search params
  const activeType = (searchParams.get('type') as DocumentTypeFilter) || fixedDocType || '';
  const statusParam = searchParams.get('status') || '';
  const activeStatuses: DocumentStateFilter[] = statusParam
    ? (statusParam.split(',').filter(Boolean) as DocumentStateFilter[])
    : [];
  const activeWarehouse = searchParams.get('warehouse') || '';
  const activeCategory = searchParams.get('category') || '';

  // Helpers to update URL search params
  const updateParams = (updates: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams);
    for (const [key, val] of Object.entries(updates)) {
      if (val === null || val === '') {
        nextParams.delete(key);
      } else {
        nextParams.set(key, val);
      }
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateParams({ type: e.target.value || null });
  };

  const handleWarehouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateParams({ warehouse: e.target.value || null });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateParams({ category: e.target.value || null });
  };

  const toggleStatus = (status: DocumentStateFilter) => {
    const exists = activeStatuses.includes(status);
    let nextStatuses: DocumentStateFilter[];
    if (exists) {
      nextStatuses = activeStatuses.filter((s) => s !== status);
    } else {
      nextStatuses = [...activeStatuses, status];
    }
    updateParams({
      status: nextStatuses.length > 0 ? nextStatuses.join(',') : null,
    });
  };

  const removeStatus = (status: DocumentStateFilter) => {
    const nextStatuses = activeStatuses.filter((s) => s !== status);
    updateParams({
      status: nextStatuses.length > 0 ? nextStatuses.join(',') : null,
    });
  };

  const removeType = () => {
    if (!fixedDocType) {
      updateParams({ type: null });
    }
  };

  const removeWarehouse = () => {
    updateParams({ warehouse: null });
  };

  const removeCategory = () => {
    updateParams({ category: null });
  };

  const clearAllFilters = () => {
    const nextParams = new URLSearchParams(searchParams);
    if (!fixedDocType) nextParams.delete('type');
    nextParams.delete('status');
    nextParams.delete('warehouse');
    nextParams.delete('category');
    nextParams.delete('location');
    setSearchParams(nextParams, { replace: true });
  };

  // Find label names for chips
  const activeWarehouseObj = warehouses.find((w) => w.id === activeWarehouse);
  const activeCategoryObj = categories.find((c) => c.id === activeCategory);
  const activeTypeObj = DOCUMENT_TYPES.find((t) => t.value === activeType);

  const hasActiveFilters =
    Boolean(!fixedDocType && activeType) ||
    activeStatuses.length > 0 ||
    Boolean(activeWarehouse) ||
    Boolean(activeCategory);

  return (
    <div className={clsx('space-y-3 bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm', className)}>
      {/* Filter Controls Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mr-1 shrink-0">
          <Filter className="w-3.5 h-3.5 text-brand-600" />
          <span>Filters:</span>
        </div>

        {/* 1. Document Type Filter (unless hidden) */}
        {!hideDocType && (
          <div className="relative min-w-[150px] flex-1 sm:flex-initial">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <select
              value={activeType}
              onChange={handleTypeChange}
              disabled={Boolean(fixedDocType)}
              className="w-full pl-8 pr-8 py-1.5 text-xs rounded-md border border-slate-200 bg-white text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 font-medium transition-colors cursor-pointer disabled:bg-slate-50 disabled:text-slate-500"
            >
              <option value="">All Document Types</option>
              {DOCUMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 2. Status Multi-select Dropdown */}
        <div className="relative flex-1 sm:flex-initial" ref={statusDropdownRef}>
          <button
            type="button"
            onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
            className={clsx(
              'w-full sm:w-auto min-w-[140px] flex items-center justify-between gap-2 px-3 py-1.5 text-xs rounded-md border transition-colors',
              activeStatuses.length > 0
                ? 'border-brand-500 bg-brand-50/50 text-brand-700 font-semibold'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            )}
          >
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {activeStatuses.length === 0
                  ? 'All Statuses'
                  : `Status (${activeStatuses.length})`}
              </span>
            </div>
            <ChevronDown
              className={clsx(
                'w-3.5 h-3.5 text-slate-400 transition-transform duration-150',
                statusDropdownOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Status Dropdown Menu */}
          {statusDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-md shadow-lg border border-slate-200 py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                Select Statuses (Multi)
              </div>
              {DOCUMENT_STATUSES.map((status) => {
                const isSelected = activeStatuses.includes(status.value);
                return (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() => toggleStatus(status.value)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={clsx(
                          'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                          isSelected
                            ? 'bg-brand-600 border-brand-600 text-white'
                            : 'border-slate-300 bg-white'
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="font-medium text-slate-700">{status.label}</span>
                    </div>
                    <span
                      className={clsx(
                        'text-[10px] px-1.5 py-0.5 rounded font-mono uppercase',
                        status.color
                      )}
                    >
                      {status.value}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Warehouse or Location Select */}
        <div className="relative min-w-[150px] flex-1 sm:flex-initial">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <select
            value={activeWarehouse}
            onChange={handleWarehouseChange}
            className="w-full pl-8 pr-8 py-1.5 text-xs rounded-md border border-slate-200 bg-white text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 font-medium transition-colors cursor-pointer"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.code})
              </option>
            ))}
          </select>
        </div>

        {/* 4. Product Category Select */}
        <div className="relative min-w-[150px] flex-1 sm:flex-initial">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Tag className="w-3.5 h-3.5" />
          </div>
          <select
            value={activeCategory}
            onChange={handleCategoryChange}
            className="w-full pl-8 pr-8 py-1.5 text-xs rounded-md border border-slate-200 bg-white text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 font-medium transition-colors cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Clear All action (if any filter active) */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors ml-auto"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Active Filter Chips Row */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-medium text-slate-400 mr-1">Active:</span>

          {/* Type Chip */}
          {!fixedDocType && activeType && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <span>Type: {activeTypeObj?.label ?? activeType}</span>
              <button
                type="button"
                onClick={removeType}
                className="hover:text-slate-900 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Status Chips */}
          {activeStatuses.map((s) => {
            const def = DOCUMENT_STATUSES.find((item) => item.value === s);
            return (
              <span
                key={s}
                className={clsx(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
                  s === 'draft' && 'bg-slate-50 text-slate-700 border-slate-200',
                  s === 'waiting' && 'bg-amber-50 text-amber-800 border-amber-200',
                  s === 'ready' && 'bg-sky-50 text-sky-800 border-sky-200',
                  s === 'done' && 'bg-emerald-50 text-emerald-800 border-emerald-200',
                  s === 'canceled' && 'bg-rose-50 text-rose-800 border-rose-200'
                )}
              >
                <span>Status: {def?.label ?? s}</span>
                <button
                  type="button"
                  onClick={() => removeStatus(s)}
                  className="hover:opacity-75 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}

          {/* Warehouse Chip */}
          {activeWarehouse && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
              <span>WH: {activeWarehouseObj ? `${activeWarehouseObj.name} (${activeWarehouseObj.code})` : activeWarehouse}</span>
              <button
                type="button"
                onClick={removeWarehouse}
                className="hover:text-indigo-900 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Category Chip */}
          {activeCategory && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
              <span>Cat: {activeCategoryObj?.name ?? activeCategory}</span>
              <button
                type="button"
                onClick={removeCategory}
                className="hover:text-purple-900 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
