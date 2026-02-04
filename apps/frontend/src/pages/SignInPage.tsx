import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, Field } from '../components/ui';
import { useAuth } from '../store/auth';
import type { ApiError } from '../lib/api';

export function SignInPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const auth = useAuth();

  const params = useMemo(() => new URLSearchParams(loc.search), [loc.search]);
  const presetEmail = params.get('email') ?? '';
  const next = params.get('next') ?? '/shop';
  const verified = params.get('verified') === '1';

  const [email, setEmail] = useState(presetEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    setVerifyUrl(null);
    setLoading(true);

    try {
      await auth.signin({ email, password });
      nav(next);
    } catch (err) {
      const e = err as ApiError;
      if (e?.error === 'email_not_verified') {
        setError('Please verify your email first.');
        if (e.verifyUrl) setVerifyUrl(e.verifyUrl);
      } else {
        setError(e?.error ?? 'Sign in failed');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack narrow">
      <Card>
        <h2>Sign in</h2>
        {verified ? <div className="success">Email verified — you can sign in now.</div> : null}

        <div className="form-grid">
          <Field label="Email">
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
        </div>

        {error ? <div className="error">{error}</div> : null}

        {verifyUrl ? (
          <div className="muted small">
            Verify link (also printed in backend terminal):{' '}
            <a href={verifyUrl} target="_blank" rel="noreferrer">
              {verifyUrl}
            </a>
          </div>
        ) : null}

        <div className="row" style={{ marginTop: 12 }}>
          <Button onClick={submit} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
          <Link to="/sign-up">
            <Button variant="ghost">Create account</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
