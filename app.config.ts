import { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? "Svitly",
  slug: config.slug ?? "svitly",
  extra: {
    ...config.extra,
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
  },
  plugins: [
    ...(config.plugins || []),
    "expo-image",
    "expo-status-bar",
    "expo-asset"
  ],
});