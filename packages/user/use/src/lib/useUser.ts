import { useCallback, useState, useMemo, useEffect } from 'react';
import { useStorage, useFetch } from '@quarks/share-use';
import type { IUser } from '@quarks/user-data';
import type { Paginated } from '@quarks/share-domain';

const STORAGE = 'user';

type PaginatedUser = Paginated<IUser> | null;

export const useUser = () => {
  const [users, setUsers] = useStorage<Record<string, PaginatedUser>>(
    STORAGE,
    {},
  );
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);

  const customFetch = useFetch('token');
  const getUser = useCallback((num: number) => setPage((e) => e + num), []);
  const pageUser = useMemo(() => users[String(page)] ?? null, [users, page]);

  useEffect(() => {
    let cancelled = false;
    if (users[String(page)]) return;

    setIsLoading(true);
    customFetch<PaginatedUser>(`/api/users?page=${page}`)
      .then((data) => {
        if (cancelled) return;
        setUsers((e: Record<string, PaginatedUser>) => ({
          ...e,
          [String(page)]: data,
        }));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, setUsers, customFetch]);

  return {
    nextPage: () => getUser(1),
    prevPage: () => getUser(-1),
    users,
    isLoading,
    page: pageUser,
    setPage,
  };
};
