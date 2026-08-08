import { ExpoConfig } from "expo/config";
import appJson from "./app.json";

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

const baseConfig = appJson.expo as unknown as ExpoConfig;

const config: ExpoConfig = {
  ...baseConfig,
  extra: {
    ...baseConfig.extra,
    apiUrl,
  },
};

export default config;
