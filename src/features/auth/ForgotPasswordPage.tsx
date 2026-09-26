import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Input, Button } from '../../components/ui';

export const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Reset Password</h2>
          <p className="text-xs text-slate-500 mt-1">Enter your registered email to receive an OTP</p>
        </div>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <Input label="Email address" type="email" placeholder="manager@stocksense.com" required />
          <Button type="submit" className="w-full">
            Send OTP Code
          </Button>
        </form>
        <div className="mt-6 text-center text-xs text-slate-500">
          Back to{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
};
