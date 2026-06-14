import { Image } from "expo-image";
import type { SymbolViewProps } from "expo-symbols";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import {
  getCategoryLabel,
  type WardrobeCategory,
} from "@/features/wardrobe/types";
import { colors } from "@/theme/colors";

const uploadIcon = {
  android: "upload",
  ios: "square.and.arrow.up",
  web: "upload",
} satisfies SymbolViewProps["name"];

export type WardrobeGridItem = {
  _id: string;
  _creationTime: number;
  category: WardrobeCategory;
  fileName?: string;
  imageUrl: string | null;
};

type WardrobeGridProps = {
  items: WardrobeGridItem[];
  loading: boolean;
};

export function WardrobeGrid({ items, loading }: WardrobeGridProps) {
  if (loading) {
    return <WardrobeLoadingState />;
  }

  if (items.length === 0) {
    return <WardrobeEmptyState />;
  }

  return (
    <FlatList
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.listContent}
      data={items}
      keyExtractor={(item) => item._id}
      numColumns={2}
      renderItem={({ item }) => <WardrobeTile item={item} />}
      showsVerticalScrollIndicator={false}
    />
  );
}

function WardrobeLoadingState() {
  return <EmptyState minHeight={220} title="Loading wardrobe" />;
}

function WardrobeEmptyState() {
  return (
    <EmptyState
      action={
        <LinkButton href="/upload" icon={uploadIcon}>
          Add photos
        </LinkButton>
      }
      minHeight={220}
      title="No wardrobe photos yet"
    />
  );
}

function WardrobeTile({ item }: { item: WardrobeGridItem }) {
  return (
    <View style={styles.tile}>
      {item.imageUrl ? (
        <Image
          accessibilityLabel={item.fileName ?? `${item.category} clothing item`}
          contentFit="cover"
          source={{ uri: item.imageUrl }}
          style={styles.image}
          transition={150}
        />
      ) : (
        <View style={styles.missingImage}>
          <Text style={styles.missingImageText}>Image unavailable</Text>
        </View>
      )}
      <View style={styles.tileFooter}>
        <Text numberOfLines={1} style={styles.tileCategory}>
          {getCategoryLabel(item.category)}
        </Text>
        {item.fileName ? (
          <Text numberOfLines={1} style={styles.tileFileName}>
            {item.fileName}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    gap: 12,
    paddingBottom: 28,
  },
  row: {
    gap: 12,
  },
  tile: {
    backgroundColor: colors.surface.raised,
    borderColor: colors.border.subtle,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
  },
  image: {
    aspectRatio: 1,
    width: "100%",
  },
  missingImage: {
    alignItems: "center",
    aspectRatio: 1,
    justifyContent: "center",
    padding: 16,
    width: "100%",
  },
  missingImageText: {
    color: colors.text.muted,
    fontSize: 13,
    textAlign: "center",
  },
  tileFooter: {
    gap: 3,
    minHeight: 58,
    padding: 10,
  },
  tileCategory: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "800",
  },
  tileFileName: {
    color: colors.text.muted,
    fontSize: 12,
  },
});
