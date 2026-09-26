import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Package,
  ArrowDownRight,
  ArrowUpRight,
  ArrowRightLeft,
  SlidersHorizontal,
  History,
  LayoutDashboard,
  Warehouse,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Boxes,
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { clsx } from 'clsx';

export const AppShell: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [operationsOpen, setOperationsOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    clsx(
      'flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors',
      isActive
        ? 'bg-brand-600 text-white shadow-sm'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    );

  const subNavItemClass = ({ isActive }: { isActive: boolean }) =>
    clsx(
      'flex items-center gap-2 pl-9 pr-3 py-1.5 rounded-md text-xs font-medium transition-colors',
      isActive
        ? 'text-brand-600 bg-brand-50 font-semibold'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
    );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out shrink-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Brand Logo */}
        <div className="h-14 px-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-sm">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-900 leading-none">StockSense</h1>
              <span className="text-[10px] text-slate-400 font-mono">Ledger Inventory</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavLink to="/dashboard" className={navItemClass}>
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/products" className={navItemClass}>
            <Package className="w-4 h-4 shrink-0" />
            <span>Products</span>
          </NavLink>

          {/* Operations Dropdown */}
          <div className="space-y-0.5">
            <button
              onClick={() => setOperationsOpen(!operationsOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <ArrowRightLeft className="w-4 h-4 shrink-0" />
                <span>Operations</span>
              </div>
              <ChevronDown
                className={clsx(
                  'w-3.5 h-3.5 transition-transform duration-150',
                  operationsOpen && 'rotate-180'
                )}
              />
            </button>

            {operationsOpen && (
              <div className="space-y-0.5 pt-0.5">
                <NavLink to="/operations/receipts" className={subNavItemClass}>
                  <ArrowDownRight className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Receipts (In)</span>
                </NavLink>

                <NavLink to="/operations/deliveries" className={subNavItemClass}>
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-500" />
                  <span>Deliveries (Out)</span>
                </NavLink>

                <NavLink to="/operations/internal" className={subNavItemClass}>
                  <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Internal Transfers</span>
                </NavLink>

                <NavLink to="/operations/adjustments" className={subNavItemClass}>
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
                  <span>Adjustments</span>
                </NavLink>
              </div>
            )}
          </div>

          <NavLink to="/move-history" className={navItemClass}>
            <History className="w-4 h-4 shrink-0" />
            <span>Move History</span>
          </NavLink>

          <div className="pt-3 pb-1 px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Settings
          </div>

          <NavLink to="/settings/warehouses" className={navItemClass}>
            <Warehouse className="w-4 h-4 shrink-0" />
            <span>Warehouses</span>
          </NavLink>
        </nav>

        {/* Profile Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <NavLink
              to="/profile"
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-200/60 transition-colors flex-1 min-w-0"
            >
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs shrink-0">
                {profile?.name ? profile.name[0].toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-800 truncate">
                  {profile?.name || user?.email || 'User'}
                </p>
                <p className="text-[10px] text-slate-500 truncate capitalize">
                  {profile?.role || 'Staff'}
                </p>
              </div>
            </NavLink>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 text-slate-600 hover:text-slate-900 rounded-md focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="ml-3 font-semibold text-slate-800 text-sm">StockSense</h2>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
