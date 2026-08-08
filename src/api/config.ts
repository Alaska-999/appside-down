import Constants from "expo-constants";

const apiUrl =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error(
    "API_BASE_URL is not configured. Set EXPO_PUBLIC_API_URL before starting/building the app.",
  );
}

if (!__DEV__ && apiUrl.startsWith("http://")) {
  throw new Error(
    "API_BASE_URL must use HTTPS in release builds (cleartext HTTP is blocked by iOS ATS / Android).",
  );
}

export const API_BASE_URL = apiUrl;
