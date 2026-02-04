import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import type { User } from '../types/models';
import { api, type ApiError } from '../lib/api';

const TOKEN_KEY = 'kss_token_v1';

type AuthState = {
  token: string | null;
  user: User | null;
  loading: boolean;
  signup: (args: { email: string; password: string; displayName: string }) => Promise<{ verifyUrl: string }>;
  signin: (args: { email: string; password: string }) => Promise<void>;
  signout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider(props: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const me = await api.me(token);
      setUser({ id: me.id, email: me.email, displayName: me.displayName, verified: me.verified });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signup = useCallback(async (args: { email: string; password: string; displayName: string }) => {
    const res = await api.signup(args);
    return { verifyUrl: res.verifyUrl };
  }, []);

  const signin = useCallback(async (args: { email: string; password: string }) => {
    try {
      const res = await api.signin(args);
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (err) {
      const e = err as ApiError;
      if (e?.error === 'email_not_verified' && e.verifyUrl) {
        // surface this message via throwing a richer error
        throw e;
      }
      throw err;
    }
  }, []);

  const signout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ token, user, loading, signup, signin, signout, refresh }),
    [token, user, loading, signup, signin, signout, refresh],
  );

  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
