import { UserAvatar } from "@/src/components/common/UserAvatar";
import { CardRow } from "@/src/components/flashcards/CardRow";
import { CardsHeader } from "@/src/components/flashcards/CardsHeader";
import { ModuleDeck } from "@/src/components/flashcards/ModuleDeck";
import { ModuleSkeleton } from "@/src/components/flashcards/ModuleSkeleton";
import { BackgroundMesh } from "@/src/components/ui/background/ScreenBackground";
import { StatusBarScrim } from "@/src/components/ui/background/StatusBarScrim";
import { AppButton } from "@/src/components/ui/controls/Button";
import { IconButton } from "@/src/components/ui/controls/IconButton";
import { StarGlyph } from "@/src/components/ui/controls/StarGlyph";
import { Toggle } from "@/src/components/ui/controls/Toggle";
import { ModeTile, ModeTileState } from "@/src/components/ui/display/ModeTile";
import { StatTile } from "@/src/components/ui/display/StatTile";
import { NextActionRow } from "@/src/components/ui/feedback/NextActionRow";
import { ProgressSplitBar } from "@/src/components/ui/feedback/ProgressSplitBar";
import { StateCard } from "@/src/components/ui/feedback/StateCard";
import { AppToast } from "@/src/components/ui/feedback/Toast";
import { ConfirmMenuSheet } from "@/src/components/ui/overlays/ConfirmMenuSheet";
import {
  AppSheet,
  SheetRow,
  SheetRows,
} from "@/src/components/ui/overlays/Sheet";
import {
  ICON_DANGER,
  ICON_MINT_TINT_DARK,
  ICON_MUTED,
  ICON_ON_GLASS,
} from "@/src/constants/iconColors";
import {
  SURFACE_MINT_GLASS_BG,
  SURFACE_MINT_GLASS_BORDER,
} from "@/src/constants/surfaceAlpha";
import { useModule } from "@/src/hooks/useModule";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useGameStore } from "@/src/store/useGameStore";
import { useMatchStore } from "@/src/store/useMatchStore";
import { cardSideText } from "@/src/utils/cardText";
import { eligibleCards, MATCH_MIN_CARDS } from "@/src/utils/match";
import { pluralize } from "@/src/utils/plural";
import { normalizeProgress } from "@/src/utils/progress";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  AlertTriangle,
  ArrowDownUp,
  BookmarkCheck,
  BookmarkPlus,
  Captions,
  ChevronLeft,
  Clock,
  Columns2,
  FileText,
  Globe,
  GraduationCap,
  Lock,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Sparkles,
} from "lucide-react-native";
import { ComponentType, useCallback, useMemo, useState } from "react";
import { FlatList, InteractionManager } from "react-native";
import { Text, XStack, YStack } from "tamagui";

type SortOrder = "original" | "alphabetical";

const SORT_OPTIONS: {
  key: SortOrder;
  label: string;
  icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
}[] = [
  { key: "original", label: "Original order", icon: Clock },
  { key: "alphabetical", label: "A–Z", icon: ArrowDownUp },
];

const MODE_TILES = [
  {
    key: "flashcards",
    label: "Flashcards",
    hint: "Flip and recall",
    icon: Captions,
  },
  {
    key: "test",
    label: "Test",
    hint: "Quiz yourself",
    icon: FileText,
  },
  {
    key: "match",
    label: "Match",
    hint: "Pair up",
    icon: Columns2,
  },
  {
    key: "learn",
    label: "Learn",
    hint: "Spaced repetition",
    icon: GraduationCap,
  },
];

const MATCH_TOO_FEW_HINT = `Add ${MATCH_MIN_CARDS}+ cards to play`;

function CardSeparator() {
  return <YStack h={9} />;
}

export default function ModuleScreen() {
  const screen = useScreenInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    moduleData,
    flashcards,
    loading,
    error,
    notFound,
    toast,
    setToast,
    saving,
    loadedRef,
    fetchData,
    toggleCardStar,
    toggleFavorite,
    togglePublic,
    saveToLibrary,
    resetProgress,
    resetting,
    deleteModule,
  } = useModule(id);
  const [sortOrder, setSortOrder] = useState<SortOrder>("original");
  const [starredOnly, setStarredOnly] = useState(false);
  const [fullListHeight, setFullListHeight] = useState(0);
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [menuSheetOpen, setMenuSheetOpen] = useState(false);
  const [resetSheetOpen, setResetSheetOpen] = useState(false);

  const initGame = useGameStore((state) => state.initGame);
  const initMatch = useMatchStore((state) => state.initMatch);

  const user = useAuthStore((state) => state.user);
  const isOwner = moduleData?.user?.id === user?.id;
  const authorName =
    moduleData?.author?.username ?? moduleData?.authorUsername ?? undefined;
  const isDeletedAuthor = !moduleData?.author && !!moduleData?.authorUsername;

  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() =>
        fetchData(loadedRef.current),
      );
      return () => task.cancel();
    }, [id, fetchData, loadedRef]),
  );

  const progress = useMemo(
    () => normalizeProgress(moduleData?.progress, flashcards),
    [moduleData?.progress, flashcards],
  );

  const statTiles = useMemo(
    () =>
      [
        { key: "mastered", value: progress.mastered, label: "Mastered" },
        { key: "learning", value: progress.learning, label: "Learning" },
        { key: "new", value: progress.new, label: "New" },
      ] as const,
    [progress],
  );

  const hasStats = statTiles.some((tile) => tile.value > 0);

  const starredCount = flashcards.filter((c) => c.isStarred).length;

  const visibleCards = useMemo(() => {
    const base = starredOnly
      ? flashcards.filter((c) => c.isStarred)
      : flashcards;
    if (sortOrder === "alphabetical") {
      return [...base].sort((a, b) => a.term.localeCompare(b.term));
    }
    return base;
  }, [flashcards, sortOrder, starredOnly]);

  const cardsReady =
    !!moduleData && !loading && !notFound && flashcards.length > 0;
  const listData = cardsReady ? visibleCards : [];
  const showStarredEmpty = cardsReady && starredOnly;

  const matchLive = useMemo(
    () => eligibleCards(flashcards).length >= MATCH_MIN_CARDS,
    [flashcards],
  );

  const deckCards = useMemo(
    () =>
      flashcards.map((c) => ({
        id: c.id,
        term: cardSideText(c.term),
        definition: cardSideText(c.definition),
      })),
    [flashcards],
  );

  const openEditSheet = () => {
    setMenuSheetOpen(false);
    router.push({ pathname: "/module/[id]/cards", params: { id } });
  };

  const openResetProgress = () => {
    setMenuSheetOpen(false);
    setResetSheetOpen(true);
  };

  const handleResetProgress = async () => {
    const ok = await resetProgress();
    if (ok) setResetSheetOpen(false);
  };

  const openEditModule = () => {
    setMenuSheetOpen(false);
    router.push({ pathname: "/module/[id]/edit", params: { id } });
  };

  const closeMenu = (open: boolean) => {
    setMenuSheetOpen(open);
  };

  const handleDeleteModule = async () => {
    const ok = await deleteModule();
    if (ok) {
      setMenuSheetOpen(false);
      router.back();
    }
  };

  const startFlashcards = () => {
    if (!moduleData || !flashcards.length) return;
    const game = useGameStore.getState();
    const isStale =
      game.currentModule?.id !== moduleData.id ||
      game.currentModule?.updatedAt !== moduleData.updatedAt;
    const isFinished =
      game.activeCards.length === 0 ||
      game.currentIndex >= game.activeCards.length;
    if (isStale || isFinished) initGame(moduleData, flashcards);
    router.push({ pathname: "/module/[id]/flashcards", params: { id } });
  };

  const startMatch = () => {
    if (!moduleData || !matchLive) return;
    initMatch(moduleData, flashcards);
    router.push({ pathname: "/module/[id]/match", params: { id } });
  };

  const nextAction = progress.nextAction;
  const canStudy = deckCards.length > 0;
  const nextActionPress =
    canStudy && (!nextAction || nextAction.mode === "FLASHCARDS")
      ? startFlashcards
      : undefined;

  const modeTileProps = (
    tile: (typeof MODE_TILES)[number],
  ): { state: ModeTileState; hint: string; onPress?: () => void } => {
    if (tile.key === "flashcards") {
      const live = deckCards.length > 0;
      return {
        state: live ? "live" : "locked",
        hint: tile.hint,
        onPress: live ? startFlashcards : undefined,
      };
    }
    if (tile.key === "match") {
      if (matchLive) {
        return { state: "live", hint: tile.hint, onPress: startMatch };
      }
      return { state: "locked", hint: MATCH_TOO_FEW_HINT };
    }
    return { state: "soon", hint: tile.hint };
  };

  return (
    <YStack f={1} bg="$background">
      {/* <BackgroundMesh preset="tealBeam" /> */}
      {/* <BackgroundMesh preset="crossBeams" /> */}

      <BackgroundMesh preset="crossBeamsTeal" />
      <FlatList
        data={listData}
        keyExtractor={(card) => card.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: screen.bottom,
          minHeight: starredOnly ? fullListHeight : undefined,
        }}
        onContentSizeChange={(_, height) => {
          if (!starredOnly) setFullListHeight(height);
        }}
        ItemSeparatorComponent={CardSeparator}
        renderItem={({ item }) => (
          <YStack px="$screenX">
            <CardRow
              term={cardSideText(item.term)}
              definition={cardSideText(item.definition)}
              starred={item.isStarred}
              onToggleStar={isOwner ? () => toggleCardStar(item) : undefined}
            />
          </YStack>
        )}
        ListEmptyComponent={
          showStarredEmpty ? (
            <YStack px="$screenX" ai="center" gap={8} pt={28}>
              <Text
                fontSize={15}
                fontWeight="600"
                color="$color"
                textAlign="center"
              >
                No starred cards yet
              </Text>
              <Text fontSize={12.5} color="$textMuted" textAlign="center">
                Star a card and it will show up here
              </Text>
            </YStack>
          ) : null
        }
        ListHeaderComponent={
          <YStack>
            <XStack
              px="$screenX"
              pt={screen.top}
              jc="space-between"
              ai="center"
            >
              <IconButton
                variant="liquidGlass"
                icon={
                  <ChevronLeft
                    size={22}
                    color={ICON_ON_GLASS}
                    strokeWidth={1.9}
                  />
                }
                onPress={() => router.back()}
                accessibilityLabel="Back"
              />
              {moduleData && isOwner && (
                <XStack gap={9}>
                  <IconButton
                    variant="liquidGlass"
                    icon={
                      <StarGlyph
                        mode="toggle"
                        size="lg"
                        active={moduleData.isFavorite}
                        onGlass
                      />
                    }
                    onPress={toggleFavorite}
                    accessibilityLabel={
                      moduleData.isFavorite ? "Remove favorite" : "Add favorite"
                    }
                  />
                  <IconButton
                    variant="liquidGlass"
                    icon={
                      <MoreHorizontal
                        size={22}
                        color={ICON_ON_GLASS}
                        strokeWidth={1.9}
                      />
                    }
                    onPress={() => setMenuSheetOpen(true)}
                    accessibilityLabel="Module menu"
                  />
                </XStack>
              )}
            </XStack>

            {loading && (
              <YStack pt={22}>
                <ModuleSkeleton />
              </YStack>
            )}

            {notFound && !loading && (
              <YStack px="$screenX" pt={22}>
                <StateCard
                  tone="empty"
                  icon={Sparkles}
                  title="Module not found"
                  subtitle="It may have been removed or made private."
                  buttonLabel="Try again"
                  onButtonPress={() => fetchData()}
                />
              </YStack>
            )}

            {error && !loading && !notFound && (
              <YStack px="$screenX" pt={22}>
                <StateCard
                  tone="error"
                  icon={AlertTriangle}
                  title="Couldn't load module"
                  subtitle="Looks like a connection hiccup. Your data is safe — try again."
                  buttonLabel="Try again"
                  onButtonPress={() => fetchData()}
                />
              </YStack>
            )}

            {moduleData && !loading && !notFound && (
              <>
                {deckCards.length > 0 && <ModuleDeck cards={deckCards} />}

                <YStack px="$screenX" pt={26}>
                  <Text
                    fontSize={27}
                    fontWeight="800"
                    letterSpacing={-0.54}
                    lineHeight={31}
                    color="$color"
                  >
                    {moduleData.name}
                  </Text>

                  {!!moduleData.description && (
                    <Text
                      fontSize={13.5}
                      lineHeight={20}
                      color="$textMuted"
                      mt={7}
                    >
                      {moduleData.description}
                    </Text>
                  )}

                  <XStack ai="center" gap={9} mt={13}>
                    <UserAvatar
                      avatarUrl={moduleData.author?.avatarUrl}
                      username={authorName}
                      size={26}
                    />
                    <Text fontSize={12.5} fontWeight="700" color="$color">
                      @{authorName ?? "unknown"}
                    </Text>
                    {isDeletedAuthor && (
                      <Text fontSize={12.5} color="$textMuted">
                        (deleted)
                      </Text>
                    )}
                    <YStack w={3} h={3} br={2} bg="$mutedDim" />
                    <Text fontSize={12.5} color="$textMuted">
                      {pluralize(moduleData.itemsCount, "card")}
                    </Text>
                    {moduleData.isPublic && (
                      <XStack
                        ml="auto"
                        px={10}
                        py={4}
                        br={999}
                        bg={SURFACE_MINT_GLASS_BG}
                        borderWidth={1}
                        borderColor={SURFACE_MINT_GLASS_BORDER}
                      >
                        <Text
                          fontSize={10.5}
                          fontWeight="600"
                          color="$mintLight"
                        >
                          Public
                        </Text>
                      </XStack>
                    )}
                  </XStack>

                  <YStack mt={22} gap={12}>
                    <ProgressSplitBar
                      mastered={progress.mastered}
                      learning={progress.learning}
                      total={progress.total}
                    />
                    <NextActionRow
                      action={progress.nextAction}
                      mastered={progress.mastered}
                      total={progress.total}
                      onPress={nextActionPress}
                    />
                    {hasStats && (
                      <XStack gap={9}>
                        {statTiles.map((tile) =>
                          tile.value > 0 ? (
                            <StatTile
                              key={tile.key}
                              tone={tile.key}
                              value={tile.value}
                              label={tile.label}
                            />
                          ) : (
                            <YStack key={tile.key} />
                          ),
                        )}
                      </XStack>
                    )}
                  </YStack>

                  <YStack mt={22} gap={10}>
                    <XStack gap={10}>
                      {MODE_TILES.slice(0, 2).map((tile) => (
                        <ModeTile
                          key={tile.key}
                          icon={tile.icon}
                          label={tile.label}
                          {...modeTileProps(tile)}
                        />
                      ))}
                    </XStack>
                    <XStack gap={10}>
                      {MODE_TILES.slice(2).map((tile) => (
                        <ModeTile
                          key={tile.key}
                          icon={tile.icon}
                          label={tile.label}
                          {...modeTileProps(tile)}
                        />
                      ))}
                    </XStack>
                    <XStack
                      ai="center"
                      gap={10}
                      px={16}
                      py={13}
                      br={18}
                      bg="$glassBgSubtle"
                      borderWidth={1}
                      borderStyle="dashed"
                      borderColor="$borderColor"
                    >
                      <Lock size={16} color={ICON_MUTED} strokeWidth={1.8} />
                      <Text fontSize={12.5} color="$textMuted">
                        <Text
                          fontSize={12.5}
                          fontWeight="600"
                          color="$mutedLight"
                        >
                          {"Test, Learn"}
                        </Text>{" "}
                        — coming soon
                      </Text>
                    </XStack>
                  </YStack>

                  {!isOwner && (
                    <YStack mt={22}>
                      {moduleData.savedCopyId ? (
                        <AppButton
                          variant="secondary"
                          size="lg"
                          icon={
                            <BookmarkCheck
                              size={18}
                              color={ICON_ON_GLASS}
                              strokeWidth={1.9}
                            />
                          }
                          onPress={() =>
                            router.push({
                              pathname: "/module/[id]",
                              params: { id: moduleData.savedCopyId as string },
                            })
                          }
                        >
                          In your library · open
                        </AppButton>
                      ) : (
                        <AppButton
                          variant="primary"
                          size="lg"
                          icon={
                            <BookmarkPlus
                              size={18}
                              color={ICON_MINT_TINT_DARK}
                            />
                          }
                          loading={saving}
                          onPress={saveToLibrary}
                        >
                          Save to library
                        </AppButton>
                      )}
                    </YStack>
                  )}

                  <YStack mt={26}>
                    {flashcards.length === 0 ? (
                      <StateCard
                        tone="empty"
                        icon={Sparkles}
                        title="No cards yet"
                        subtitle="This module doesn't have any flashcards yet"
                        buttonLabel={isOwner ? "Add cards" : undefined}
                        onButtonPress={isOwner ? openEditSheet : undefined}
                      />
                    ) : (
                      <CardsHeader
                        count={flashcards.length}
                        starredCount={starredCount}
                        starredOnly={starredOnly}
                        onToggleStarred={() => setStarredOnly((v) => !v)}
                        onSort={() => setSortSheetOpen(true)}
                      />
                    )}
                  </YStack>
                </YStack>
              </>
            )}
          </YStack>
        }
      />

      <StatusBarScrim />

      <ConfirmMenuSheet
        open={menuSheetOpen}
        onOpenChange={closeMenu}
        menuTitle={moduleData?.name ?? "Module"}
        deleteLabel="Delete module"
        confirmTitle="Delete this module?"
        confirmSubtitle={`${flashcards.length} cards will be deleted too.\nThis can't be undone.`}
        onConfirmDelete={handleDeleteModule}
      >
        <SheetRow icon={Pencil} label="Edit module" onPress={openEditModule} />
        <SheetRow
          icon={Captions}
          label="Edit cards"
          hint={String(flashcards.length)}
          onPress={openEditSheet}
        />
        <SheetRow
          icon={RotateCcw}
          label="Reset progress"
          onPress={openResetProgress}
        />
        <SheetRow
          icon={Globe}
          label="Public"
          right={
            <Toggle
              size="md"
              value={moduleData?.isPublic ?? false}
              onToggle={togglePublic}
            />
          }
          onPress={togglePublic}
        />
      </ConfirmMenuSheet>

      <AppSheet
        open={resetSheetOpen}
        onOpenChange={setResetSheetOpen}
        title="Reset progress?"
        subtitle={
          "All cards in this module go back to new.\nThe cards themselves stay."
        }
      >
        <YStack gap={10}>
          <AppButton
            variant="danger"
            icon={<RotateCcw size={19} color={ICON_DANGER} strokeWidth={1.9} />}
            loading={resetting}
            onPress={handleResetProgress}
          >
            Reset progress
          </AppButton>
          <AppButton
            variant="secondary"
            onPress={() => setResetSheetOpen(false)}
          >
            Cancel
          </AppButton>
        </YStack>
      </AppSheet>

      <AppToast
        open={!!toast}
        message={toast ?? ""}
        onDismiss={() => setToast(null)}
      />

      <AppSheet
        open={sortSheetOpen}
        onOpenChange={setSortSheetOpen}
        title="Sort by"
      >
        <SheetRows>
          {SORT_OPTIONS.map((option) => (
            <SheetRow
              key={option.key}
              icon={option.icon}
              label={option.label}
              selected={sortOrder === option.key}
              onPress={() => {
                setSortOrder(option.key);
                setSortSheetOpen(false);
              }}
            />
          ))}
        </SheetRows>
      </AppSheet>
    </YStack>
  );
}
