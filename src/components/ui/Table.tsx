import React from 'react';
import { clsx } from 'clsx';
import { Spinner } from './Spinner';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  onRowClick?: (row: T) => void;
  rowKey: (row: T) => string;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  loading = false,
  emptyTitle = 'No data found',
  emptyDescription,
  emptyAction,
  onRowClick,
  rowKey,
  className,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-slate-200">
        <Spinner size="md" className="text-brand-600 mb-2" />
        <p className="text-xs text-slate-500">Loading data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={clsx('bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto', className)}>
      <table className="w-full table-dense">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(alignClasses[col.align || 'left'], col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={() => onRowClick?.(row)}
              className={clsx(
                'transition-colors',
                onRowClick ? 'cursor-pointer hover:bg-slate-50/80' : 'hover:bg-slate-50/50'
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={clsx(alignClasses[col.align || 'left'], col.className)}
                >
                  {col.render ? col.render(row) : (row as unknown as Record<string, unknown>)[col.key] as React.ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
