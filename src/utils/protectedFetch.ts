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
    const userId = useAuthStore.getState().user?.id;
    if (!rt || !userId) {
      useAuthStore.getState().logout();
      throw new Error("No refresh token found");
    }

    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, refreshToken: rt }),
    });

    if (!res.ok) {
      useAuthStore.getState().logout();
      throw new Error("Failed to refresh token");
    }

    const data = await res.json();
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

export const protectedFetch = async (
  url: string,
  options: RequestInit = {},
  _retried = false,
): Promise<Response> => {
  const token = useAuthStore.getState().token;
  if (!token) {
    throw new Error("No token found");
  }

  const response = await fetch(url, {
    ...options,
    headers: buildHeaders(options, token),
  });

  if (response.status !== 401 || _retried) {
    return response;
  }

  await refreshAccessToken();
  return protectedFetch(url, options, true);
};
