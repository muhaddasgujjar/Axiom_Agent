import { useState, type FormEvent } from 'react';
import { Link, Redirect, useLocation } from 'wouter';
import { useAuthRegister } from '@workspace/api-client-react';
import { AuthShell, AuthField, authInputClass } from '@/components/auth-shell';
import { useAuth } from '@/components/auth-provider';
import { apiErrorText } from '@/lib/auth';

export default function RegisterPage() {
  const { user, signIn } = useAuth();
  const [, setLocation] = useLocation();
  const register = useAuthRegister();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) return <Redirect to="/" />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    register.mutate(
      { data: { email: email.trim(), password } },
      {
        onSuccess: (res) => {
          signIn(res.token);
          setLocation('/');
        },
        onError: (err) => setError(apiErrorText(err, 'Could not create an account. Please try again.')),
      },
    );
  };

  return (
    <AuthShell>
      <p className="font-mono text-[9px] uppercase tracking-[.2em] text-blue-600">Secure workspace</p>
      <h1 className="mt-3 font-serif text-[clamp(34px,4vw,46px)] leading-none tracking-[-.04em] text-[#24413d]">Create an account</h1>
      <p className="mt-3 text-[13px] text-[#65706b]">Private, role-based research for your workspace.</p>
      <form onSubmit={submit} data-testid="form-register" className="mt-8 max-w-[400px] space-y-5">
        <AuthField label="Email">
          <input
            data-testid="input-register-email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@workspace.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authInputClass}
          />
        </AuthField>
        <AuthField label="Password">
          <div className="relative">
            <input
              data-testid="input-register-password"
              type={show ? 'text' : 'password'}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${authInputClass} pr-16`}
            />
            <button
              type="button"
              data-testid="button-toggle-password"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-blue-600 hover:text-blue-700"
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
        </AuthField>
        <AuthField label="Confirm password">
          <input
            data-testid="input-register-confirm"
            type={show ? 'text' : 'password'}
            required
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={authInputClass}
          />
        </AuthField>
        {error && (
          <p role="alert" data-testid="status-register-error" className="text-[11px] text-[#9b544b]">
            {error}
          </p>
        )}
        <button
          type="submit"
          data-testid="button-submit-register"
          disabled={register.isPending || !email || password.length < 8 || !confirm}
          className="w-full rounded-lg bg-blue-600 py-3 text-[13px] font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {register.isPending ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 max-w-[400px] text-[12px] text-[#65706b]">
        Already have an account?{' '}
        <Link href="/login" data-testid="link-to-login" className="font-medium text-blue-600 hover:text-blue-700">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
