import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email().max(120),
  password: z.string().min(6).max(200),
  displayName: z.string().min(1).max(50),
});

export const signinSchema = z.object({
  email: z.string().email().max(120),
  password: z.string().min(6).max(200),
});

export const productUpsertSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().min(1).max(500),
  priceCents: z.number().int().min(0),
  shippingCents: z.number().int().min(0),
  imageUrl: z.string().max(200000).optional(),
  category: z.string().max(40).optional(),
  stock: z.number().int().min(0).max(9999).default(0),
});

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1),
  shippingAddress: z.object({
    fullName: z.string().min(1).max(80),
    email: z.string().email().max(120),
    address1: z.string().min(1).max(120),
    address2: z.string().max(120).optional(),
    city: z.string().min(1).max(80),
    state: z.string().min(1).max(40),
    zip: z.string().min(3).max(20),
  }),
  payment: z.object({
    cardNumber: z.string().min(12).max(30),
    exp: z.string().min(3).max(10),
    cvc: z.string().min(3).max(6),
    nameOnCard: z.string().min(1).max(80),
  }),
});
