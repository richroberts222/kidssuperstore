import type { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';
import { db } from './db.js';

export type AuthedRequest = Request & { userId?: string };

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.header('authorization') ?? '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1];
  if (!token) return res.status(401).json({ error: 'missing_token' });

  const session = db.sessionsByToken.get(token);
  if (!session) return res.status(401).json({ error: 'invalid_token' });

  req.userId = session.userId;
  next();
}

export function createSession(userId: string) {
  const token = `sess_${nanoid(24)}`;
  db.sessionsByToken.set(token, { userId, createdAt: Date.now() });
  return token;
}
