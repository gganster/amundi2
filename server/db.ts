import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { databaseUrl } from './config';
import { PrismaClient } from './generated/prisma/client';

export const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: databaseUrl }) });
