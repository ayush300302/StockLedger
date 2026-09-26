import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { AppShell } from '../components/AppShell';
import { Spinner } from '../components/ui/Spinner';

// Auth Pages
import { LoginPage } from '../features/auth/LoginPage';
import { SignupPage } from '../features/auth/SignupPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { ProfilePage } from '../features/auth/ProfilePage';

// Feature Pages
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { ProductListPage } from '../features/products/ProductListPage';
import { ProductDetailPage } from '../features/products/ProductDetailPage';
import { ReceiptsPage } from '../features/operations/ReceiptsPage';
import { DeliveriesPage } from '../features/operations/DeliveriesPage';
import { InternalTransfersPage } from '../features/operations/InternalTransfersPage';
import { AdjustmentsPage } from '../features/operations/AdjustmentsPage';
import { MoveHistoryPage } from '../features/ledger/MoveHistoryPage';
import { WarehousesPage } from '../features/settings/WarehousesPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Spinner size="lg" className="text-brand-600 mb-3" />
        <p className="text-xs text-slate-500 font-medium">Authenticating StockSense...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected Routes inside AppShell */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/operations/receipts" element={<ReceiptsPage />} />
        <Route path="/operations/deliveries" element={<DeliveriesPage />} />
        <Route path="/operations/internal" element={<InternalTransfersPage />} />
        <Route path="/operations/adjustments" element={<AdjustmentsPage />} />
        <Route path="/move-history" element={<MoveHistoryPage />} />
        <Route path="/settings/warehouses" element={<WarehousesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Default Fallback */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
