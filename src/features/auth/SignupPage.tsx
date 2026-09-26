import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Input, Button } from '../../components/ui';
import { Boxes } from 'lucide-react';

export const SignupPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center mx-auto mb-2 shadow-md">
            <Boxes className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Create Account</h2>
          <p className="text-xs text-slate-500 mt-1">Get started with StockSense ledger inventory</p>
        </div>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <Input label="Full Name" placeholder="Warehouse Manager" required />
          <Input label="Email address" type="email" placeholder="manager@stocksense.com" required />
          <Input label="Password" type="password" placeholder="••••••••" helperText="At least 8 characters" required />
          <Input label="Confirm Password" type="password" placeholder="••••••••" required />
          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>
        <div className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
};
