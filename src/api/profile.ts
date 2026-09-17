import { API_BASE_URL } from "@/src/api/config";
import { UserProfile } from "@/src/types";
import { protectedFetch } from "@/src/utils/protectedFetch";

export async function fetchCurrentUserProfile(): Promise<Partial<UserProfile> | null> {
  try {
    const response = await protectedFetch(`${API_BASE_URL}/users/me`);
    if (!response.ok) return null;

    const data = await response.json().catch(() => null);
    if (!data?.id) return null;

    return {
      id: data.id,
      email: data.email,
      username: data.username,
      avatarUrl: data.avatarUrl ?? null,
      createdAt: data.createdAt,
    };
  } catch {
    return null;
  }
}
