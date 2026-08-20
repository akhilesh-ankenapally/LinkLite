import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // fallback to current working directory

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.union([z.string(), z.number()]).transform((val) => Number(val)).default(3000),
  BASE_URL: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  CORS_ORIGINS: z.string().default('*'),
  RATE_LIMIT_WINDOW_MS: z.union([z.string(), z.number()]).transform((val) => Number(val)).default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.union([z.string(), z.number()]).transform((val) => Number(val)).default(100),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables configuration:', JSON.stringify(_env.error.format(), null, 2));
  if (process.env.NODE_ENV !== 'production' && !process.env.DATABASE_URL) {
    console.warn('⚠️ DATABASE_URL is missing. Please set DATABASE_URL in .env before connecting to database.');
  }
}

export const env = _env.success
  ? _env.data
  : {
      NODE_ENV: (process.env.NODE_ENV as 'development' | 'test' | 'production') || 'development',
      PORT: parseInt(process.env.PORT || '3000', 10),
      BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/linklite?schema=public',
      CORS_ORIGINS: process.env.CORS_ORIGINS || '*',
      RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
      RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    };
