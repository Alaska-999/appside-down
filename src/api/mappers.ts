import { UserProfile } from "@/src/types";

type RawAuthUser = {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
  createdAt?: string;
};

export function mapAuthUser(rawUser: RawAuthUser): UserProfile {
  return {
    id: rawUser.id,
    username: rawUser.username,
    email: rawUser.email,
    avatarUrl: rawUser.avatarUrl ?? null,
    createdAt: rawUser.createdAt || new Date().toISOString(),
  };
}
