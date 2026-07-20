import { GlassActionSheet } from "@/src/components/ui/GlassActionSheet";
import { FilePlus, Folder } from "@tamagui/lucide-icons";
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
    <GlassActionSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Create New"
      actions={[
        {
          key: "folder",
          label: "Folder",
          description: "Group modules together",
          icon: <Folder size={26} color="white" />,
          gradient: ["#2dd4bf", "#a3e635"],
          onPress: () => handleNavigate("/folder/create"),
        },
        {
          key: "module",
          label: "Module",
          description: "A new set of flashcards",
          icon: <FilePlus size={26} color="white" />,
          gradient: ["#4338ca", "#65a30d"],
          onPress: () => handleNavigate("/module/create"),
        },
      ]}
    />
  );
}
