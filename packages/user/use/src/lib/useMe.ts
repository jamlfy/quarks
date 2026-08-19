import { useMemo, useCallback, useEffect } from 'react';
import { useStorage, useFetch } from '@quarks/share-use';

const STORAGE = 'me';

export const useAuth = () => {
  const [me, setMe] = useStorage<Record<string, unknown>>(STORAGE, {});
  const [token, setToken] = useStorage('token', '');
  const customFetch = useFetch(token);

  const isLogin = useMemo(() => !!token, [token]);

  const login = useCallback(
    async (social: string) => {
      if (isLogin) return;
      const { authUrl } = await customFetch<{ authUrl?: string }>(
        `/api/social/${social}`,
      );
      if (authUrl) window.location.assign(authUrl);
    },
    [isLogin, customFetch],
  );

  const getMe = useCallback(async () => {
    if (isLogin) return;
    const data = await customFetch(`/api/me`);
    setMe(data as Record<string, unknown>);
  }, [isLogin, customFetch, setMe]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    if (tokenParam) setToken(tokenParam);
    getMe();
  }, [setToken, getMe]);

  return {
    isLogin,
    login,
    getMe,
    me,
  };
};
