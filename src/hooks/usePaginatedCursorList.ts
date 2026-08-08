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

  // A synchronous flag to prevent duplicate requests
  const isLoadingRef = useRef(false);

  // Keep the actual fetchPage function without recreating dependencies
  const fetchPageRef = useRef(fetchPage);
  fetchPageRef.current = fetchPage;

  const load = useCallback(async (cursor: string | null) => {
    // If the request is already being executed, ignore new calls
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setLoading(true);

    try {
      const page = await fetchPageRef.current(cursor);

      // If cursor is null, it's the first page (overwrite), otherwise append to the end
      setItems((prev) => (cursor ? [...prev, ...page.data] : page.data));
      setNextCursor(page.nextCursor);
    } catch (err) {
      console.error("Loading error", err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
      isLoadingRef.current = false;
    }
  }, []);


  const isLoggedIn = useAuthStore((state) => !!state.user);

  //on resetKey change reload data
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
    load(null);
  }, [load]);

  return {
    items,
    loadMore,
    loading,
    initialLoading,
    hasMore: nextCursor !== null,
    refresh,
  };
}