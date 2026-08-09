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

  // A synchronous flag to throttle duplicate pagination requests
  const isLoadingRef = useRef(false);

  // Every load() call gets a new id; only the latest one is allowed to apply
  // its results, so a reset/refresh started while a request is in flight
  // always supersedes it instead of being silently dropped
  const requestIdRef = useRef(0);
  const lastCursorRef = useRef<string | null>(null);

  // Keep the actual fetchPage function without recreating dependencies
  const fetchPageRef = useRef(fetchPage);
  fetchPageRef.current = fetchPage;

  const load = useCallback(async (cursor: string | null, isRefresh = false) => {
    const requestId = ++requestIdRef.current;
    lastCursorRef.current = cursor;
    isLoadingRef.current = true;

    if (isRefresh) {
      setRefreshing(true);
    } else if (!cursor) {
      setInitialLoading(true);
    } else {
      setLoading(true);
    }

    try {
      const page = await fetchPageRef.current(cursor);

      // A newer request has already started; ignore this stale response
      if (requestId !== requestIdRef.current) return;

      // If cursor is null, it's the first page (overwrite), otherwise append to the end
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
  }, []);

  const isLoggedIn = useAuthStore((state) => !!state.user);

  //on resetKey change reload data, always superseding any in-flight request
  useEffect(() => {
    if (!isLoggedIn) return;
    setItems([]);
    setNextCursor(null);
    setInitialLoading(true);
    load(null);
  }, [resetKey, load, isLoggedIn]);

  //calls when scroll to the end
  const loadMore = useCallback(() => {
    if (nextCursor && !isLoadingRef.current) {
      load(nextCursor);
    }
  }, [nextCursor, load]);

  //Pull-to-refresh
  const refresh = useCallback(() => {
    load(null, true);
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
  };
}
