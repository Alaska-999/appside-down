import { StateCard } from "@/src/components/ui/StateCard";
import { Search } from "lucide-react-native";
import { Text } from "tamagui";

type SearchNoun = "modules" | "folders";

const CREATE_LABEL: Record<SearchNoun, string> = {
  modules: "Create a module",
  folders: "Create a folder",
};

export function SearchEmptyState({
  query,
  noun,
  onCreate,
}: {
  query: string;
  noun: SearchNoun;
  onCreate?: () => void;
}) {
  return (
    <StateCard
      tone="empty"
      icon={Search}
      title="Nothing found"
      subtitle={
        <Text>
          No {noun} match{" "}
          <Text color="#DCEBF2" fontWeight="700">
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
