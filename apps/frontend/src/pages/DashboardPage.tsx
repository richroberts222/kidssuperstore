import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type ApiError, type ProductUpsert } from '../lib/api';
import type { Product } from '../types/models';
import { useAuth } from '../store/auth';
import { Button, Card, Field } from '../components/ui';
import { formatMoney } from '../lib/money';

const emptyForm = {
  name: '',
  description: '',
  priceCents: 500,
  shippingCents: 199,
  imageUrl: '',
  category: 'Cookies',
  stock: 10,
};

export function DashboardPage() {
  const { token, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const res = await api.listProducts();
      setProducts(res.products);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const mine = useMemo(() => {
    if (!user) return [];
    return products.filter((p) => p.createdByUserId === user.id);
  }, [products, user]);

  async function submit() {
    setError(null);
    setSuccess(null);

    if (!token) {
      setError('Sign in first.');
      return;
    }

    try {
      const body: ProductUpsert = {
        name: form.name,
        description: form.description,
        priceCents: Number(form.priceCents),
        shippingCents: Number(form.shippingCents),
        imageUrl: form.imageUrl || undefined,
        category: form.category || undefined,
        stock: Number(form.stock),
      };

      if (editingId) {
        await api.updateProduct(token, editingId, body);
        setSuccess('Updated!');
      } else {
        await api.createProduct(token, body);
        setSuccess('Added!');
      }

      setForm({ ...emptyForm });
      setEditingId(null);
      await refresh();
    } catch (err) {
      const e = err as ApiError;
      if (e?.error === 'email_not_verified') {
        setError('Please verify your email first (check backend terminal for VERIFY link).');
      } else {
        setError(e?.error ?? 'Failed');
      }
    }
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      priceCents: p.priceCents,
      shippingCents: p.shippingCents,
      imageUrl: p.imageUrl ?? '',
      category: p.category ?? '',
      stock: p.stock,
    });
    setSuccess(null);
    setError(null);
  }

  async function remove(id: string) {
    if (!token) return;
    setError(null);
    setSuccess(null);
    try {
      await api.deleteProduct(token, id);
      await refresh();
    } catch (err) {
      const e = err as ApiError;
      setError(e?.error ?? 'Failed');
    }
  }

  async function pasteImageFile(file: File) {
    const dataUrl = await readAsDataUrl(file);
    setForm((f) => ({ ...f, imageUrl: dataUrl }));
  }

  if (!user) {
    return (
      <Card>
        <h2>My Stand</h2>
        <p className="muted">Sign in to add products.</p>
        <Link to="/sign-in">
          <Button>Sign in</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="stack">
      <div className="page-title">
        <h2>My Stand</h2>
        <div className="subtitle">Add products like cookies, jewelry, and crafts.</div>
      </div>

      <Card>
        <h3>{editingId ? 'Edit product' : 'Add a new product'}</h3>
        <div className="form-grid">
          <Field label="Name">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Category">
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Cookies" />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
          </Field>
          <Field label="Price" hint="USD">
            <input
              type="number"
              min={0}
              value={form.priceCents}
              onChange={(e) => setForm({ ...form, priceCents: Number(e.target.value) })}
            />
            <div className="muted small">{formatMoney(Number(form.priceCents))}</div>
          </Field>
          <Field label="Shipping" hint="USD">
            <input
              type="number"
              min={0}
              value={form.shippingCents}
              onChange={(e) => setForm({ ...form, shippingCents: Number(e.target.value) })}
            />
            <div className="muted small">{formatMoney(Number(form.shippingCents))}</div>
          </Field>
          <Field label="Stock">
            <input
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            />
          </Field>
          <Field label="Image" hint="URL or upload">
            <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://… or data:image/png;base64,…" />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) pasteImageFile(file);
              }}
            />
          </Field>
        </div>

        {error ? <div className="error">{error}</div> : null}
        {success ? <div className="success">{success}</div> : null}

        <div className="row" style={{ marginTop: 12 }}>
          <Button onClick={submit}>{editingId ? 'Save changes' : 'Add product'}</Button>
          {editingId ? (
            <Button
              variant="ghost"
              onClick={() => {
                setEditingId(null);
                setForm({ ...emptyForm });
              }}
            >
              Cancel
            </Button>
          ) : null}
          <Button variant="ghost" onClick={refresh}>
            Refresh
          </Button>
        </div>

        <div className="muted small" style={{ marginTop: 10 }}>
          Image upload is mocked by converting the image to a <code>data:</code> URL.
        </div>
      </Card>

      <Card>
        <h3>My products</h3>
        {loading ? <div className="muted">Loading…</div> : null}
        {mine.length === 0 && !loading ? <div className="muted">No items yet — add one above!</div> : null}
        <div className="stand-grid">
          {mine.map((p) => (
            <div key={p.id} className="stand-item">
              <img className="thumb" src={p.imageUrl || `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(p.name)}`} alt={p.name} />
              <div className="stand-main">
                <div className="stand-title">{p.name}</div>
                <div className="muted small">
                  {formatMoney(p.priceCents)} + {formatMoney(p.shippingCents)} ship • stock {p.stock}
                </div>
                <div className="row">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(p)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => remove(p.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="muted small">
        Want to see everything? Head to <Link to="/shop">Shop</Link>.
      </Card>
    </div>
  );
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('failed_to_read'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}
