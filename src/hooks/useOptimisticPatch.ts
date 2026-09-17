import { useCallback } from "react";

type OptimisticPatchOptions = {
  apply: () => void;
  revert: () => void;
  request: () => Promise<Response>;
  errorMessage: string;
  onLog?: string;
};

export function useOptimisticPatch(onError: (message: string) => void) {
  return useCallback(
    async ({
      apply,
      revert,
      request,
      errorMessage,
      onLog,
    }: OptimisticPatchOptions) => {
      apply();
      try {
        const res = await request();
        if (!res.ok) throw new Error(`Error: ${res.status}`);
      } catch (err) {
        console.error(`[${onLog ?? "useOptimisticPatch"}] error:`, err);
        revert();
        onError(errorMessage);
      }
    },
    [onError],
  );
}
