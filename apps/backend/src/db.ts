import { nanoid } from 'nanoid';

export type User = {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  verified: boolean;
  verifyToken?: string;
  createdAt: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  shippingCents: number;
  imageUrl?: string;
  category?: string;
  stock: number;
  createdByUserId: string;
  createdAt: number;
  updatedAt: number;
};

export type OrderItem = {
  productId: string;
  nameSnapshot: string;
  priceCentsSnapshot: number;
  shippingCentsSnapshot: number;
  quantity: number;
};

export type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
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
    brand: string;
    last4: string;
  };
  createdAt: number;
};

export const db = {
  usersByEmail: new Map<string, User>(),
  usersById: new Map<string, User>(),
  sessionsByToken: new Map<string, { userId: string; createdAt: number }>(),
  productsById: new Map<string, Product>(),
  ordersById: new Map<string, Order>(),
};

export function newId(prefix: string) {
  return `${prefix}_${nanoid(12)}`;
}

export function seedProducts(ownerUserId: string) {
  const now = Date.now();
  const seeds: Omit<Product, 'id' | 'createdByUserId' | 'createdAt' | 'updatedAt'>[] = [
    {
      name: 'Sunny Lemonade Cookies (6-pack)',
      description: 'Soft cookies with a zingy lemon drizzle. Perfect for a pretend drive-by snack stop.',
      priceCents: 799,
      shippingCents: 299,
      imageUrl:
        'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=60',
      category: 'Cookies',
      stock: 25,
    },
    {
      name: 'Friendship Bracelet — Rainbow',
      description: 'Handmade bracelet with bright rainbow thread. Adjustable knot, comfy fit.',
      priceCents: 499,
      shippingCents: 199,
      imageUrl:
        'https://images.unsplash.com/photo-1520962917969-0f8f3b6b7f8a?auto=format&fit=crop&w=1200&q=60',
      category: 'Jewelry',
      stock: 40,
    },
    {
      name: 'Sticker Pack: Silly Fruits',
      description: 'A sheet of cute fruit stickers (banana, strawberry, apple) with googly eyes.',
      priceCents: 299,
      shippingCents: 149,
      imageUrl:
        'https://images.unsplash.com/photo-1528813860492-b3010ecf8b26?auto=format&fit=crop&w=1200&q=60',
      category: 'Stickers',
      stock: 80,
    },
  ];

  for (const seed of seeds) {
    const id = newId('prod');
    db.productsById.set(id, {
      id,
      createdByUserId: ownerUserId,
      createdAt: now,
      updatedAt: now,
      ...seed,
    });
  }
}
