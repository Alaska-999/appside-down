import { useEffect, useState } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

export function useServerError<T extends FieldValues>(form: UseFormReturn<T>) {
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    const subscription = form.watch(() => setServerError(null));
    return () => subscription.unsubscribe();
  }, [form]);

  return [serverError, setServerError] as const;
}
