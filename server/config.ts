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
