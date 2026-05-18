import { describe, it, expect } from 'vitest';
import config from '../database';

// Minimal mock of Strapi's env helper
function makeEnv(vars: Record<string, string | undefined>) {
  const env = (key: string, defaultValue?: unknown) => vars[key] ?? defaultValue;
  env.int = (key: string, defaultValue?: number) => {
    const val = vars[key];
    return val !== undefined ? parseInt(val, 10) : defaultValue;
  };
  env.bool = (key: string, defaultValue?: boolean) => {
    const val = vars[key];
    if (val === undefined) return defaultValue;
    return val === 'true';
  };
  return env as unknown as Parameters<typeof config>[0]['env'];
}

describe('database config', () => {
  it('uses sqlite when DATABASE_CLIENT is sqlite', () => {
    const result = config({ env: makeEnv({ DATABASE_CLIENT: 'sqlite' }) });
    expect(result.connection.client).toBe('sqlite');
    expect(result.connection.useNullAsDefault).toBe(true);
  });

  it('uses postgres when DATABASE_CLIENT is postgres', () => {
    const result = config({
      env: makeEnv({ DATABASE_CLIENT: 'postgres', DATABASE_URL: 'postgresql://user:pass@host/db' }),
    });
    expect(result.connection.client).toBe('postgres');
    expect((result.connection.connection as Record<string, unknown>)?.connectionString).toBe(
      'postgresql://user:pass@host/db'
    );
  });

  it('postgres SSL always has rejectUnauthorized: false', () => {
    const result = config({
      env: makeEnv({ DATABASE_CLIENT: 'postgres', DATABASE_URL: 'postgresql://user:pass@host/db' }),
    });
    const ssl = (result.connection.connection as Record<string, unknown>)?.ssl as Record<string, unknown>;
    expect(ssl?.rejectUnauthorized).toBe(false);
  });

  it('postgres pool defaults to min 2 max 4', () => {
    const result = config({
      env: makeEnv({ DATABASE_CLIENT: 'postgres', DATABASE_URL: 'postgresql://user:pass@host/db' }),
    });
    expect(result.connection.pool?.min).toBe(2);
    expect(result.connection.pool?.max).toBe(4);
  });

  it('postgres pool respects DATABASE_POOL_MIN and DATABASE_POOL_MAX env vars', () => {
    const result = config({
      env: makeEnv({
        DATABASE_CLIENT: 'postgres',
        DATABASE_URL: 'postgresql://user:pass@host/db',
        DATABASE_POOL_MIN: '1',
        DATABASE_POOL_MAX: '3',
      }),
    });
    expect(result.connection.pool?.min).toBe(1);
    expect(result.connection.pool?.max).toBe(3);
  });
});
