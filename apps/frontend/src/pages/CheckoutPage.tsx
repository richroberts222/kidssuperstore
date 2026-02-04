import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, type ApiError } from '../lib/api';
import type { Product } from '../types/models';
import { useAuth } from '../store/auth';
import { useCart } from '../store/cart';
import { Button, Card, Field } from '../components/ui';
import { formatMoney } from '../lib/money';

export function CheckoutPage() {
  const nav = useNavigate();
  const { token, user } = useAuth();
  const cart = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [shipping, setShipping] = useState({
    fullName: user?.displayName ?? '',
    email: user?.email ?? '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
  });

  const [payment, setPayment] = useState({
    nameOnCard: user?.displayName ?? '',
    cardNumber: '4242 4242 4242 4242',
    exp: '12/34',
    cvc: '123',
  });

  useEffect(() => {
    api.listProducts().then((res) => setProducts(res.products));
  }, []);

  const lines = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p] as const));
    return cart.items
      .map((i) => ({ item: i, product: byId.get(i.productId) }))
      .filter((x) => !!x.product) as { item: { productId: string; quantity: number }; product: Product }[];
  }, [cart.items, products]);

  const subtotal = lines.reduce((sum, l) => sum + l.product.priceCents * l.item.quantity, 0);
  const shippingTotal = lines.reduce((sum, l) => sum + l.product.shippingCents * l.item.quantity, 0);
  const total = subtotal + shippingTotal;

  async function placeOrder() {
    setError(null);
    setSubmitting(true);

    try {
      if (!token) {
        nav('/sign-in?next=/checkout');
        return;
      }
      if (lines.length === 0) {
        setError('Your cart is empty.');
        return;
      }

      const res = await api.checkout(token, {
        items: lines.map((l) => ({ productId: l.product.id, quantity: l.item.quantity })),
        shippingAddress: {
          ...shipping,
          address2: shipping.address2 || undefined,
        },
        payment: {
          ...payment,
        },
      });

      setOrderId(res.order.id);
      cart.clear();
    } catch (err) {
      const e = err as ApiError;
      if (e?.error === 'email_not_verified') {
        setError('Please verify your email first. Check the backend terminal for a VERIFY link.');
      } else {
        setError(e?.error ?? 'Something went wrong');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (orderId) {
    return (
      <Card>
        <h2>Order placed!</h2>
        <p className="muted">Mock success — no real payment happened.</p>
        <p>
          Order id: <b>{orderId}</b>
        </p>
        <div className="row">
          <Link to="/shop">
            <Button>Keep shopping</Button>
          </Link>
          <Link to="/orders">
            <Button variant="ghost">View orders</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="stack">
      <div className="page-title">
        <h2>Checkout</h2>
        <div className="subtitle">Fill it out — it’s all pretend.</div>
      </div>

      {!token ? (
        <Card>
          <p className="muted">Please sign in to checkout.</p>
          <Link to="/sign-in?next=/checkout">
            <Button>Sign in</Button>
          </Link>
        </Card>
      ) : null}

      <div className="checkout-layout">
        <Card>
          <h3>Shipping</h3>
          <div className="form-grid">
            <Field label="Full name">
              <input value={shipping.fullName} onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })} />
            </Field>
            <Field label="Email">
              <input value={shipping.email} onChange={(e) => setShipping({ ...shipping, email: e.target.value })} />
            </Field>
            <Field label="Address line 1">
              <input value={shipping.address1} onChange={(e) => setShipping({ ...shipping, address1: e.target.value })} />
            </Field>
            <Field label="Address line 2" hint="optional">
              <input value={shipping.address2} onChange={(e) => setShipping({ ...shipping, address2: e.target.value })} />
            </Field>
            <Field label="City">
              <input value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} />
            </Field>
            <Field label="State">
              <input value={shipping.state} onChange={(e) => setShipping({ ...shipping, state: e.target.value })} />
            </Field>
            <Field label="Zip">
              <input value={shipping.zip} onChange={(e) => setShipping({ ...shipping, zip: e.target.value })} />
            </Field>
          </div>

          <h3 style={{ marginTop: 18 }}>Payment (mock)</h3>
          <div className="form-grid">
            <Field label="Name on card">
              <input value={payment.nameOnCard} onChange={(e) => setPayment({ ...payment, nameOnCard: e.target.value })} />
            </Field>
            <Field label="Card number">
              <input value={payment.cardNumber} onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })} />
            </Field>
            <Field label="Exp">
              <input value={payment.exp} onChange={(e) => setPayment({ ...payment, exp: e.target.value })} />
            </Field>
            <Field label="CVC">
              <input value={payment.cvc} onChange={(e) => setPayment({ ...payment, cvc: e.target.value })} />
            </Field>
          </div>

          {error ? <div className="error">{error}</div> : null}

          <div className="row" style={{ marginTop: 12 }}>
            <Button onClick={placeOrder} disabled={!token || submitting}>
              {submitting ? 'Placing…' : `Place order (${formatMoney(total)})`}
            </Button>
            <Link to="/cart">
              <Button variant="ghost">Back to cart</Button>
            </Link>
          </div>
        </Card>

        <Card>
          <h3>Summary</h3>
          {lines.map((l) => (
            <div className="summary-row" key={l.product.id}>
              <span>
                {l.product.name} × {l.item.quantity}
              </span>
              <span>{formatMoney((l.product.priceCents + l.product.shippingCents) * l.item.quantity)}</span>
            </div>
          ))}
          <hr className="hr" />
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{formatMoney(shippingTotal)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatMoney(total)}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
