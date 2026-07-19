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

export const protectedFetch = async (
  url: string,
  options: RequestInit = {},
) => {
  const token = useAuthStore.getState().token;
  const userId = useAuthStore.getState().user?.id;
  if (!token) {
    throw new Error("No token found");
  }

  const headers = buildHeaders(options, token);
  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    console.log("401 refetch");
    const refreshToken = await SecureStore.getItemAsync("refreshToken");
    if (!refreshToken) {
      useAuthStore.getState().logout();
      throw new Error("No refresh token found");
    }

    const refreshResponse = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, refreshToken }),
      },
    );

    if (!refreshResponse.ok) {
      useAuthStore.getState().logout();
      throw new Error("Failed to refresh token");
    }

    const data = await refreshResponse.json();
    useAuthStore
      .getState()
      .setAuth(useAuthStore.getState().user!, data.access_token);
    if (data.refresh_token) {
      await SecureStore.setItemAsync("refreshToken", data.refresh_token);
    }

    return fetch(url, {
      ...options,
      headers: buildHeaders(options, data.access_token),
    });
  }

  return response;
};
