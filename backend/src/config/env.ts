import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  DATABASE_URL_TEST: z.string().optional(),
  JWT_SECRET: z.string().min(8),
  JWT_REFRESH_SECRET: z.string().min(8),
  SUPERADMIN_EMAIL: z.string().email(),
  FRONTEND_URL: z.string().url(),
  UPLOAD_DIR: z.string().default('./uploads'),
  PUBLIC_UPLOAD_BASE_URL: z.string().default('/uploads'),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().default(1.5),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data

export function getDatabaseUrl(): string {
  if (env.NODE_ENV === 'test' && env.DATABASE_URL_TEST) {
    return env.DATABASE_URL_TEST
  }
  return env.DATABASE_URL
}
