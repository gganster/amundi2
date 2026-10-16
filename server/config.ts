import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

// Resolved from the bundled server entry (dist/amundi2/server), not from this file.
const serverDistFolder = dirname(fileURLToPath(import.meta.url));

export const browserDistFolder = resolve(serverDistFolder, '../browser');
export const indexHtml = join(serverDistFolder, 'index.server.html');
export const port = process.env['PORT'] || 4000;

// Hosts the SSR engine accepts (Angular 21 SSRF protection). Comma-separated env override.
export const allowedHosts = (process.env['ALLOWED_HOSTS'] ?? 'localhost').split(',');

// Relative file: URLs resolve against the process cwd, so start the server from the repo root.
export const databaseUrl = process.env['DATABASE_URL'] ?? 'file:./prisma/dev.db';

export const secureCookies = process.env['NODE_ENV'] === 'production';

// HS256 signing key for session JWTs. Rotating it signs every user out.
const devSecret = 'dev-only-secret-change-me-0123456789';
export const jwtSecret = (() => {
  const secret = process.env['JWT_SECRET'];
  if (secret) {
    if (secret.length < 32) throw new Error('JWT_SECRET must be at least 32 characters');
    return secret;
  }
  if (secureCookies) throw new Error('JWT_SECRET is required in production');
  console.warn('JWT_SECRET not set: using an insecure development secret');
  return devSecret;
})();
