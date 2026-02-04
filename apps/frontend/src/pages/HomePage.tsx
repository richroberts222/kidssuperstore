import { Link } from 'react-router-dom';
import { Button, Card } from '../components/ui';

export function HomePage() {
  return (
    <div className="stack">
      <section className="hero">
        <div className="hero-left">
          <h1>
            Welcome to the <span className="highlight">Kids Super Store</span>
          </h1>
          <p className="lead">
            A cheerful little “drive-by lemonade stand” where kids sell their handmade goodies — cookies,
            jewelry, stickers, crafts — all mocked for now so you can click everything.
          </p>
          <div className="hero-actions">
            <Link to="/shop">
              <Button>Browse the stand</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost">Set up my stand</Button>
            </Link>
          </div>

          <div className="sparkles">
            <span>🍪</span>
            <span>🧁</span>
            <span>🧵</span>
            <span>💎</span>
            <span>🎨</span>
          </div>
        </div>

        <Card className="hero-right">
          <div className="sign">
            <div className="sign-top">TODAY’S SPECIAL</div>
            <div className="sign-big">SMILES</div>
            <div className="sign-sub">plus cookies + crafts</div>
          </div>
          <div className="note">
            Tip: sign up and watch the <b>backend terminal</b> for a clickable <b>VERIFY</b> link.
          </div>
        </Card>
      </section>

      <section className="grid3">
        <Card>
          <h3>Playful storefront</h3>
          <p>Bright, simple, and kid-made.</p>
        </Card>
        <Card>
          <h3>Mock checkout</h3>
          <p>Add a “credit card” — nothing is charged.</p>
        </Card>
        <Card>
          <h3>My Stand</h3>
          <p>Add products, photos, price, stock, and shipping.</p>
        </Card>
      </section>
    </div>
  );
}
