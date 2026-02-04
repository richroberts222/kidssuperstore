import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import type { Product } from '../types/models';
import { useCart } from '../store/cart';
import { Button, Card } from '../components/ui';
import { formatMoney } from '../lib/money';

export function CartPage() {
  const nav = useNavigate();
  const cart = useCart();
  const [products, setProducts] = useState<Product[]>([]);

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
  const shipping = lines.reduce((sum, l) => sum + l.product.shippingCents * l.item.quantity, 0);
  const total = subtotal + shipping;

  return (
    <div className="stack">
      <div className="page-title">
        <h2>Your Cart</h2>
        <div className="subtitle">A little basket of sunshine.</div>
      </div>

      {lines.length === 0 ? (
        <Card>
          <p className="muted">Your cart is empty. Let’s fix that.</p>
          <Link to="/shop">
            <Button>Browse shop</Button>
          </Link>
        </Card>
      ) : (
        <div className="cart-layout">
          <Card className="cart-lines">
            {lines.map((l) => (
              <div key={l.product.id} className="cart-line">
                <img
                  className="thumb"
                  src={l.product.imageUrl || `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(l.product.name)}`}
                  alt={l.product.name}
                />
                <div className="cart-line-main">
                  <div className="cart-line-title">
                    <Link to={`/p/${l.product.id}`}>{l.product.name}</Link>
                  </div>
                  <div className="muted">
                    {formatMoney(l.product.priceCents)} + {formatMoney(l.product.shippingCents)} ship
                  </div>
                  <div className="row">
                    <input
                      className="qty"
                      type="number"
                      min={1}
                      max={99}
                      value={l.item.quantity}
                      onChange={(e) => cart.setQty(l.product.id, Number(e.target.value))}
                    />
                    <Button variant="ghost" size="sm" onClick={() => cart.remove(l.product.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
                <div className="cart-line-total">
                  {formatMoney((l.product.priceCents + l.product.shippingCents) * l.item.quantity)}
                </div>
              </div>
            ))}
          </Card>

          <Card className="summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{formatMoney(shipping)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatMoney(total)}</span>
            </div>

            <div className="row">
              <Button onClick={() => nav('/checkout')}>Checkout</Button>
              <Button variant="ghost" onClick={cart.clear}>
                Clear
              </Button>
            </div>

            <div className="muted small">
              Checkout is mocked — you can type any card number.
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
