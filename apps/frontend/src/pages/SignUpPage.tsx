import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import type { ApiError } from '../lib/api';
import { Button, Card, Field } from '../components/ui';

export function SignUpPage() {
  const nav = useNavigate();
  const auth = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const res = await auth.signup({ displayName, email, password });
      setVerifyUrl(res.verifyUrl);
    } catch (err) {
      const e = err as ApiError;
      setError(e?.error ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack narrow">
      <Card>
        <h2>Sign up</h2>
        <p className="muted">Make an account, then verify using the link the backend prints.</p>

        <div className="form-grid">
          <Field label="Display name">
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Cookie Captain" />
          </Field>
          <Field label="Email">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </Field>
          <Field label="Password" hint="mock only">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
        </div>

        {error ? <div className="error">{error}</div> : null}

        {verifyUrl ? (
          <div className="success">
            <div>
              Check the backend terminal for a <b>VERIFY</b> link.
            </div>
            <div className="muted small">
              If you want, you can also click it here:
              <div>
                <a href={verifyUrl} target="_blank" rel="noreferrer">
                  {verifyUrl}
                </a>
              </div>
            </div>
            <div className="row" style={{ marginTop: 12 }}>
              <Button onClick={() => nav(`/sign-in?email=${encodeURIComponent(email)}`)}>Go to sign in</Button>
              <Link to="/shop">
                <Button variant="ghost">Shop</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="row" style={{ marginTop: 12 }}>
            <Button onClick={submit} disabled={loading}>
              {loading ? 'Creating…' : 'Create account'}
            </Button>
            <Link to="/sign-in">
              <Button variant="ghost">I already have one</Button>
            </Link>
          </div>
        )}
      </Card>

      <Card className="muted small">
        Tip: missed the backend link? Open <code>/dev/outbox</code> on the API.
      </Card>
    </div>
  );
}
