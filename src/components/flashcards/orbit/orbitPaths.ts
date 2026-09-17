import { CENTER } from "@/src/components/flashcards/orbit/orbitLayout";
import { Skia } from "@shopify/react-native-skia";

export function halfPath(rx: number, ry: number, startDeg: number) {
  const path = Skia.Path.Make();
  path.addArc(
    { x: CENTER - rx, y: CENTER - ry, width: rx * 2, height: ry * 2 },
    startDeg,
    180,
  );
  return path;
}
