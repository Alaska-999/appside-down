import { AppButton } from "@/src/components/ui/controls/Button";
import { AppSheet, SheetCrossfade, SheetRow, SheetRows } from "@/src/components/ui/overlays/Sheet";
import { ICON_DANGER } from "@/src/constants/iconColors";
import { Trash2 } from "lucide-react-native";
import { ReactNode, useEffect, useState } from "react";
import { YStack } from "tamagui";

interface ConfirmMenuSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuTitle: string;
  deleteLabel: string;
  confirmTitle: string;
  confirmSubtitle?: string;
  onConfirmDelete: () => Promise<void> | void;
  blur?: "default" | "strong";
  children: ReactNode;
}

export function ConfirmMenuSheet({
  open,
  onOpenChange,
  menuTitle,
  deleteLabel,
  confirmTitle,
  confirmSubtitle,
  onConfirmDelete,
  blur,
  children,
}: ConfirmMenuSheetProps) {
  const [view, setView] = useState<"menu" | "confirm">("menu");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) setView("menu");
  }, [open]);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirmDelete();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppSheet
      open={open}
      onOpenChange={onOpenChange}
      title={view === "menu" ? menuTitle : confirmTitle}
      subtitle={view === "confirm" ? confirmSubtitle : undefined}
      blur={blur}
    >
      <SheetCrossfade activeKey={view}>
        {view === "menu" ? (
          <SheetRows>
            {children}
            <SheetRow
              icon={Trash2}
              label={deleteLabel}
              danger
              onPress={() => setView("confirm")}
            />
          </SheetRows>
        ) : (
          <YStack gap={10}>
            <AppButton
              variant="danger"
              icon={<Trash2 size={19} color={ICON_DANGER} strokeWidth={1.9} />}
              loading={deleting}
              onPress={handleConfirm}
            >
              {deleteLabel}
            </AppButton>
            <AppButton variant="secondary" onPress={() => setView("menu")}>
              Cancel
            </AppButton>
          </YStack>
        )}
      </SheetCrossfade>
    </AppSheet>
  );
}
