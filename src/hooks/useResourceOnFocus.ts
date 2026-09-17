import { useFocusEffect } from "expo-router";
import { DependencyList, useCallback, useRef } from "react";

interface UseResourceOnFocusOptions {
  skipFirstFocus?: boolean;
}

export function useResourceOnFocus(
  deps: DependencyList,
  run: (isFirstLoad: boolean) => void,
  options?: UseResourceOnFocusOptions,
) {
  const hasLoadedRef = useRef(false);
  const runRef = useRef(run);
  runRef.current = run;
  const skipFirstFocus = options?.skipFirstFocus ?? false;

  useFocusEffect(
    useCallback(() => {
      const isFirstLoad = !hasLoadedRef.current;
      if (skipFirstFocus && isFirstLoad) {
        hasLoadedRef.current = true;
        return;
      }
      runRef.current(isFirstLoad);
    }, deps),
  );

  const markLoaded = useCallback(() => {
    hasLoadedRef.current = true;
  }, []);

  return { markLoaded };
}
