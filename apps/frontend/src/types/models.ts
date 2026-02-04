export type User = {
  id: string;
  email: string;
  displayName: string;
  verified?: boolean;
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

export type CartLine = {
  productId: string;
  quantity: number;
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
