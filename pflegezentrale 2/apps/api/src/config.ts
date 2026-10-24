export const CONFIG = Symbol('CONFIG');

export interface Config {
  databaseUrl: string;
  jwtSecret: string;
  accessTtlSeconds: number;
  refreshTtlDays: number;
  allowRegistration: boolean;
  inviteTtlDays: number;
  loginMaxAttempts: number;
  loginWindowMs: number;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const jwtSecret = env.JWT_SECRET ?? '';
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET muss gesetzt sein und mindestens 32 Zeichen haben');
  }
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL muss gesetzt sein');
  }
  return {
    databaseUrl: env.DATABASE_URL,
    jwtSecret,
    accessTtlSeconds: Number(env.ACCESS_TTL_SECONDS ?? 900),
    refreshTtlDays: Number(env.REFRESH_TTL_DAYS ?? 30),
    allowRegistration: env.ALLOW_REGISTRATION === 'true',
    inviteTtlDays: Number(env.INVITE_TTL_DAYS ?? 7),
    loginMaxAttempts: Number(env.LOGIN_MAX_ATTEMPTS ?? 10),
    loginWindowMs: Number(env.LOGIN_WINDOW_MS ?? 15 * 60 * 1000),
  };
}
