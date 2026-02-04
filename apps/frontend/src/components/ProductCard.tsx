import { Link } from 'react-router-dom';
import type { Product } from '../types/models';
import { formatMoney } from '../lib/money';
import { Button, Card } from './ui';
import { useCart } from '../store/cart';

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  return (
    <Card className="product-card">
      <Link to={`/p/${product.id}`} className="product-media">
        <img
          src={product.imageUrl || fallback(product.name)}
          alt={product.name}
          loading="lazy"
        />
      </Link>

      <div className="product-body">
        <div className="product-top">
          <div className="product-name">{product.name}</div>
          {product.category ? <div className="chip">{product.category}</div> : null}
        </div>

        <div className="product-desc">{product.description}</div>

        <div className="product-row">
          <div className="price">
            {formatMoney(product.priceCents)}
            <span className="price-sub"> + {formatMoney(product.shippingCents)} ship</span>
          </div>
          <Button onClick={() => add(product, 1)} disabled={product.stock === 0}>
            {product.stock === 0 ? 'Sold out' : 'Add'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function fallback(name: string) {
  const seed = encodeURIComponent(name.slice(0, 40));
  return `https://api.dicebear.com/9.x/shapes/svg?seed=${seed}`;
}
