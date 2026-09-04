import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

export function ProgressUnderline({
  progress,
  dim = false,
}: {
  progress: number;
  dim?: boolean;
}) {
  const clamped = Math.min(Math.max(progress, 0), 1);

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 2,
        backgroundColor: "rgba(220,255,245,0.07)",
      }}
    >
      {dim ? (
        <View
          style={{
            width: `${clamped * 100}%`,
            height: 2,
            backgroundColor: "rgba(220,255,245,0.22)",
          }}
        />
      ) : (
        <View
          style={{
            width: `${clamped * 100}%`,
            height: 2,
            shadowColor: "rgba(94,234,212,1)",
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 3.5,
            shadowOpacity: 0.6,
          }}
        >
          <LinearGradient
            colors={["#2DD4BF", "#A3E635"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
      )}
    </View>
  );
}
