import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';
import { env } from './env.js';
import { db, newId, seedProducts } from './db.js';
import { hashPassword, verifyPassword } from './crypto.js';
import { requireAuth, createSession, type AuthedRequest } from './auth.js';
import {
  checkoutSchema,
  productUpsertSchema,
  signinSchema,
  signupSchema,
} from './schemas.js';

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(
  cors({
    origin: [env.webOrigin],
    credentials: false,
  }),
);

app.get('/health', (_req, res) => res.json({ ok: true }));

// --- Dev helpers (mock-only) ---
app.get('/dev/outbox', (_req, res) => {
  const verifications = [...db.usersById.values()]
    .filter((u) => !u.verified && u.verifyToken)
    .map((u) => ({
      email: u.email,
      verifyUrl: `${env.apiOrigin}/auth/verify?token=${encodeURIComponent(u.verifyToken!)}`,
    }));
  return res.json({ verifications });
});

// --- Auth ---
app.post('/auth/signup', (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_body', details: parsed.error });

  const email = parsed.data.email.toLowerCase();
  if (db.usersByEmail.has(email)) return res.status(409).json({ error: 'email_taken' });

  const userId = newId('user');
  const verifyToken = `verify_${nanoid(28)}`;

  const user = {
    id: userId,
    email,
    displayName: parsed.data.displayName,
    passwordHash: hashPassword(parsed.data.password),
    verified: false,
    verifyToken,
    createdAt: Date.now(),
  };

  db.usersByEmail.set(email, user);
  db.usersById.set(userId, user);

  // Seed demo products owned by the first user.
  if (db.productsById.size === 0) seedProducts(userId);

  const verifyUrl = `${env.apiOrigin}/auth/verify?token=${encodeURIComponent(verifyToken)}`;
  console.log(`\nVERIFY: ${verifyUrl}\n`);

  return res.status(201).json({
    ok: true,
    message: 'Signup successful. Check the backend terminal for a VERIFY link.',
    verifyUrl,
  });
});

app.get('/auth/verify', (req, res) => {
  const token = String(req.query.token ?? '');
  const user = [...db.usersById.values()].find((u) => u.verifyToken === token);
  if (!user) return res.status(400).send('<h2>Verification link invalid or expired.</h2>');

  user.verified = true;
  delete user.verifyToken;

  const toWeb = `${env.webOrigin}/sign-in?verified=1&email=${encodeURIComponent(user.email)}`;
  return res
    .status(200)
    .send(
      `<!doctype html><html><head><meta charset="utf-8"/><title>Verified</title></head><body style="font-family: ui-sans-serif, system-ui; padding: 24px;">
      <h2>✅ Email verified!</h2>
      <p>You can now return to the Kids Super Store tab and sign in.</p>
      <p><a href="${toWeb}">Continue to sign in</a></p>
      </body></html>`,
    );
});

app.post('/auth/signin', (req, res) => {
  const parsed = signinSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_body', details: parsed.error });

  const email = parsed.data.email.toLowerCase();
  const user = db.usersByEmail.get(email);
  if (!user) return res.status(401).json({ error: 'invalid_credentials' });
  if (!verifyPassword(parsed.data.password, user.passwordHash)) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }

  if (!user.verified) {
    const verifyUrl = user.verifyToken
      ? `${env.apiOrigin}/auth/verify?token=${encodeURIComponent(user.verifyToken)}`
      : undefined;
    if (verifyUrl) console.log(`\nVERIFY: ${verifyUrl}\n`);
    return res.status(403).json({ error: 'email_not_verified', verifyUrl });
  }

  const token = createSession(user.id);
  return res.json({
    ok: true,
    token,
    user: { id: user.id, email: user.email, displayName: user.displayName },
  });
});

app.get('/me', requireAuth, (req: AuthedRequest, res) => {
  const user = req.userId ? db.usersById.get(req.userId) : undefined;
  if (!user) return res.status(401).json({ error: 'invalid_token' });
  return res.json({ id: user.id, email: user.email, displayName: user.displayName, verified: user.verified });
});

// --- Products ---
app.get('/products', (_req, res) => {
  const products = [...db.productsById.values()].sort((a, b) => b.updatedAt - a.updatedAt);
  return res.json({ products });
});

app.post('/products', requireAuth, (req: AuthedRequest, res) => {
  const user = req.userId ? db.usersById.get(req.userId) : undefined;
  if (!user) return res.status(401).json({ error: 'invalid_token' });
  if (!user.verified) return res.status(403).json({ error: 'email_not_verified' });

  const parsed = productUpsertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_body', details: parsed.error });

  const now = Date.now();
  const id = newId('prod');
  const product = {
    id,
    createdByUserId: user.id,
    createdAt: now,
    updatedAt: now,
    ...parsed.data,
  };
  db.productsById.set(id, product);
  return res.status(201).json({ product });
});

app.put('/products/:id', requireAuth, (req: AuthedRequest, res) => {
  const user = req.userId ? db.usersById.get(req.userId) : undefined;
  if (!user) return res.status(401).json({ error: 'invalid_token' });
  if (!user.verified) return res.status(403).json({ error: 'email_not_verified' });

  const existing = db.productsById.get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'not_found' });
  if (existing.createdByUserId !== user.id) return res.status(403).json({ error: 'not_owner' });

  const parsed = productUpsertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_body', details: parsed.error });

  const updated = { ...existing, ...parsed.data, updatedAt: Date.now() };
  db.productsById.set(existing.id, updated);
  return res.json({ product: updated });
});

app.delete('/products/:id', requireAuth, (req: AuthedRequest, res) => {
  const user = req.userId ? db.usersById.get(req.userId) : undefined;
  if (!user) return res.status(401).json({ error: 'invalid_token' });

  const existing = db.productsById.get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'not_found' });
  if (existing.createdByUserId !== user.id) return res.status(403).json({ error: 'not_owner' });

  db.productsById.delete(existing.id);
  return res.json({ ok: true });
});

// --- Checkout (mock payment) ---
app.post('/checkout', requireAuth, (req: AuthedRequest, res) => {
  const user = req.userId ? db.usersById.get(req.userId) : undefined;
  if (!user) return res.status(401).json({ error: 'invalid_token' });
  if (!user.verified) return res.status(403).json({ error: 'email_not_verified' });

  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_body', details: parsed.error });

  const items = parsed.data.items.map((i) => {
    const p = db.productsById.get(i.productId);
    if (!p) return null;
    return {
      productId: p.id,
      nameSnapshot: p.name,
      priceCentsSnapshot: p.priceCents,
      shippingCentsSnapshot: p.shippingCents,
      quantity: i.quantity,
    };
  });

  if (items.some((i) => i === null)) return res.status(400).json({ error: 'unknown_product' });

  const typedItems = items as NonNullable<(typeof items)[number]>[];
  const subtotalCents = typedItems.reduce(
    (sum, i) => sum + i.priceCentsSnapshot * i.quantity,
    0,
  );
  const shippingCents = typedItems.reduce(
    (sum, i) => sum + i.shippingCentsSnapshot * i.quantity,
    0,
  );
  const totalCents = subtotalCents + shippingCents;

  const card = parsed.data.payment.cardNumber.replace(/\s+/g, '');
  const last4 = card.slice(-4).padStart(4, '•');

  const orderId = newId('order');
  const order = {
    id: orderId,
    userId: user.id,
    items: typedItems,
    subtotalCents,
    shippingCents,
    totalCents,
    shippingAddress: parsed.data.shippingAddress,
    payment: {
      brand: guessBrand(card),
      last4,
    },
    createdAt: Date.now(),
  };

  db.ordersById.set(orderId, order);

  return res.status(201).json({
    ok: true,
    order,
  });
});

app.get('/orders', requireAuth, (req: AuthedRequest, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'invalid_token' });
  const orders = [...db.ordersById.values()].filter((o) => o.userId === userId);
  orders.sort((a, b) => b.createdAt - a.createdAt);
  return res.json({ orders });
});

function guessBrand(card: string) {
  if (card.startsWith('4')) return 'Visa';
  if (/^5[1-5]/.test(card)) return 'Mastercard';
  if (card.startsWith('34') || card.startsWith('37')) return 'AmEx';
  if (card.startsWith('6')) return 'Discover';
  return 'Card';
}

app.listen(env.port, () => {
  console.log(`Kids Super Store API listening on ${env.apiOrigin}`);
  console.log(`Allowed web origin: ${env.webOrigin}`);
});
