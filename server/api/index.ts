import express, { Router } from 'express';
import type { ErrorRequestHandler } from 'express';
import { prisma } from '../db';
import { auth } from './auth';
import { portfolio } from './portfolio';
import { quotes } from './quotes';

// Mount feature routers here, one file per domain (e.g. api.use('/funds', funds)).
export const api = Router();

// JSON bodies only: other content types leave req.body empty and fail validation.
api.use(express.json({ limit: '10kb' }));

api.use('/quotes', quotes);
api.use('/auth', auth);
api.use('/portfolio', portfolio);

api.get('/health', (_req, res) => res.json({ status: 'ok', uptimeSeconds: Math.floor(process.uptime()) }));

// Placeholder: proves the DB wiring, replace with real domain routers.
api.get('/notes', async (_req, res, next) => {
  try {
    res.json(await prisma.note.findMany());
  } catch (err) {
    next(err);
  }
});

// JSON errors only (malformed body, unexpected failure): never an HTML page or a stack trace.
const onError: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = Number.isInteger(err?.status) && err.status >= 400 && err.status < 500 ? err.status : 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'internal error' : 'bad request' });
};
api.use(onError);
