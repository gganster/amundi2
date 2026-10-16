import { Router } from 'express';
import { prisma } from '../db';

// Mount feature routers here, one file per domain (e.g. api.use('/funds', funds)).
export const api = Router();

api.get('/health', (_req, res) => res.json({ status: 'ok', uptimeSeconds: Math.floor(process.uptime()) }));

// Placeholder: proves the DB wiring, replace with real domain routers.
api.get('/notes', async (_req, res, next) => {
  try {
    res.json(await prisma.note.findMany());
  } catch (err) {
    next(err);
  }
});
