import { useAuthStore } from "@/src/store/useAuthStore";
import { useCallback, useEffect, useRef, useState } from "react";

export type CursorPage<T> = { data: T[]; nextCursor: string | null };

export function usePaginatedCursorList<T>(
  fetchPage: (cursor: string | null) => Promise<CursorPage<T>>,
  resetKey: unknown,
) {
  const [items, setItems] = useState<T[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const isLoadingRef = useRef(false);

  const requestIdRef = useRef(0);
  const lastCursorRef = useRef<string | null>(null);

  const fetchPageRef = useRef(fetchPage);
  fetchPageRef.current = fetchPage;

  const load = useCallback(
    async (cursor: string | null, isRefresh = false, silent = false) => {
      const requestId = ++requestIdRef.current;
      lastCursorRef.current = cursor;
      isLoadingRef.current = true;

      if (!silent) {
        if (isRefresh) {
          setRefreshing(true);
        } else if (!cursor) {
          setInitialLoading(true);
        } else {
          setLoading(true);
        }
      }

      try {
        const page = await fetchPageRef.current(cursor);

        if (requestId !== requestIdRef.current) return;

        setItems((prev) => (cursor ? [...prev, ...page.data] : page.data));
        setNextCursor(page.nextCursor);
        setError(false);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        console.error("Loading error", err);
        setError(true);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setInitialLoading(false);
          setRefreshing(false);
          isLoadingRef.current = false;
        }
      }
    },
    [],
  );

  const isLoggedIn = useAuthStore((state) => !!state.user);

  useEffect(() => {
    if (!isLoggedIn) return;
    setItems([]);
    setNextCursor(null);
    setInitialLoading(true);
    load(null);
  }, [resetKey, load, isLoggedIn]);

  const loadMore = useCallback(() => {
    if (nextCursor && !isLoadingRef.current) {
      load(nextCursor);
    }
  }, [nextCursor, load]);

  const refresh = useCallback(() => {
    load(null, true);
  }, [load]);

  const reload = useCallback(() => {
    load(null, false, true);
  }, [load]);

  const retry = useCallback(() => {
    load(lastCursorRef.current);
  }, [load]);

  return {
    items,
    loadMore,
    loading,
    initialLoading,
    refreshing,
    error,
    retry,
    hasMore: nextCursor !== null,
    refresh,
    reload,
  };
}
