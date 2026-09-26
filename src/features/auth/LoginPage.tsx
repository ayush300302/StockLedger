import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { Card, Input, Button } from '../../components/ui';
import { Boxes } from 'lucide-react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name] || errors.form) {
      setErrors((prev) => ({ ...prev, [name]: '', form: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          formattedErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(formattedErrors);
      return;
    }

    setSubmitting(true);
    const { error } = await signIn({
      email: formData.email,
      password: formData.password,
    });
    setSubmitting(false);

    if (error) {
      setErrors({ form: 'Invalid email or password. Please check your credentials.' });
      return;
    }

    toast.success('Welcome back!');
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center mx-auto mb-2 shadow-md">
            <Boxes className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Sign in to StockSense</h2>
          <p className="text-xs text-slate-500 mt-1">Enter your details to access your account</p>
        </div>

        {errors.form && (
          <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
            {errors.form}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <Input
            label="Email address"
            type="email"
            name="email"
            placeholder="manager@stocksense.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
          />

          <div className="flex items-center justify-end">
            <Link to="/forgot-password" className="text-xs text-brand-600 font-medium hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" loading={submitting}>
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand-600 font-semibold hover:underline">
            Sign Up
          </Link>
        </div>
      </Card>
    </div>
  );
};
