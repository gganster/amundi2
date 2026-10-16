import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { prisma } from '../db';
import { clearSessionCookie, requireAuth, setSessionCookie, signSession } from '../middleware/auth';

// Adjust after measuring on the target machine.
const BCRYPT_COST = 12;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Compared against when the e-mail is unknown, so both login failures take comparable time.
const dummyHash = bcrypt.hash('not-a-real-password', BCRYPT_COST);

export const auth = Router();

auth.post('/register', async (req, res, next) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = req.body?.password;
  if (!EMAIL_RE.test(email) || email.length > 254) {
    res.status(400).json({ error: 'invalid email' });
    return;
  }
  if (typeof password !== 'string' || password.length < 8) {
    res.status(400).json({ error: 'password must be at least 8 characters' });
    return;
  }
  // bcrypt only reads the first 72 bytes: refuse rather than truncate silently.
  if (bcrypt.truncates(password)) {
    res.status(400).json({ error: 'password must be at most 72 bytes' });
    return;
  }

  try {
    const user = await prisma.user.create({ data: { email, passwordHash: await bcrypt.hash(password, BCRYPT_COST) } });
    setSessionCookie(res, await signSession(user.id));
    res.status(201).json({ id: user.id, email: user.email });
  } catch (err) {
    if ((err as { code?: string }).code === 'P2002') {
      res.status(409).json({ error: 'email already registered' });
      return;
    }
    next(err);
  }
});

auth.post('/login', async (req, res, next) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = req.body?.password;
  try {
    const user = typeof password === 'string' ? await prisma.user.findUnique({ where: { email } }) : null;
    const ok = await bcrypt.compare(typeof password === 'string' ? password : '', user?.passwordHash ?? (await dummyHash));
    if (!user || !ok) {
      res.status(401).json({ error: 'invalid credentials' });
      return;
    }
    setSessionCookie(res, await signSession(user.id));
    res.json({ id: user.id, email: user.email });
  } catch (err) {
    next(err);
  }
});

auth.post('/logout', (_req, res) => {
  clearSessionCookie(res);
  res.status(204).end();
});

auth.get('/me', requireAuth, async (_req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: res.locals['userId'] }, select: { id: true, email: true } });
    if (!user) {
      clearSessionCookie(res);
      res.status(401).json({ error: 'unauthenticated' });
      return;
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});
