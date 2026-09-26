import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Card, Input, Button } from '../../components/ui';
import { KeyRound, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must contain digits only'),
});

const passwordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const ForgotPasswordPage: React.FC = () => {
  const { requestOtp, verifyOtp, updatePassword } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleStep1SendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      setErrors({ email: result.error.issues[0].message });
      return;
    }

    setSubmitting(true);
    const { error } = await requestOtp(email);
    setSubmitting(false);

    if (error) {
      setErrors({ email: error });
      return;
    }

    toast.success('6-digit OTP code sent to your email');
    setStep(2);
    setCooldown(30);
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setErrors({});
    setSubmitting(true);
    const { error } = await requestOtp(email);
    setSubmitting(false);

    if (error) {
      toast.error(error);
    } else {
      toast.success('New OTP sent to your email');
      setCooldown(30);
    }
  };

  const handleStep2VerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = otpSchema.safeParse({ otp });
    if (!result.success) {
      setErrors({ otp: result.error.issues[0].message });
      return;
    }

    setSubmitting(true);
    const { error } = await verifyOtp(email, otp);
    setSubmitting(false);

    if (error) {
      const errLower = error.toLowerCase();
      if (errLower.includes('expired')) {
        setErrors({ otp: 'This OTP code has expired. Please click Resend Code for a new OTP.' });
      } else if (errLower.includes('invalid') || errLower.includes('wrong') || errLower.includes('token')) {
        setErrors({ otp: 'Invalid 6-digit OTP code. Please check and try again.' });
      } else {
        setErrors({ otp: error });
      }
      return;
    }

    toast.success('OTP verified! Set your new password');
    setStep(3);
  };

  const handleStep3UpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = passwordSchema.safeParse({ password, confirmPassword });
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
    const { error } = await updatePassword(password);
    setSubmitting(false);

    if (error) {
      setErrors({ password: error });
      return;
    }

    toast.success('Password updated successfully! Please sign in');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg p-6">
        {/* Step Indicator Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4 px-2">
            {[
              { num: 1, label: 'Email', icon: Mail },
              { num: 2, label: 'OTP Code', icon: KeyRound },
              { num: 3, label: 'New Password', icon: Lock },
            ].map(({ num, label, icon: Icon }) => (
              <div key={num} className="flex flex-col items-center">
                <div
                  className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                    step === num
                      ? 'bg-brand-600 text-white shadow-sm'
                      : step > num
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-500'
                  )}
                >
                  {step > num ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="text-[10px] font-medium text-slate-500 mt-1">{label}</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900">
              {step === 1 ? 'Reset Password' : step === 2 ? 'Verify 6-Digit OTP' : 'Set New Password'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {step === 1
                ? 'Enter your email address to receive an OTP'
                : step === 2
                ? `Enter the code sent to ${email}`
                : 'Create a new secure password for your account'}
            </p>
          </div>
        </div>

        {/* Step 1 Form */}
        {step === 1 && (
          <form onSubmit={handleStep1SendEmail} className="space-y-4" noValidate>
            <Input
              label="Email address"
              type="email"
              placeholder="manager@stocksense.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({});
              }}
              error={errors.email}
              required
            />
            <Button type="submit" className="w-full" loading={submitting}>
              Send OTP Code
            </Button>
          </form>
        )}

        {/* Step 2 Form */}
        {step === 2 && (
          <form onSubmit={handleStep2VerifyOtp} className="space-y-4" noValidate>
            <Input
              label="6-Digit OTP Code"
              type="text"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                if (errors.otp) setErrors({});
              }}
              error={errors.otp}
              helperText="Check your email inbox or spam folder"
              required
            />

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Change Email
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || submitting}
                className={clsx(
                  'text-xs font-medium',
                  cooldown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-brand-600 hover:underline'
                )}
              >
                {cooldown > 0 ? `Resend Code (${cooldown}s)` : 'Resend Code'}
              </button>
            </div>

            <Button type="submit" className="w-full" loading={submitting}>
              Verify OTP Code
            </Button>
          </form>
        )}

        {/* Step 3 Form */}
        {step === 3 && (
          <form onSubmit={handleStep3UpdatePassword} className="space-y-4" noValidate>
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({});
              }}
              error={errors.password}
              helperText="At least 8 characters long"
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors({});
              }}
              error={errors.confirmPassword}
              required
            />

            <Button type="submit" className="w-full" loading={submitting}>
              Update Password
            </Button>
          </form>
        )}

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
