import { Image } from "expo-image";
import type { SymbolViewProps } from "expo-symbols";
import { StyleSheet, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { WardrobeUploadAsset } from "@/features/wardrobe/types";
import { colors } from "@/theme/colors";

const addPhotoIcon = {
  android: "add_photo_alternate",
  ios: "photo.badge.plus",
  web: "add_photo_alternate",
} satisfies SymbolViewProps["name"];

const removeIcon = {
  android: "delete",
  ios: "trash",
  web: "delete",
} satisfies SymbolViewProps["name"];

type SelectedPhotoGridProps = {
  assets: WardrobeUploadAsset[];
  disabled?: boolean;
  onClear: () => void;
  onPick: () => void;
  onRemove: (assetId: string) => void;
};

export function SelectedPhotoGrid({
  assets,
  disabled = false,
  onClear,
  onPick,
  onRemove,
}: SelectedPhotoGridProps) {
  return (
    <View style={styles.section}>
      <SectionHeader
        action={
          assets.length > 0 ? (
            <Button
              disabled={disabled}
              onPress={onClear}
              size="small"
              variant="outline"
            >
              Clear
            </Button>
          ) : null
        }
        label="Photos"
        meta={assets.length === 1 ? "1 selected" : `${assets.length} selected`}
      />

      <Button
        disabled={disabled}
        icon={addPhotoIcon}
        onPress={onPick}
        variant="soft"
      >
        Add photos
      </Button>

      {assets.length > 0 ? (
        <SelectedPhotoPreviewGrid
          assets={assets}
          disabled={disabled}
          onRemove={onRemove}
        />
      ) : (
        <EmptyState
          body="Choose one or more clothing photos."
          title="No photos selected"
        />
      )}
    </View>
  );
}

function SelectedPhotoPreviewGrid({
  assets,
  disabled,
  onRemove,
}: {
  assets: WardrobeUploadAsset[];
  disabled: boolean;
  onRemove: (assetId: string) => void;
}) {
  return (
    <View style={styles.grid}>
      {assets.map((asset) => (
        <SelectedPhotoTile
          asset={asset}
          disabled={disabled}
          key={asset.id}
          onRemove={onRemove}
        />
      ))}
    </View>
  );
}

function SelectedPhotoTile({
  asset,
  disabled,
  onRemove,
}: {
  asset: WardrobeUploadAsset;
  disabled: boolean;
  onRemove: (assetId: string) => void;
}) {
  return (
    <View style={styles.tile}>
      <Image
        accessibilityLabel={asset.fileName ?? "Selected clothing photo"}
        contentFit="cover"
        source={{ uri: asset.uri }}
        style={styles.image}
        transition={120}
      />
      <Button
        accessibilityLabel={`Remove ${asset.fileName ?? "photo"}`}
        disabled={disabled}
        icon={removeIcon}
        onPress={() => onRemove(asset.id)}
        size="icon"
        style={styles.removeButton}
        variant="overlay"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tile: {
    aspectRatio: 1,
    backgroundColor: colors.surface.raised,
    borderColor: colors.border.subtle,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
    width: "31%",
  },
  image: {
    height: "100%",
    width: "100%",
  },
  removeButton: {
    position: "absolute",
    right: 6,
    top: 6,
  },
});
