import React from 'react';
import { clsx } from 'clsx';

export interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
}) => {
  return (
    <div className={clsx('bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden', className)}>
      {(title || action) && (
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            {title && <h3 className="text-sm font-semibold text-slate-800">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={clsx('p-4', bodyClassName)}>{children}</div>
    </div>
  );
};
