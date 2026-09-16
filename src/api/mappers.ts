import { CardOrientation, ThemeMode, UserProfile } from "@/src/types";

type RawAuthUser = {
  id: string;
  username: string;
  email: string;
  createdAt?: string;
};

export function mapAuthUser(rawUser: RawAuthUser): UserProfile {
  return {
    id: rawUser.id,
    username: rawUser.username,
    email: rawUser.email,
    createdAt: rawUser.createdAt || new Date().toISOString(),
    settings: {
      userId: rawUser.id,
      theme: "light" as ThemeMode,
      defaultCardOrientation: "term_first" as CardOrientation,
      isTtsEnabled: false,
      dailyStreakGoal: 10,
    },
    streak: {
      userId: rawUser.id,
      currentStreak: 0,
      lastActiveDate: new Date().toISOString(),
    },
  };
}
