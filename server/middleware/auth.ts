import type { NextFunction, Request, Response } from 'express';
import { jwtVerify, SignJWT } from 'jose';
import { jwtSecret, secureCookies } from '../config';

const COOKIE = 'session';
const SESSION_SECONDS = 7 * 24 * 60 * 60;
const key = new TextEncoder().encode(jwtSecret);
const cookieOptions = { httpOnly: true, sameSite: 'lax', secure: secureCookies, path: '/' } as const;

export const signSession = (userId: number) =>
  new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(String(userId)).setIssuedAt().setExpirationTime(`${SESSION_SECONDS}s`).sign(key);

export const setSessionCookie = (res: Response, token: string) =>
  res.cookie(COOKIE, token, { ...cookieOptions, maxAge: SESSION_SECONDS * 1000 });

export const clearSessionCookie = (res: Response) => res.clearCookie(COOKIE, cookieOptions);

// Cookie header parsed by hand: one cookie is read, no need for cookie-parser.
function readSessionCookie(req: Request): string | undefined {
  for (const part of (req.headers.cookie ?? '').split(';')) {
    const [name, ...value] = part.trim().split('=');
    if (name === COOKIE) return value.join('=');
  }
  return undefined;
}

// Sets res.locals.userId, or answers 401. Stateless: a deleted user keeps a valid token until /auth/me rechecks the DB.
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = readSessionCookie(req);
  try {
    if (token) {
      const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
      const userId = Number(payload.sub);
      if (Number.isInteger(userId)) {
        res.locals['userId'] = userId;
        next();
        return;
      }
    }
  } catch {
    // Invalid or expired token: fall through to 401.
  }
  res.status(401).json({ error: 'unauthenticated' });
}
