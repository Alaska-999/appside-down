import { API_BASE_URL } from "@/src/api/config";
import { ScreenHeaderFlashcards } from "@/src/components/common/ScreenHeaderFlashcards";
import { FlashcardLg } from "@/src/components/flashcards/Flashcard-lg";
import { FlashcardsComplete } from "@/src/components/flashcards/FlashcardsComplete";
import { FlashcardsSettingsSheet } from "@/src/components/flashcards/FlashcardsSettingsSheet";
import { StatusPill } from "@/src/components/flashcards/StatusPill";
import { IconButton } from "@/src/components/ui/IconButton";
import { ScreenAtmosphere } from "@/src/components/ui/ScreenAtmosphere";
import { SyncingPill } from "@/src/components/ui/SyncingPill";
import { useGameStore } from "@/src/store/useGameStore";
import { useStudyQueueStore } from "@/src/store/useStudyQueueStore";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { hapticComplete, hapticSwipe } from "@/src/utils/haptics";
import { soundComplete } from "@/src/utils/sounds";
import { ArrowLeft, ArrowRight, RotateCcw, Settings2 } from "@tamagui/lucide-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PortalProvider, XStack, YStack } from "tamagui";

const SWIPE_HINT_FADE_AFTER = 3;
const SWIPE_HINT_FADE_DURATION = 400;

const MOCKUP_SCALE = 390 / 235;

export default function FlashcardsGame() {
  const activeCards = useGameStore((state) => state.activeCards);
  const currentIndex = useGameStore((state) => state.currentIndex);
  const knownPiles = useGameStore((state) => state.knownPiles);
  const stillLearningPiles = useGameStore((state) => state.stillLearningPiles);
  const settings = useGameStore((state) => state.settings);
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);

  const swipeRight = useGameStore((state) => state.swipeRight);
  const swipeLeft = useGameStore((state) => state.swipeLeft);
  const revertSwipe = useGameStore((state) => state.revertSwipe);
  const restart = useGameStore((state) => state.restart);
  const toggleStar = useGameStore((state) => state.toggleStar);
  const addEvent = useStudyQueueStore((state) => state.addEvent);
  const flush = useStudyQueueStore((state) => state.flush);
  const flushing = useStudyQueueStore((state) => state.flushing);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [revertCount, setRevertCount] = useState(0);
  const [lastSwipeDirection, setLastSwipeDirection] = useState<
    "left" | "right"
  >("right");

  const swipeHintOpacity = useSharedValue(0.6);
  const swipeCountRef = useRef(0);

  const registerSwipeForHintFade = useCallback(() => {
    swipeCountRef.current += 1;
    if (swipeCountRef.current === SWIPE_HINT_FADE_AFTER) {
      swipeHintOpacity.value = withTiming(0, {
        duration: SWIPE_HINT_FADE_DURATION,
      });
    }
  }, [swipeHintOpacity]);

  const swipeHintAnimatedStyle = useAnimatedStyle(() => ({
    opacity: swipeHintOpacity.value,
  }));

  const handleSwipeRight = useCallback(() => {
    setLastSwipeDirection("right");
    hapticSwipe();
    registerSwipeForHintFade();
    const card = activeCards[currentIndex];
    if (card) {
      addEvent({
        flashcardId: card.id,
        moduleId: card.moduleId,
        status: "KNOWN",
        answeredAt: new Date().toISOString(),
      });
    }
    swipeRight();
  }, [swipeRight, activeCards, currentIndex, addEvent, registerSwipeForHintFade]);

  const handleSwipeLeft = useCallback(() => {
    setLastSwipeDirection("left");
    hapticSwipe();
    registerSwipeForHintFade();
    const card = activeCards[currentIndex];
    if (card) {
      addEvent({
        flashcardId: card.id,
        moduleId: card.moduleId,
        status: "STILL_LEARNING",
        answeredAt: new Date().toISOString(),
      });
    }
    swipeLeft();
  }, [swipeLeft, activeCards, currentIndex, addEvent, registerSwipeForHintFade]);

  const handleRevert = useCallback(() => {
    if (currentIndex <= 0) return;

    revertSwipe();
    setRevertCount((c) => c + 1);
  }, [currentIndex, revertSwipe]);

  const handleToggleStar = useCallback(async () => {
    const card = activeCards[currentIndex];
    if (!card) return;
    const newValue = !card.isStarred;
    toggleStar(card.id);
    try {
      const res = await protectedFetch(
        `${API_BASE_URL}/flashcards/${card.id}`,
        { method: "PATCH", body: JSON.stringify({ isStarred: newValue }) },
      );
      if (!res.ok) throw new Error(`Error: ${res.status}`);
    } catch (err) {
      console.error("[FlashcardsGame] star error:", err);
      toggleStar(card.id);
    }
  }, [activeCards, currentIndex, toggleStar]);

  const isComplete = currentIndex >= activeCards.length;

  useEffect(() => {
    if (isComplete && activeCards.length > 0) {
      hapticComplete();
      soundComplete();
      flush();
    }
  }, [isComplete, activeCards.length, flush]);

  useEffect(() => {
    const timer = setInterval(() => flush(), 10000);
    return () => clearInterval(timer);
  }, [flush]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "background") flush();
    });
    return () => subscription.remove();
  }, [flush]);

  return (
    <PortalProvider>
      <YStack f={1} bg="$background">
        <ScreenAtmosphere dim />
        <ScreenHeaderFlashcards
          rightAction={
            <IconButton
              icon={<Settings2 size="$1.5" color="$color" />}
              variant="liquidGlass"
              onPress={() => {
                setSettingsSheetOpen(true);
              }}
            />
          }
          total={activeCards.length.toString()}
          progress={currentIndex.toString()}
          onClose={
            isComplete
              ? () => {
                  restart(true);
                  router.back();
                }
              : undefined
          }
        />

        <FlashcardsSettingsSheet
          open={settingsSheetOpen}
          onOpenChange={setSettingsSheetOpen}
        />

        {flushing && !isComplete && (
          <SyncingPill pos="absolute" top={insets.top + 84} right={19} zIndex={10} />
        )}

        {isComplete ? (
          <FlashcardsComplete
            total={activeCards.length}
            known={knownPiles.length}
            stillLearning={stillLearningPiles.length}
          />
        ) : (
          <YStack f={1} mt={12 * MOCKUP_SCALE} overflow="hidden">
            <LinearGradient
              colors={["rgba(248,113,113,0.4)", "rgba(248,113,113,0)"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              pointerEvents="none"
              style={{
                position: "absolute",
                top: "22%",
                bottom: "24%",
                left: -13 * MOCKUP_SCALE,
                width: 50 * MOCKUP_SCALE,
                zIndex: 2,
              }}
            />
            <LinearGradient
              colors={["rgba(163,230,53,0.45)", "rgba(163,230,53,0)"]}
              start={{ x: 1, y: 0.5 }}
              end={{ x: 0, y: 0.5 }}
              pointerEvents="none"
              style={{
                position: "absolute",
                top: "22%",
                bottom: "24%",
                right: -13 * MOCKUP_SCALE,
                width: 50 * MOCKUP_SCALE,
                zIndex: 2,
              }}
            />

            {settings.sortByPiles && (
              <XStack justifyContent="space-between" px="$5" mt="$3" zIndex={3}>
                <StatusPill
                  tone="learning"
                  count={stillLearningPiles.length}
                  label="learning"
                />
                <StatusPill
                  tone="known"
                  count={knownPiles.length}
                  label="known"
                />
              </XStack>
            )}

            <YStack f={1} pos="relative">
              <FlashcardLg
                card={activeCards[currentIndex]}
                revertDirection={lastSwipeDirection}
                showDefinitionFirst={
                  settings.cardOrientation === "definition_first"
                }
                onStar={handleToggleStar}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                revertKey={revertCount}
              />

              <Animated.View
                pointerEvents="none"
                style={[
                  {
                    position: "absolute",
                    left: 34 * MOCKUP_SCALE,
                    bottom: 34 * MOCKUP_SCALE,
                    zIndex: 4,
                  },
                  swipeHintAnimatedStyle,
                ]}
              >
                <ArrowLeft size={16 * MOCKUP_SCALE} color="#FCA5A5" />
              </Animated.View>
              <Animated.View
                pointerEvents="none"
                style={[
                  {
                    position: "absolute",
                    right: 34 * MOCKUP_SCALE,
                    bottom: 34 * MOCKUP_SCALE,
                    zIndex: 4,
                  },
                  swipeHintAnimatedStyle,
                ]}
              >
                <ArrowRight size={16 * MOCKUP_SCALE} color="#A3E635" />
              </Animated.View>
            </YStack>

            <YStack alignItems="center" mb="$5" gap={8 * MOCKUP_SCALE} zIndex={3}>
              <IconButton
                icon={<RotateCcw size="$1.5" color="$colorSecondary" />}
                variant="glass"
                size={40 * MOCKUP_SCALE}
                disabled={currentIndex === 0}
                opacity={currentIndex === 0 ? 0.3 : 1}
                onPress={handleRevert}
              />
            </YStack>
          </YStack>
        )}
      </YStack>
    </PortalProvider>
  );
}
