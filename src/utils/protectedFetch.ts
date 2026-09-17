import { API_BASE_URL } from "@/src/api/config";
import { useAuthStore } from "@/src/store/useAuthStore";
import * as SecureStore from "expo-secure-store";

// для FormData (наприклад завантаження файлу) НЕ можна ставити
// Content-Type вручну — fetch сам додає multipart boundary,
// а наш "application/json" зламав би запит
const buildHeaders = (options: RequestInit, token: string): HeadersInit => {
  const isFormData = options.body instanceof FormData;
  return {
    ...options.headers,
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    Authorization: `Bearer ${token}`,
  };
};

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = (): Promise<string> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const rt = await SecureStore.getItemAsync("refreshToken");
    if (!rt) {
      const wasLoggedIn = !!useAuthStore.getState().user;
      useAuthStore.getState().logout({ expired: wasLoggedIn });
      throw new Error("No refresh token found");
    }

    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });

    if (!res.ok) {
      useAuthStore.getState().logout({ expired: true });
      throw new Error("Failed to refresh token");
    }

    const data = await res.json().catch(() => null);
    if (!data?.access_token) {
      useAuthStore.getState().logout({ expired: true });
      throw new Error("Refresh response did not contain an access token");
    }

    useAuthStore.getState().setToken(data.access_token);
    if (data.refresh_token) {
      await SecureStore.setItemAsync("refreshToken", data.refresh_token);
    }
    return data.access_token as string;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

const RATE_LIMIT_MAX_WAIT_MS = 5000;

const retryAfterMs = (response: Response) => {
  const header =
    response.headers.get("Retry-After") ??
    response.headers.get("Retry-After-global");
  const seconds = Number(header);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  const ms = seconds * 1000;
  return ms > RATE_LIMIT_MAX_WAIT_MS ? null : ms;
};

export const protectedFetch = async (
  url: string,
  options: RequestInit = {},
  _retried = false,
  _throttleRetried = false,
): Promise<Response> => {
  let token = useAuthStore.getState().token;
  if (!token) {
    token = await refreshAccessToken();
  }

  const response = await fetch(url, {
    ...options,
    headers: buildHeaders(options, token),
  });

  if (response.status === 429 && !_throttleRetried) {
    const wait = retryAfterMs(response);
    if (wait !== null) {
      await new Promise((resolve) => setTimeout(resolve, wait));
      return protectedFetch(url, options, _retried, true);
    }
    return response;
  }

  if (response.status !== 401 || _retried) {
    return response;
  }

  await refreshAccessToken();
  return protectedFetch(url, options, true, _throttleRetried);
};
