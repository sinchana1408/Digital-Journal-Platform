import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../components/ui/Toast';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await api.forgotPassword({ email });
      success('Instructions prepared', res.message);
      if (res.resetToken) {
        setResetToken(res.resetToken);
      }
    } catch (err: any) {
      toastError(err.message || 'Could not process request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="font-serif text-2xl font-bold text-foreground">Reset Password</h2>
        <p className="text-sm text-foreground-muted mt-1">
          Enter your email to receive recovery instructions
        </p>
      </div>

      {resetToken ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs">
            <div className="flex items-center gap-1.5 font-semibold mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Reset Token Generated</span>
            </div>
            <p className="mb-2">In development mode, your reset token is:</p>
            <div className="p-2 rounded bg-surface border font-mono text-[11px] select-all break-all text-foreground">
              {resetToken}
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/reset-password?token=${resetToken}`)}
            className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-700 text-white font-medium text-sm transition-all shadow-soft-sm hover:shadow-soft-md flex items-center justify-center gap-2"
          >
            <span>Continue to Reset Form</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@lumajournal.com"
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-700 text-white font-medium text-sm transition-all shadow-soft-sm hover:shadow-soft-md active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <span>Request Reset</span>
            )}
          </button>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to login</span>
        </Link>
      </div>
    </div>
  );
};
