
export function getErrorMessage(data: unknown, fallback: string): string {
  const message = (data as { message?: unknown } | null)?.message;
  if (Array.isArray(message)) return message.join("\n");
  if (typeof message === "string") return message;
  return fallback;
}

export async function readJsonBody(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export const AUTH_ERROR_MESSAGES = {
  connectionProblem: "Connection problem. Please try again",
  incompleteSession: "Server returned an incomplete session. Please try again",
};
