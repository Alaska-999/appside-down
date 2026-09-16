import { makeMutable } from "react-native-reanimated";

export const TAB_LIGHT_SIZE = 30;
export const TAB_LIGHT_RADIUS = 10;
const FALLBACK_TOP = 11;

export const tabLightSlot = makeMutable(0);
export const tabLightSlotCount = makeMutable(0);
export const tabLightBarWidth = makeMutable(0);
export const tabLightTop = makeMutable(FALLBACK_TOP);

let barWindowTop: number | null = null;
let iconWindowTop: number | null = null;

function syncTop() {
  if (barWindowTop === null || iconWindowTop === null) return;
  tabLightTop.value = iconWindowTop - barWindowTop;
}

export function reportBarFrame(windowTop: number, width: number) {
  barWindowTop = windowTop;
  tabLightBarWidth.value = width;
  syncTop();
}

export function reportIconFrame(windowTop: number) {
  iconWindowTop = windowTop;
  syncTop();
}

export function reportActiveSlot(index: number, count: number) {
  tabLightSlotCount.value = count;
  tabLightSlot.value = index;
}

export function slotCenterX(index: number, barWidth: number, count: number) {
  "worklet";
  if (barWidth === 0 || count === 0) return 0;
  return (barWidth / count) * (index + 0.5) - TAB_LIGHT_SIZE / 2;
}
