export interface ApiEnv {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  REDIS_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_WEBHOOK_SECRET: string;
  TELEGRAM_WEBHOOK_URL: string;
  OPENROUTER_API_KEY: string;
  OPENROUTER_MODEL: string;
  ENCRYPTION_KEY_HEX: string;
}

export function loadEnv(): ApiEnv {
  return {
    NODE_ENV: process.env.NODE_ENV ?? "development",
    PORT: Number(process.env.PORT ?? 3001),
    DATABASE_URL: process.env.DATABASE_URL ?? "",
    REDIS_URL: process.env.REDIS_URL ?? "",
    JWT_SECRET: process.env.JWT_SECRET ?? "",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "1d",
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ?? "",
    TELEGRAM_WEBHOOK_SECRET: process.env.TELEGRAM_WEBHOOK_SECRET ?? "",
    TELEGRAM_WEBHOOK_URL: process.env.TELEGRAM_WEBHOOK_URL ?? "",
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ?? "",
    OPENROUTER_MODEL: process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
    ENCRYPTION_KEY_HEX: process.env.ENCRYPTION_KEY_HEX ?? "",
  };
}

export const env = loadEnv();
