//helps to read array of errors from ValidationPipe

export function getErrorMessage(data: unknown, fallback: string): string {
  const message = (data as { message?: unknown } | null)?.message;
  if (Array.isArray(message)) return message.join("\n");
  if (typeof message === "string") return message;
  return fallback;
}
