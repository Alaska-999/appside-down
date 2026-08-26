import { AppSheet, SheetRow, SheetRows } from "@/src/components/ui/Sheet";
import { Captions, Folder } from "lucide-react-native";
import { Href, useRouter } from "expo-router";

export function CreateActionSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  const handleNavigate = (path: Href) => {
    onOpenChange(false);
    router.push(path);
  };

  return (
    <AppSheet open={open} onOpenChange={onOpenChange} title="Create">
      <SheetRows>
        <SheetRow
          icon={Captions}
          label="Module"
          subtitle="A new set of flashcards"
          chevron
          onPress={() => handleNavigate("/module/create")}
        />
        <SheetRow
          icon={Folder}
          label="Folder"
          subtitle="Group modules together"
          chevron
          onPress={() => handleNavigate("/folder/create")}
        />
      </SheetRows>
    </AppSheet>
  );
}
