import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: string;
  DB_URL: string;
  NODE_ENV: "development" | "production";
  BCRYPT_SALT_ROUND: string;

  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES: string;

  SUPER_ADMIN_EMAIL: string;
  SUPER_ADMIN_PASSWORD: string;
  SUPER_ADMIN_PHONE: string;

  EXPRESS_SESSION_SECRET: string;
  FRONTEND_URL: string;

  EMAIL_SENDER: {
    SMTP_USER: string;
    SMTP_PASS: string;
    SMTP_PORT: string;
    SMTP_HOST: string;
    SMTP_FROM: string;
  };

  REDIS_HOST: string;
  REDIS_PORT: string;
  REDIS_USERNAME: string;
  REDIS_PASSWORD: string;
}

const requiredEnvVariables = [
  "PORT",
  "DB_URL",
  "NODE_ENV",
  "BCRYPT_SALT_ROUND",
  "JWT_ACCESS_SECRET",
  "JWT_ACCESS_EXPIRES",
  "JWT_REFRESH_SECRET",
  "JWT_REFRESH_EXPIRES",
  "SUPER_ADMIN_EMAIL",
  "SUPER_ADMIN_PASSWORD",
  "SUPER_ADMIN_PHONE",
  "EXPRESS_SESSION_SECRET",
  "FRONTEND_URL",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_PORT",
  "SMTP_HOST",
  "SMTP_FROM",
  "REDIS_HOST",
  "REDIS_PORT",
  "REDIS_USERNAME",
  "REDIS_PASSWORD",
];

requiredEnvVariables.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
});

export const envVariables: EnvConfig = {
  PORT: process.env.PORT!,
  DB_URL: process.env.DB_URL!,
  NODE_ENV: process.env.NODE_ENV as "development" | "production",
  BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND!,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES!,

  SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL!,
  SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD!,
  SUPER_ADMIN_PHONE: process.env.SUPER_ADMIN_PHONE!,

  EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET!,
  FRONTEND_URL: process.env.FRONTEND_URL!,

  EMAIL_SENDER: {
    SMTP_USER: process.env.SMTP_USER!,
    SMTP_PASS: process.env.SMTP_PASS!,
    SMTP_PORT: process.env.SMTP_PORT!,
    SMTP_HOST: process.env.SMTP_HOST!,
    SMTP_FROM: process.env.SMTP_FROM!,
  },

  REDIS_HOST: process.env.REDIS_HOST!,
  REDIS_PORT: process.env.REDIS_PORT!,
  REDIS_USERNAME: process.env.REDIS_USERNAME!,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD!,
};
