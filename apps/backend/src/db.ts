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
      name: 'Chocolate Chip “High-Five” Cookies (8-pack)',
      description: 'Classic chocolate chip, extra gooey. Comes with a big kid-made thank-you note (mock).',
      priceCents: 899,
      shippingCents: 349,
      imageUrl:
        'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=1200&q=60',
      category: 'Cookies',
      stock: 20,
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
      name: 'Beaded Necklace — “Galaxy Pop”',
      description: 'Sparkly beads with a tiny star charm. Looks like outer space, feels like fun.',
      priceCents: 899,
      shippingCents: 249,
      imageUrl:
        'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=60',
      category: 'Jewelry',
      stock: 18,
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
    {
      name: 'Sticker Pack: Tiny Dinosaurs',
      description: 'Roaringly adorable dinos. Perfect for water bottles, notebooks, and pretend shipping boxes.',
      priceCents: 349,
      shippingCents: 149,
      imageUrl:
        'https://images.unsplash.com/photo-1520951218513-214eacb1f6aa?auto=format&fit=crop&w=1200&q=60',
      category: 'Stickers',
      stock: 60,
    },
    {
      name: 'Mini Painting — “Sunset Scoops”',
      description: 'A tiny canvas painting with ice-cream-sunset colors. Signed by the artist (mock).',
      priceCents: 1299,
      shippingCents: 499,
      imageUrl:
        'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=60',
      category: 'Art',
      stock: 7,
    },
    {
      name: 'Craft Kit: Pom-Pom Critters',
      description: 'Make 3 fluffy critters with googly eyes. Includes tiny instructions (mock).',
      priceCents: 1099,
      shippingCents: 399,
      imageUrl:
        'https://images.unsplash.com/photo-1582571352032-448f7928eca7?auto=format&fit=crop&w=1200&q=60',
      category: 'Crafts',
      stock: 12,
    },
    {
      name: 'Keychain — “Lucky Lemon”',
      description: 'A cheerful lemon charm keychain. Great for backpacks and keys.',
      priceCents: 599,
      shippingCents: 199,
      imageUrl:
        'https://images.unsplash.com/photo-1580913428706-c311e67898b3?auto=format&fit=crop&w=1200&q=60',
      category: 'Accessories',
      stock: 30,
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
