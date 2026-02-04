import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import type { Product } from '../types/models';
import { ProductCard } from '../components/ProductCard';
import { Card, Field } from '../components/ui';

export function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .listProducts()
      .then((res) => {
        if (!cancelled) setProducts(res.products);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) if (p.category) set.add(p.category);
    return [...set].sort();
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesQ = !q
        ? true
        : (p.name + ' ' + p.description + ' ' + (p.category ?? '')).toLowerCase().includes(q);
      const matchesC = !category ? true : p.category === category;
      return matchesQ && matchesC;
    });
  }, [products, query, category]);

  return (
    <div className="stack">
      <div className="page-title">
        <h2>Shop</h2>
        <div className="subtitle">Pick something cute. Add it to your cart. Pretend you’re driving by.</div>
      </div>

      <Card className="filters">
        <Field label="Search">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="cookies, bracelet, sticker…" />
        </Field>
        <Field label="Category">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
      </Card>

      {loading ? <div className="muted">Loading goodies…</div> : null}

      <div className="product-grid">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {!loading && filtered.length === 0 ? <div className="muted">No matches. Try “cookie”.</div> : null}
    </div>
  );
}
