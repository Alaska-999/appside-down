import { MatchTile } from "@/src/components/match/MatchTile";
import { MatchTileModel } from "@/src/types";
import { screenGutter } from "@/tamagui.config";
import { useWindowDimensions } from "react-native";
import { XStack, YStack } from "tamagui";

const COLUMNS_WIDE = 3;
const COLUMNS_NARROW = 2;
const NARROW_MAX_TILES = 8;
const GAP = 10;
const SCREEN_X = screenGutter;
const TILE_ASPECT = 160 / 112.67;

export function MatchGrid({
  tiles,
  onSelect,
}: {
  tiles: MatchTileModel[];
  onSelect: (tileId: string) => void;
}) {
  const { width } = useWindowDimensions();
  const columns =
    tiles.length <= NARROW_MAX_TILES ? COLUMNS_NARROW : COLUMNS_WIDE;
  const tileWidth =
    (width - SCREEN_X * 2 - GAP * (columns - 1)) / columns;
  const maxRowHeight = Math.round(tileWidth * TILE_ASPECT);

  const rows: MatchTileModel[][] = [];
  for (let i = 0; i < tiles.length; i += columns) {
    rows.push(tiles.slice(i, i + columns));
  }

  return (
    <YStack f={1} gap={GAP} px="$screenX" jc="center">
      {rows.map((row, index) => (
        <XStack key={index} f={1} maxHeight={maxRowHeight} gap={GAP} jc="center">
          {row.map((tile) => (
            <YStack key={tile.tileId} w={tileWidth}>
              <MatchTile
                text={tile.text}
                state={tile.state}
                onPress={() => onSelect(tile.tileId)}
              />
            </YStack>
          ))}
        </XStack>
      ))}
    </YStack>
  );
}
