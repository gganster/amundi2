import { Router } from 'express';
import type { Request } from 'express';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';

// Same format as server/api/quotes.ts (kept there untouched): the ticker is later sent to quotes.
const TICKER_RE = /^[A-Z0-9-]{1,10}(\.[A-Z]{1,3})?$/;

export const portfolio = Router();
portfolio.use(requireAuth);

const userId = (res: { locals: Record<string, unknown> }) => res.locals['userId'] as number;

// Parses a position body; returns the data or an error message.
function parsePosition(body: Request['body']): { data: { ticker: string; quantity: number; unitCost: number; purchasedAt: Date } } | { error: string } {
  const ticker = String(body?.ticker ?? '').trim().toUpperCase();
  const { quantity, unitCost } = body ?? {};
  const purchasedAt = typeof body?.purchasedAt === 'string' ? new Date(body.purchasedAt) : new Date(NaN);
  if (!TICKER_RE.test(ticker)) return { error: 'invalid ticker' };
  if (typeof quantity !== 'number' || !Number.isFinite(quantity) || quantity <= 0) return { error: 'quantity must be a number > 0' };
  if (typeof unitCost !== 'number' || !Number.isFinite(unitCost) || unitCost < 0) return { error: 'unitCost must be a number >= 0' };
  if (Number.isNaN(purchasedAt.getTime())) return { error: 'invalid purchasedAt' };
  return { data: { ticker, quantity, unitCost, purchasedAt } };
}

portfolio.get('/positions', async (_req, res, next) => {
  try {
    res.json(await prisma.position.findMany({ where: { userId: userId(res) }, orderBy: [{ purchasedAt: 'desc' }, { id: 'desc' }] }));
  } catch (err) {
    next(err);
  }
});

portfolio.post('/positions', async (req, res, next) => {
  const parsed = parsePosition(req.body);
  if ('error' in parsed) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  try {
    res.status(201).json(await prisma.position.create({ data: { ...parsed.data, userId: userId(res) } }));
  } catch (err) {
    next(err);
  }
});

// Another user's position is indistinguishable from a missing one: both 404.
portfolio.put('/positions/:id', async (req, res, next) => {
  const id = Number(req.params['id']);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'invalid id' });
    return;
  }
  const parsed = parsePosition(req.body);
  if ('error' in parsed) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  try {
    const { count } = await prisma.position.updateMany({ where: { id, userId: userId(res) }, data: parsed.data });
    if (count === 0) {
      res.status(404).json({ error: 'not found' });
      return;
    }
    res.json(await prisma.position.findUnique({ where: { id } }));
  } catch (err) {
    next(err);
  }
});

portfolio.delete('/positions/:id', async (req, res, next) => {
  const id = Number(req.params['id']);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'invalid id' });
    return;
  }
  try {
    const { count } = await prisma.position.deleteMany({ where: { id, userId: userId(res) } });
    if (count === 0) {
      res.status(404).json({ error: 'not found' });
      return;
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
