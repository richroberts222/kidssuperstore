import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { formatMoney } from '../lib/money';
import type { Product } from '../types/models';
import { Button, Card } from '../components/ui';
import { useCart } from '../store/cart';

export function ProductPage() {
  const { id } = useParams();
  const { add } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .listProducts()
      .then((res) => {
        if (cancelled) return;
        const found = res.products.find((p) => p.id === id) ?? null;
        setProduct(found);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const image = useMemo(() => product?.imageUrl || fallback(product?.name ?? 'product'), [product]);

  if (loading) return <div className="muted">Loading…</div>;
  if (!product)
    return (
      <Card>
        <h3>Not found</h3>
        <p className="muted">That item scooted away.</p>
        <Link to="/shop">
          <Button variant="ghost">Back to shop</Button>
        </Link>
      </Card>
    );

  return (
    <div className="stack">
      <Link to="/shop" className="muted">
        ← Back to shop
      </Link>

      <div className="product-detail">
        <Card className="product-detail-media">
          <img src={image} alt={product.name} />
        </Card>

        <Card className="product-detail-body">
          <h2>{product.name}</h2>
          {product.category ? <div className="chip">{product.category}</div> : null}
          <p className="muted">{product.description}</p>

          <div className="detail-price">
            <div className="price-big">{formatMoney(product.priceCents)}</div>
            <div className="muted">Shipping: {formatMoney(product.shippingCents)}</div>
            <div className="muted">In stock: {product.stock}</div>
          </div>

          <div className="row">
            <Button onClick={() => add(product, 1)} disabled={product.stock === 0}>
              {product.stock === 0 ? 'Sold out' : 'Add to cart'}
            </Button>
            <Link to="/cart">
              <Button variant="ghost">Go to cart</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

function fallback(name: string) {
  const seed = encodeURIComponent(name.slice(0, 40));
  return `https://api.dicebear.com/9.x/shapes/svg?seed=${seed}`;
}
