import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { useCart } from '../store/cart';
import { Button } from './ui';

export function Layout() {
  const { user, signout } = useAuth();
  const { count } = useCart();

  return (
    <div className="app">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link to="/" className="brand">
            <span className="brand-mark">🍋</span>
            <span className="brand-name">Kids Super Store</span>
            <span className="brand-tag">drive-by lemonade stand vibes</span>
          </Link>

          <nav className="nav">
            <NavLink to="/shop" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Shop
            </NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              My Stand
            </NavLink>
            <NavLink to="/cart" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Cart <span className="pill">{count}</span>
            </NavLink>

            {user ? (
              <div className="nav-auth">
                <span className="nav-user">Hi, {user.displayName}</span>
                <Button variant="ghost" size="sm" onClick={signout}>
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="nav-auth">
                <NavLink to="/sign-in" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  Sign in
                </NavLink>
                <NavLink to="/sign-up" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  Sign up
                </NavLink>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="container main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div>Mock ecommerce demo — no real payments.</div>
          <div className="footer-right">Made for tiny makers & big smiles.</div>
        </div>
      </footer>
    </div>
  );
}
