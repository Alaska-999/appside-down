import { AppButton } from "@/src/components/ui/Button";
import { AppCard } from "@/src/components/ui/Card";
import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { AppFab, IconButton } from "@/src/components/ui/IconButton";
import { Skeleton } from "@/src/components/ui/Skeleton";
import {
  BackgroundMesh,
  BackgroundPreset,
  BgDebugMode,
} from "@/src/components/ui/ScreenBackground";
import { FormInput } from "@/src/components/common/FormInput";
import { SegmentedControl } from "@/src/components/common/SegmentedControl";
import { Toggle } from "@/src/components/common/Toggle";
import { Checkbox, OptionRow, Radio } from "@/src/components/ui/Checkbox";
import { FilterChip } from "@/src/components/ui/FilterChip";
import { AnimatedNumber } from "@/src/components/ui/AnimatedNumber";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import { ProgressRing } from "@/src/components/ui/ProgressRing";
import { ProgressUnderline } from "@/src/components/ui/ProgressUnderline";
import { CodeInput } from "@/src/components/ui/CodeInput";
import { SearchField } from "@/src/components/ui/SearchField";
import { SelectField } from "@/src/components/ui/SelectField";
import { AppSheet, SheetCrossfade, SheetRow, SheetRows } from "@/src/components/ui/Sheet";
import { StateCard } from "@/src/components/ui/StateCard";
import { AppToast } from "@/src/components/ui/Toast";
import { TYPE } from "@/src/constants/type";
import { useDelayedLoading } from "@/src/hooks/useDelayedLoading";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Image, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  AlertTriangle,
  ArrowRight,
  FileText,
  FileX,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  Trash2,
  WifiOff,
  X,
} from "lucide-react-native";
import { ScrollView, Text, XStack, YStack } from "tamagui";

const BG_PRESETS: { preset: BackgroundPreset; debug?: BgDebugMode }[] = [
  { preset: "home" },
  { preset: "module" },
  { preset: "form" },
  { preset: "folder" },
  { preset: "flash" },
  { preset: "auth" },
  { preset: "finish" },
];

function ControlsDemo() {
  const [tg1, setTg1] = useState(true);
  const [tg2, setTg2] = useState(false);
  const [cb, setCb] = useState(true);
  const [radio, setRadio] = useState(0);
  const [seg, setSeg] = useState(0);
  const [chipOn, setChipOn] = useState(true);

  return (
    <>
      <YStack gap={10}>
        <Label>Toggle lg 52 · md 46 · sm 40 · disabled</Label>
        <XStack gap={20} ai="center">
          <Toggle value={tg1} onToggle={() => setTg1(!tg1)} />
          <Toggle value={tg2} onToggle={() => setTg2(!tg2)} size="md" />
          <Toggle value={tg2} onToggle={() => setTg2(!tg2)} size="sm" />
          <Toggle value onToggle={() => {}} disabled />
        </XStack>
      </YStack>

      <YStack gap={4}>
        <Label>Checkbox · Radio · lg 30 / md 26 / sm 22</Label>
        <XStack gap={16} ai="center" py={4}>
          <Checkbox checked size="lg" onToggle={() => {}} />
          <Checkbox checked size="md" onToggle={() => {}} />
          <Checkbox checked size="sm" onToggle={() => {}} />
          <Radio selected size="lg" onSelect={() => {}} />
          <Radio selected size="md" onSelect={() => {}} />
          <Radio selected size="sm" onSelect={() => {}} />
        </XStack>
        <OptionRow
          control={<Checkbox checked={cb} onToggle={() => setCb(!cb)} />}
          label="Shuffle cards"
          onPress={() => setCb(!cb)}
        />
        <OptionRow
          control={<Radio selected={radio === 0} onSelect={() => setRadio(0)} />}
          label="Term first"
          onPress={() => setRadio(0)}
        />
        <OptionRow
          control={<Radio selected={radio === 1} onSelect={() => setRadio(1)} />}
          label="Definition first"
          onPress={() => setRadio(1)}
        />
      </YStack>

      <YStack gap={10}>
        <Label>Segmented · градієнтна таблетка + скрим</Label>
        <SegmentedControl
          options={["Folders", "Modules", "All"]}
          selected={seg}
          onChange={setSeg}
        />
      </YStack>

      <YStack gap={10}>
        <Label>Chips h36 · default / on / solid</Label>
        <XStack gap={8} flexWrap="wrap">
          <FilterChip label="Biology" onPress={() => {}} />
          <FilterChip
            label="Starred"
            variant={chipOn ? "on" : "default"}
            onPress={() => setChipOn(!chipOn)}
          />
          <FilterChip label="All" variant="solid" onPress={() => {}} />
        </XStack>
      </YStack>
    </>
  );
}

function FieldsDemo() {
  const { control, setError } = useForm({
    defaultValues: { name: "", bio: "", email: "broken@", code: "", off: "off" },
  });
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    setError("email", { message: "Enter a valid email" });
  }, [setError]);

  return (
    <>
      <YStack gap={10}>
        <Label>Поля · well 52 · фокус/помилка</Label>
        <FormInput control={control} name="name" placeholder="Module name" />
        <FormInput control={control} name="email" placeholder="Email" />
        <FormInput control={control} name="off" disabled />
        <FormInput
          control={control}
          name="bio"
          placeholder="Description"
          multiline
          maxLength={200}
          showCounter
        />
      </YStack>

      <YStack gap={10}>
        <Label>glass · underline · select · search</Label>
        <FormInput control={control} name="name" variant="glass" placeholder="Glass field" />
        <FormInput control={control} name="name" variant="underline" placeholder="Underline field" />
        <SelectField
          value={folder}
          placeholder="Folder"
          options={[
            { label: "Biology", value: "Biology" },
            { label: "Chemistry", value: "Chemistry" },
            { label: "No folder", value: "" },
          ]}
          onChange={setFolder}
        />
        <SelectField
          multiple
          value={tags}
          placeholder="Tags"
          options={[
            { label: "Exam", value: "exam" },
            { label: "Hard", value: "hard" },
            { label: "Favorite", value: "favorite" },
          ]}
          onChange={setTags}
        />
        <SearchField value={search} onChangeText={setSearch} placeholder="Search modules..." />
      </YStack>

      <YStack gap={10}>
        <Label>CodeInput · 46×56 · курсор блимає</Label>
        <CodeInput control={control} name="code" length={6} />
      </YStack>
    </>
  );
}

function SheetsDemo() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sheetView, setSheetView] = useState<"menu" | "confirm">("menu");
  const [toastOpen, setToastOpen] = useState(false);

  return (
    <>
      <YStack gap={10}>
        <Label>Шит · rows · меню → підтвердження (crossfade 200мс)</Label>
        <AppButton
          variant="secondary"
          onPress={() => {
            setSheetView("menu");
            setMenuOpen(true);
          }}
        >
          Відкрити меню ⋯
        </AppButton>
        <AppButton variant="secondary" onPress={() => setToastOpen(true)}>
          Показати тост
        </AppButton>
        <YStack h={140} br={20} bg="$surfaceCard" ai="center" jc="center" overflow="hidden">
          <Text {...TYPE.meta} color="$colorMuted">
            тост з’явиться тут знизу
          </Text>
          <AppToast
            open={toastOpen}
            message="Session expired"
            description="Log in again to continue"
            onDismiss={() => setToastOpen(false)}
          />
        </YStack>
      </YStack>

      <AppSheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        title={sheetView === "menu" ? "Module" : "Delete module"}
      >
        <SheetCrossfade activeKey={sheetView}>
          {sheetView === "menu" ? (
            <SheetRows>
              <SheetRow icon={Pencil} label="Edit module" onPress={() => {}} />
              <SheetRow icon={FileText} label="Edit cards" hint="200" onPress={() => {}} />
              <SheetRow
                icon={Trash2}
                label="Delete module"
                danger
                onPress={() => setSheetView("confirm")}
              />
            </SheetRows>
          ) : (
            <YStack gap={14}>
              <Text {...TYPE.body} color="$colorMuted">
                This will permanently delete the module and all its cards.
              </Text>
              <AppButton variant="danger" onPress={() => setMenuOpen(false)}>
                Delete module
              </AppButton>
              <AppButton variant="ghost" onPress={() => setSheetView("menu")}>
                Cancel
              </AppButton>
            </YStack>
          )}
        </SheetCrossfade>
      </AppSheet>
    </>
  );
}

function StatesDemo() {
  const [loading, setLoading] = useState(false);
  const showSkeleton = useDelayedLoading(loading, 250);

  return (
    <>
      <YStack gap={10}>
        <Label>Стани · disc 96 liquid + halo</Label>
        <YStack h={340} br={20} bg="$surfaceCard" overflow="hidden">
          <StateCard
            tone="error"
            icon={WifiOff}
            title="No connection"
            subtitle="Check your Wi-Fi or mobile data and try again."
            buttonLabel="Try again"
            buttonIcon={<RotateCcw size={18} color="#0D1117" strokeWidth={2.2} />}
            onButtonPress={() => {}}
          />
        </YStack>
        <YStack h={340} br={20} bg="$surfaceCard" overflow="hidden">
          <StateCard
            tone="warn"
            icon={FileX}
            title="This module is gone"
            subtitle="It was deleted or its owner made it private."
            buttonLabel="Back to library"
            onButtonPress={() => {}}
          />
        </YStack>
        <YStack h={340} br={20} bg="$surfaceCard" overflow="hidden">
          <StateCard
            tone="error"
            icon={AlertTriangle}
            title="Something broke on our side"
            subtitle="Not your fault. Give it a second and try again."
            buttonLabel="Try again"
            buttonIcon={<RotateCcw size={18} color="#0D1117" strokeWidth={2.2} />}
            onButtonPress={() => {}}
          />
        </YStack>
        <YStack h={340} br={20} bg="$surfaceCard" overflow="hidden">
          <StateCard
            tone="empty"
            icon={Search}
            title="Nothing found"
            subtitle={
              <Text fontSize={13.5} color="#7F97A6" textAlign="center" lineHeight={21.6}>
                No modules match <Text color="#DCEBF2" fontWeight="700">“mitochondira”</Text>. Check the
                spelling — or make it yourself.
              </Text>
            }
            buttonLabel="Create a module"
            onButtonPress={() => {}}
          />
        </YStack>
      </YStack>

      <YStack gap={10}>
        <Label>Skeleton states-мода · useDelayedLoading 250мс</Label>
        <AppButton variant="secondary" onPress={() => setLoading((prev) => !prev)}>
          {loading ? "Зупинити завантаження" : "Імітувати завантаження"}
        </AppButton>
        <YStack h={54} br={16} overflow="hidden">
          {showSkeleton ? (
            <Skeleton variant="states" height={54} borderRadius={16} />
          ) : (
            <XStack
              h={54}
              br={16}
              bg="$surfaceCard"
              ai="center"
              px={16}
            >
              <Text {...TYPE.body} color="$colorMuted">
                {loading ? "завантажується (ще менше 250мс, скелетон не показуємо)" : "кеш показано одразу"}
              </Text>
            </XStack>
          )}
        </YStack>
      </YStack>
    </>
  );
}

function Label(props: { children: string }) {
  return (
    <Text {...TYPE.micro} color="$colorMuted" textTransform="uppercase" letterSpacing={1}>
      {props.children}
    </Text>
  );
}

export default function Showcase() {
  const insets = useSafeAreaInsets();
  const [bgIndex, setBgIndex] = useState<number | null>(null);

  if (bgIndex !== null) {
    const entry = BG_PRESETS[bgIndex];
    return (
      <Pressable
        style={{ flex: 1 }}
        onPress={() =>
          setBgIndex(bgIndex + 1 < BG_PRESETS.length ? bgIndex + 1 : null)
        }
      >
        <YStack f={1} bg="$background">
          <BackgroundMesh
            preset={entry.preset}
            animated={entry.preset === "auth" || entry.preset === "flash"}
            debugMode={entry.debug}
          />
          <Text
            {...TYPE.micro}
            color="$colorMuted"
            textTransform="uppercase"
            letterSpacing={1}
            pos="absolute"
            b={insets.bottom + 20}
            als="center"
          >
            {entry.preset}
            {entry.debug ? ` · ${entry.debug}` : ""} · тап далі
          </Text>
        </YStack>
      </Pressable>
    );
  }

  return (
    <YStack f={1} bg="$background">
      <BackgroundMesh preset="home" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 16,
          gap: 22,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text {...TYPE.title} color="$color">
            Showcase
          </Text>
        </Pressable>

        <YStack gap={10}>
          <Label>Фонові меші · тап відкриває на повний екран</Label>
          <Pressable onPress={() => setBgIndex(0)}>
            <YStack h={52} br={16} bg="$surfaceCard" jc="center" ai="center">
              <GradientBorder radius={16} preset="surf" />
              <Text {...TYPE.card} color="$color">
                7 пресетів фону
              </Text>
            </YStack>
          </Pressable>
        </YStack>

        <YStack gap={10}>
          <Label>Картки · glow-тони (лампа зліва-згори)</Label>
          <XStack gap={10}>
            <AppCard f={1} size="lg" variant="glow" tone="mint" gap={6}>
              <Text {...TYPE.card} color="$color">mint</Text>
              <Text {...TYPE.meta} color="rgba(220,255,245,0.64)">Модуль у роботі</Text>
            </AppCard>
            <AppCard f={1} size="lg" variant="glow" tone="teal" gap={6}>
              <Text {...TYPE.card} color="$color">teal</Text>
              <Text {...TYPE.meta} color="rgba(220,255,245,0.64)">Статистика</Text>
            </AppCard>
          </XStack>
          <XStack gap={10}>
            <AppCard f={1} size="lg" variant="glow" tone="lime" gap={6}>
              <Text {...TYPE.card} color="$color">lime</Text>
              <Text {...TYPE.meta} color="rgba(220,255,245,0.64)">Завершено</Text>
            </AppCard>
            <AppCard f={1} size="lg" variant="glow" tone="indigo" gap={6}>
              <Text {...TYPE.card} color="$color">indigo</Text>
              <Text {...TYPE.meta} color="rgba(220,255,245,0.64)">Щойно створено</Text>
            </AppCard>
          </XStack>
        </YStack>

        <YStack gap={10}>
          <Label>glow 0…4</Label>
          <XStack gap={8}>
            {([0, 1, 2, 3, 4] as const).map((g) => (
              <AppCard key={g} f={1} variant="glow" glow={g} px={0} py={14} ai="center">
                <Text {...TYPE.micro} color="$color">{g}</Text>
              </AppCard>
            ))}
          </XStack>
          <Label>vivid 0…4</Label>
          <XStack gap={8}>
            {([0, 1, 2, 3, 4] as const).map((v) => (
              <AppCard key={v} f={1} variant="glow" glow={3} vivid={v} px={0} py={14} ai="center">
                <Text {...TYPE.micro} color="$color">{v}</Text>
              </AppCard>
            ))}
          </XStack>
        </YStack>

        <YStack gap={10}>
          <Label>glass · liquid · accent</Label>
          <XStack gap={10}>
            <AppCard f={1} size="lg" variant="glass" gap={6}>
              <Text {...TYPE.card} color="$color">glass</Text>
            </AppCard>
            <AppCard f={1} size="lg" variant="liquid" gap={6}>
              <Text {...TYPE.card} color="#FFFFFF">liquid</Text>
            </AppCard>
          </XStack>
          <Label>Тест заломлення · скроль фото під склом</Label>
          <YStack h={300} br={23} overflow="hidden" pos="relative">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Image
                source={{ uri: "https://picsum.photos/id/1015/1600/600" }}
                style={{ width: 1200, height: 300 }}
              />
            </ScrollView>
            <YStack
              pos="absolute"
              t={0}
              l={0}
              r={0}
              b={0}
              ai="center"
              jc="center"
              pointerEvents="none"
            >
              <AppCard w={230} size="lg" variant="liquid" ai="center" gap={4}>
                <Text {...TYPE.card} color="#FFFFFF">liquid</Text>
                <Text {...TYPE.meta} color="rgba(255,255,255,0.8)">скроль фото під карткою</Text>
              </AppCard>
            </YStack>
          </YStack>
          <AppCard size="lg" variant="accent" gap={6}>
            <Text {...TYPE.card} color="$nearBlack">accent</Text>
            <Text {...TYPE.meta} color="rgba(13,17,23,0.68)">Градієнтна картка-приманка</Text>
          </AppCard>
        </YStack>

        <YStack gap={10}>
          <Label>neon · well</Label>
          <XStack gap={10}>
            <AppCard f={1} size="lg" variant="neon" gap={6}>
              <Text {...TYPE.card} color="$color">neon</Text>
            </AppCard>
            <AppCard f={1} size="lg" variant="well" gap={6}>
              <Text {...TYPE.card} color="$color">well</Text>
              <Text {...TYPE.meta} color="$placeholderColor">Поглинає світло</Text>
            </AppCard>
          </XStack>
        </YStack>

        <YStack gap={10}>
          <Label>progressLit 62% · sweep</Label>
          <AppCard size="lg" variant="progressLit" lit={0.62} gap={6} minHeight={120} jc="flex-end">
            <Text {...TYPE.card} color="$color">progress-lit</Text>
            <Text {...TYPE.meta} color="rgba(220,255,245,0.64)">Світло знизу = прогрес</Text>
          </AppCard>
          <AppCard size="lg" variant="sweep" animateSweep gap={6}>
            <Text {...TYPE.card} color="$color">sweep</Text>
            <Text {...TYPE.meta} color="rgba(220,255,245,0.64)">Єдиний рух цього екрана</Text>
          </AppCard>
        </YStack>

        <YStack gap={10}>
          <Label>media · stack · selected · locked</Label>
          <AppCard
            size="lg"
            variant="media"
            minHeight={176}
            cover={
              <LinearGradient
                colors={["#1BA88F", "#0D9488", "#08090C"]}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
              />
            }
          >
            <Text {...TYPE.card} color="$color">media</Text>
            <Text {...TYPE.meta} color="rgba(220,255,245,0.64)">Cover + скрим</Text>
          </AppCard>
          <AppCard size="lg" variant="glow" stack gap={6}>
            <Text {...TYPE.card} color="$color">stack</Text>
            <Text {...TYPE.meta} color="rgba(220,255,245,0.64)">Дві плашки ззаду</Text>
          </AppCard>
          <XStack gap={10}>
            <AppCard f={1} size="lg" variant="glow" selected gap={6}>
              <Text {...TYPE.card} color="$color">selected</Text>
            </AppCard>
            <AppCard f={1} size="lg" variant="glow" locked gap={6}>
              <Text {...TYPE.card} color="$color">locked</Text>
            </AppCard>
          </XStack>
        </YStack>

        <YStack gap={10}>
          <Label>Кнопки · 9 варіантів</Label>
          <AppButton variant="primary">Primary</AppButton>
          <AppButton variant="soft">Soft</AppButton>
          <XStack gap={10}>
            <YStack f={1}><AppButton variant="secondary">Secondary</AppButton></YStack>
            <YStack f={1}><AppButton variant="outline">Outline</AppButton></YStack>
          </XStack>
          <XStack gap={10}>
            <YStack f={1}><AppButton variant="ghost">Ghost</AppButton></YStack>
            <YStack f={1}><AppButton variant="danger">Delete</AppButton></YStack>
          </XStack>
          <XStack gap={10}>
            <YStack f={1}><AppButton variant="glass">Glass</AppButton></YStack>
            <YStack f={1}><AppButton variant="neon">Neon</AppButton></YStack>
          </XStack>
          <AppButton variant="liquid">Liquid</AppButton>
        </YStack>

        <YStack gap={10}>
          <Label>Розміри · ефекти · стани</Label>
          <XStack gap={10} ai="center">
            <AppButton variant="primary" size="sm">sm 42</AppButton>
            <YStack f={1}><AppButton variant="primary" size="lg">lg 60</AppButton></YStack>
          </XStack>
          <AppButton variant="primary" sheen>Continue · sheen</AppButton>
          <AppButton variant="secondary" sheen="dark">Sheen dark</AppButton>
          <AppButton variant="secondary" flood>Flood · затисни</AppButton>
          <AppButton
            variant="primary"
            split={<ArrowRight size={16} color="#BEF264" strokeWidth={2.2} />}
          >
            Split
          </AppButton>
          <XStack gap={10}>
            <YStack f={1}><AppButton variant="primary" loading>Loading</AppButton></YStack>
            <YStack f={1}><AppButton variant="primary" disabled>Disabled</AppButton></YStack>
          </XStack>
        </YStack>

        <YStack gap={10}>
          <Label>IconButton 48 · acc · FAB 62</Label>
          <XStack gap={16} ai="center">
            <IconButton
              variant="glass"
              icon={<Search size={22} color="#EAF7FF" strokeWidth={1.9} />}
            />
            <IconButton
              variant="acc"
              icon={<Plus size={22} color="#0D1117" strokeWidth={2.1} />}
            />
            <AppFab icon={<Plus size={26} color="#0D1117" strokeWidth={1.6} />} />
          </XStack>
        </YStack>

        <YStack gap={10}>
          <Label>Прогреси · bar 8 · ring 62 · underline 2 · число</Label>
          <AppCard size="lg" variant="surface" gap={14}>
            <ProgressBar known={58} learning={84} total={200} />
            <XStack ai="center" gap={16}>
              <ProgressRing progress={0.64} label="64%" animated />
              <YStack f={1} gap={4}>
                <XStack ai="flex-end" gap={4}>
                  <AnimatedNumber
                    to={64}
                    suffix="%"
                    style={{ fontSize: 30, fontWeight: "800", fontFamily: "Sora_800ExtraBold" }}
                  />
                </XStack>
                <Text {...TYPE.meta} color="$colorMuted">
                  число добігає разом з дугою
                </Text>
              </YStack>
            </XStack>
          </AppCard>
          <YStack h={74} br={23} bg="$surfaceCard" overflow="hidden" jc="center" px={16}>
            <GradientBorder radius={23} preset="surf" />
            <Text {...TYPE.card} color="$color">Рядок з underline 29%</Text>
            <ProgressUnderline progress={0.29} />
          </YStack>
          <YStack h={74} br={23} bg="$surfaceCard" overflow="hidden" jc="center" px={16}>
            <GradientBorder radius={23} preset="surf" />
            <Text {...TYPE.card} color="$color">Dim-варіант 62%</Text>
            <ProgressUnderline progress={0.62} dim />
          </YStack>
        </YStack>

        <ControlsDemo />

        <FieldsDemo />

        <SheetsDemo />

        <StatesDemo />

        <YStack gap={10}>
          <Label>skeleton</Label>
          <AppCard size="lg" variant="surface" gap={10}>
            <Skeleton width={140} height={16} />
            <Skeleton width={220} height={12} />
            <Skeleton width={90} height={12} />
          </AppCard>
        </YStack>

        <YStack gap={10}>
          <Label>surf · 140deg · r23</Label>
          <YStack h={96} br={23} bg="$surfaceCard" p="$cardPad" jc="center">
            <GradientBorder radius={23} preset="surf" />
            <Text {...TYPE.card} color="$color">
              Base card border
            </Text>
          </YStack>
        </YStack>

        <YStack gap={10}>
          <Label>glow mint / teal / lime / indigo · 138deg</Label>
          <XStack gap={10}>
            <YStack f={1} h={84} br={23} bg="$surfaceCard" jc="center" ai="center">
              <GradientBorder radius={23} preset="glowMint" />
              <Text {...TYPE.micro} color="$color">mint</Text>
            </YStack>
            <YStack f={1} h={84} br={23} bg="$surfaceCard" jc="center" ai="center">
              <GradientBorder radius={23} preset="glowTeal" />
              <Text {...TYPE.micro} color="$color">teal</Text>
            </YStack>
          </XStack>
          <XStack gap={10}>
            <YStack f={1} h={84} br={23} bg="$surfaceCard" jc="center" ai="center">
              <GradientBorder radius={23} preset="glowLime" />
              <Text {...TYPE.micro} color="$color">lime</Text>
            </YStack>
            <YStack f={1} h={84} br={23} bg="$surfaceCard" jc="center" ai="center">
              <GradientBorder radius={23} preset="glowIndigo" />
              <Text {...TYPE.micro} color="$color">indigo</Text>
            </YStack>
          </XStack>
        </YStack>

        <YStack gap={10}>
          <Label>liquid · 155deg · r20</Label>
          <YStack h={84} br={20} bg="$surfaceGlass" jc="center" ai="center">
            <GradientBorder radius={20} preset="liquid" />
            <Text {...TYPE.card} color="$color">
              Liquid border
            </Text>
          </YStack>
        </YStack>

        <YStack gap={10}>
          <Label>liquid лінза 44 · тільки над градієнтом</Label>
          <YStack h={140} br={23} overflow="hidden">
            <BackgroundMesh preset="module" />
            <XStack f={1} ai="center" jc="center" gap={16}>
              <IconButton
                variant="liquidGlass"
                icon={<Search size={22} color="#EAF7FF" strokeWidth={1.9} />}
              />
              <IconButton
                variant="liquidGlass"
                icon={<Settings2 size={22} color="#EAF7FF" strokeWidth={1.9} />}
              />
              <IconButton
                variant="liquidGlass"
                icon={<X size={22} color="#EAF7FF" strokeWidth={1.9} />}
              />
            </XStack>
          </YStack>
        </YStack>

        <YStack gap={10}>
          <Label>lens · 160deg · 44 circle</Label>
          <XStack gap={16} ai="center">
            <YStack w={44} h={44} br={22} bg="$surfaceGlassFaint" jc="center" ai="center">
              <GradientBorder radius={22} preset="lens" />
              <X size={18} color="#EAF7FF" strokeWidth={1.9} />
            </YStack>
            <Text {...TYPE.meta} color="$colorMuted">
              44×44, кант 1px по колу
            </Text>
          </XStack>
        </YStack>

        <YStack gap={10}>
          <Label>well · 180deg · r16</Label>
          <YStack h={52} br={16} bg="$surfaceWell" jc="center" px={16}>
            <GradientBorder radius={16} preset="well" />
            <Text {...TYPE.body} color="$placeholderColor">
              Input placeholder
            </Text>
          </YStack>
        </YStack>

        <YStack gap={10}>
          <Label>sweep (conic) · r23</Label>
          <YStack h={84} br={23} bg="$surfaceCard" jc="center" ai="center">
            <GradientBorder radius={23} preset="glowMint" sweep />
            <Text {...TYPE.micro} color="$color">SweepGradient</Text>
          </YStack>
        </YStack>

        <YStack gap={10}>
          <Label>width 2.2 · r23</Label>
          <YStack h={84} br={23} bg="$surfaceCard" jc="center" ai="center">
            <GradientBorder radius={23} preset="glowLime" width={2.2} />
            <Text {...TYPE.micro} color="$color">товстий кант</Text>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
