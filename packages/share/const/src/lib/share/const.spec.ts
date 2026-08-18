import { getEnv, ENV, DEFAULTS } from './const';

describe('share/const', () => {
  it('exposes the environment variable names', () => {
    expect(ENV.HOST).toBe('HOST');
    expect(ENV.DATABASE_URL).toBe('DATABASE_URL');
    expect(DEFAULTS.HOST).toBe('localhost');
  });

  it('resolves values from the provided env object first', () => {
    expect(
      getEnv({ HOST: 'https://api.example.com' }, 'HOST', 'fallback'),
    ).toBe('https://api.example.com');
  });

  it('falls back to the fallback value when the key is missing', () => {
    expect(getEnv(undefined, 'MISSING', 'fallback')).toBe('fallback');
  });
});
