import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Order } from '../types/models';
import { useAuth } from '../store/auth';
import { Card, Button } from '../components/ui';
import { formatMoney } from '../lib/money';

export function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setOrders([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    api
      .listOrders(token)
      .then((res) => {
        if (!cancelled) setOrders(res.orders);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!token) {
    return (
      <Card>
        <h2>Orders</h2>
        <p className="muted">Sign in to see orders.</p>
        <Link to="/sign-in">
          <Button>Sign in</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="stack">
      <div className="page-title">
        <h2>Orders</h2>
        <div className="subtitle">Your pretend receipts.</div>
      </div>

      {loading ? <div className="muted">Loading…</div> : null}

      {orders.map((o) => (
        <Card key={o.id}>
          <div className="order-head">
            <div>
              <div className="muted small">Order</div>
              <div className="mono">{o.id}</div>
            </div>
            <div>
              <div className="muted small">Total</div>
              <div className="price-big">{formatMoney(o.totalCents)}</div>
            </div>
          </div>
          <div className="muted small">Paid with {o.payment.brand} •••• {o.payment.last4}</div>
          <div className="order-items">
            {o.items.map((i) => (
              <div key={i.productId} className="summary-row">
                <span>
                  {i.nameSnapshot} × {i.quantity}
                </span>
                <span>{formatMoney((i.priceCentsSnapshot + i.shippingCentsSnapshot) * i.quantity)}</span>
              </div>
            ))}
          </div>
        </Card>
      ))}

      {!loading && orders.length === 0 ? (
        <Card>
          <p className="muted">No orders yet. Try checkout.</p>
          <Link to="/shop">
            <Button>Shop</Button>
          </Link>
        </Card>
      ) : null}
    </div>
  );
}
