import { StateCard } from "@/src/components/ui/StateCard";
import { ICON_ON_GLASS } from "@/src/constants/iconColors";
import { Search } from "lucide-react-native";
import { Text, YStackProps } from "tamagui";

type SearchNoun = "modules" | "folders";

const CREATE_LABEL: Record<SearchNoun, string> = {
  modules: "Create a module",
  folders: "Create a folder",
};

type SearchEmptyStateLayoutProps = Pick<
  YStackProps,
  "mt" | "mb" | "ml" | "mr" | "f" | "flex" | "testID"
>;

export function SearchEmptyState({
  query,
  noun,
  onCreate,
  ...rest
}: {
  query: string;
  noun: SearchNoun;
  onCreate?: () => void;
} & SearchEmptyStateLayoutProps) {
  return (
    <StateCard
      {...rest}
      tone="empty"
      icon={Search}
      title="Nothing found"
      subtitle={
        <Text>
          No {noun} match{" "}
          <Text color={ICON_ON_GLASS} fontWeight="700">
            “{query}”
          </Text>
          . Check the spelling — or make it yourself.
        </Text>
      }
      buttonLabel={onCreate ? CREATE_LABEL[noun] : undefined}
      onButtonPress={onCreate}
    />
  );
}
