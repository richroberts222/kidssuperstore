import { config } from './config';
import type { Order, Product, User } from '../types/models';

export type ApiError = {
  error: string;
  message?: string;
  details?: unknown;
  verifyUrl?: string;
};

export type ProductUpsert = {
  name: string;
  description: string;
  priceCents: number;
  shippingCents: number;
  imageUrl?: string;
  category?: string;
  stock: number;
};

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (options.token) headers.authorization = `Bearer ${options.token}`;

  const res = await fetch(`${config.apiUrl}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : undefined;

  if (!res.ok) {
    throw (data ?? { error: 'unknown_error' }) as ApiError;
  }
  return data as T;
}

export const api = {
  health: () => request<{ ok: boolean }>('/health'),

  signup: (body: { email: string; password: string; displayName: string }) =>
    request<{ ok: true; message: string; verifyUrl: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  signin: (body: { email: string; password: string }) =>
    request<{ ok: true; token: string; user: User }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  me: (token: string) => request<User & { verified: boolean }>('/me', { token }),

  listProducts: () => request<{ products: Product[] }>('/products'),

  createProduct: (token: string, body: ProductUpsert) =>
    request<{ product: Product }>('/products', {
      method: 'POST',
      token,
      body: JSON.stringify(body),
    }),

  updateProduct: (token: string, id: string, body: ProductUpsert) =>
    request<{ product: Product }>(`/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(body),
    }),

  deleteProduct: (token: string, id: string) =>
    request<{ ok: true }>(`/products/${encodeURIComponent(id)}`, { method: 'DELETE', token }),

  checkout: (token: string, body: {
    items: { productId: string; quantity: number }[];
    shippingAddress: {
      fullName: string;
      email: string;
      address1: string;
      address2?: string;
      city: string;
      state: string;
      zip: string;
    };
    payment: {
      cardNumber: string;
      exp: string;
      cvc: string;
      nameOnCard: string;
    };
  }) =>
    request<{ ok: true; order: Order }>('/checkout', {
      method: 'POST',
      token,
      body: JSON.stringify(body),
    }),

  listOrders: (token: string) => request<{ orders: Order[] }>('/orders', { token }),

  devOutbox: () => request<{ verifications: { email: string; verifyUrl: string }[] }>('/dev/outbox'),
};
