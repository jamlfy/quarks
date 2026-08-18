import { useCallback, useRef, useEffect } from 'react';
import { useStorage } from './useStorage';

export function useFetch(initialToken?: string) {
  const [storedToken, setStoredToken] = useStorage('auth_token', initialToken);
  const tokenRef = useRef(storedToken);

  useEffect(() => {
    tokenRef.current = storedToken;
  }, [storedToken]);

  const customFetch = useCallback(
    async <T>(
      endpoint: string,
      options: RequestInit = {},
      n = 5,
      overrideToken?: string,
    ): Promise<T> => {
      const activeToken = overrideToken ?? tokenRef.current;

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        ...options.headers,
      };

      const response = await fetch(endpoint, {
        ...options,
        headers,
      });

      if (response.status === 401 && activeToken && n > 0) {
        try {
          const refreshRes = await fetch('/v1/auth/', {
            method: 'POST',
            headers: { Authorization: `Bearer ${activeToken}` },
          });

          if (!refreshRes.ok) {
            throw new Error('Session has expired. Please log in again.');
          }

          const data = await refreshRes.json();
          const newToken = data.token || data;

          setStoredToken(newToken);
          tokenRef.current = newToken;

          return customFetch<T>(endpoint, options, n - 1, newToken);
        } catch (err) {
          setStoredToken('');
          throw err;
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Request error');
      }

      return response.json();
    },
    [setStoredToken],
  );

  return customFetch;
}
