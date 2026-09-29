import { PrismaClient } from '@prisma/client';
import { config } from './index';

export const prisma = new PrismaClient({
  log: config.isProduction ? ['error'] : ['error', 'warn'],
});

let isPostgresConnected = false;

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    // Attempt a lightweight query
    await prisma.$queryRaw`SELECT 1`;
    isPostgresConnected = true;
    console.log('✅ Connected to PostgreSQL database via Prisma.');
    return true;
  } catch (error: any) {
    isPostgresConnected = false;
    console.warn(
      '⚠️  Could not connect to PostgreSQL at ' +
        config.databaseUrl.replace(/:[^:@]*@/, ':****@') +
        '. Operating in resilient local storage mode.'
    );
    console.warn('💡 Tip: Start PostgreSQL using "docker compose up -d" and run "npm run db:push".');
    return false;
  }
}

export function isDbConnected(): boolean {
  return isPostgresConnected;
}
