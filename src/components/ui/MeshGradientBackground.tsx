import React, { useEffect } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

export type MeshVariant =
  | "mesh-full"
  | "mesh-dark"
  | "fall-morph"
  | "breathe-core";

interface Props {
  variant?: MeshVariant;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedStop = Animated.createAnimatedComponent(Stop);

export function MeshGradientBackground({ variant = "mesh-dark" }: Props) {
  const { width, height } = useWindowDimensions();

  // 🌀 Загальні анімаційні фази (0 .. 1)
  const animPhase1 = useSharedValue(0);
  const animPhase2 = useSharedValue(0);
  const colorMorph = useSharedValue(0);

  useEffect(() => {
    // Дрейф вузлів по синусоїді
    animPhase1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 8000, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );

    animPhase2.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );

    // Зміна кольорів по колу палітри
    colorMorph.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 10000, easing: Easing.linear }),
        withTiming(0, { duration: 10000, easing: Easing.linear }),
      ),
      -1,
      true,
    );
  }, []);

  // --- Варіант 1: Повний меш (mesh-full) ---
  const node1Props = useAnimatedProps(() => ({
    cx: width * (0.2 + animPhase1.value * 0.25),
    cy: height * (0.15 + animPhase2.value * 0.15),
  }));

  const node2Props = useAnimatedProps(() => ({
    cx: width * (0.85 - animPhase2.value * 0.2),
    cy: height * (0.3 - animPhase1.value * 0.18),
  }));

  const node3Props = useAnimatedProps(() => ({
    cx: width * (0.3 + animPhase1.value * 0.15),
    cy: height * (0.85 - animPhase2.value * 0.25),
  }));

  const node4Props = useAnimatedProps(() => ({
    cx: width * (0.75 - animPhase2.value * 0.2),
    cy: height * (0.7 + animPhase1.value * 0.18),
  }));

  // --- Варіант 3: Водоспад-морф (fall-morph) ---
  const sunStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: animPhase1.value * 46 - 20 },
      { translateY: (animPhase2.value - 0.5) * 20 },
      { scale: 0.9 + animPhase2.value * 0.28 },
    ],
    opacity: 0.45 + animPhase2.value * 0.5,
  }));

  // --- Варіант 4: Дихаюче ядро (breathe-core) ---
  const coreNodeProps = useAnimatedProps(() => ({
    cy: height * (0.3 + animPhase1.value * 0.15), // y1: 30% -> 45%
  }));

  const coreColorStopProps = useAnimatedProps(() => {
    const stopColor = interpolateColor(
      colorMorph.value,
      [0, 0.5, 1],
      ["#2DD4BF", "#A3E635", "#2DD4BF"], // Мінт <-> Лайм
    );
    return { stopColor };
  });

  const bottomNodeColorStopProps = useAnimatedProps(() => {
    const stopColor = interpolateColor(
      colorMorph.value,
      [0, 0.5, 1],
      ["#4338CA", "#2DD4BF", "#4338CA"], // Індиго <-> Мінт
    );
    return { stopColor };
  });

  return (
    <View style={styles.container}>
      {/* 1️⃣ Повний меш (4 вузли + базовий градієнт) */}
      {variant === "mesh-full" && (
        <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="bgFull" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#0D9488" />
              <Stop offset="100%" stopColor="#4338CA" />
            </LinearGradient>
            <RadialGradient id="m1" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.85" />
              <Stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="m2" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#4338CA" stopOpacity="0.85" />
              <Stop offset="100%" stopColor="#4338CA" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="m3" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#0D9488" stopOpacity="0.85" />
              <Stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="m4" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#A3E635" stopOpacity="0.75" />
              <Stop offset="100%" stopColor="#A3E635" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#bgFull)" />
          <AnimatedCircle
            animatedProps={node1Props}
            r={width * 0.6}
            fill="url(#m1)"
          />
          <AnimatedCircle
            animatedProps={node2Props}
            r={width * 0.55}
            fill="url(#m2)"
          />
          <AnimatedCircle
            animatedProps={node3Props}
            r={width * 0.65}
            fill="url(#m3)"
          />
          <AnimatedCircle
            animatedProps={node4Props}
            r={width * 0.5}
            fill="url(#m4)"
          />
        </Svg>
      )}

      {/* 2️⃣ Меш на темному (3 вузли + темний нижній фокус) */}
      {variant === "mesh-dark" && (
        <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="bgDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#11302F" />
              <Stop offset="75%" stopColor="#11141F" />
            </LinearGradient>
            <RadialGradient id="md1" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.75" />
              <Stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="md2" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#4338CA" stopOpacity="0.65" />
              <Stop offset="100%" stopColor="#4338CA" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="md3" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#0D9488" stopOpacity="0.7" />
              <Stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#bgDark)" />
          <AnimatedCircle
            animatedProps={node1Props}
            r={width * 0.65}
            fill="url(#md1)"
          />
          <AnimatedCircle
            animatedProps={node2Props}
            r={width * 0.5}
            fill="url(#md2)"
          />
          <AnimatedCircle
            animatedProps={node3Props}
            r={width * 0.6}
            fill="url(#md3)"
          />
        </Svg>
      )}

      {/* 3️⃣ Водоспад-морф (Вертикальний стікаючий градієнт + Сонце) */}
      {variant === "fall-morph" && (
        <View style={StyleSheet.absoluteFill}>
          <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="fallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#2DD4BF" />
                <Stop offset="30%" stopColor="#0D9488" />
                <Stop offset="55%" stopColor="#0D9488" stopOpacity="0.3" />
                <Stop offset="84%" stopColor="#11141F" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#fallGrad)" />
          </Svg>
          {/* Сонце у верхній лівій зоні */}
          <Animated.View style={[styles.fallSun, sunStyle]} />
        </View>
      )}

      {/* 4️⃣ Дихаюче ядро (Ядро за лого + контрольний вузол знизу) */}
      {variant === "breathe-core" && (
        <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="coreBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#11302F" />
              <Stop offset="70%" stopColor="#11141F" />
            </LinearGradient>
            <RadialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
              <AnimatedStop
                offset="0%"
                animatedProps={coreColorStopProps}
                stopOpacity="0.85"
              />
              <Stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="bottomGlow" cx="50%" cy="50%" r="50%">
              <AnimatedStop
                offset="0%"
                animatedProps={bottomNodeColorStopProps}
                stopOpacity="0.75"
              />
              <Stop offset="100%" stopColor="#4338CA" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#coreBg)" />
          {/* Центрове ядро */}
          <AnimatedCircle
            cx={width * 0.5}
            animatedProps={coreNodeProps}
            r={width * 0.55}
            fill="url(#coreGlow)"
          />
          {/* Контр-вузол внизу */}
          <Circle
            cx={width * 0.75}
            cy={height * 0.78}
            r={width * 0.5}
            fill="url(#bottomGlow)"
          />
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#11141F", // Базовий колір з макета
    overflow: "hidden",
  },
  fallSun: {
    position: "absolute",
    width: 280,
    height: 170,
    top: -45,
    left: -65,
    borderRadius: 140,
    backgroundColor: "#A3E635", // Лаймове сонце з макета
    shadowColor: "#A3E635",
    shadowRadius: 50,
    shadowOpacity: 0.8,
  },
});
