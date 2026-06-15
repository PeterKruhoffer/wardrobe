import { Image } from "expo-image";
import type { SymbolViewProps } from "expo-symbols";
import { LegendList } from "@legendapp/list/react-native";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";

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

const categoryDisplayOrder = [
  "hats",
  "tops",
  "bottoms",
  "shoes",
] satisfies WardrobeCategory[];

const screenHorizontalPadding = 48;
const tileGap = 12;
const tileWidth = 160;

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

type WardrobeCategorySection = {
  category: WardrobeCategory;
  items: WardrobeGridItem[];
};

export function WardrobeGrid({ items, loading }: WardrobeGridProps) {
  if (loading) {
    return <WardrobeLoadingState />;
  }

  if (items.length === 0) {
    return <WardrobeEmptyState />;
  }

  const sections = getWardrobeSections(items);

  return (
    <LegendList
      contentContainerStyle={styles.listContent}
      data={sections}
      estimatedItemSize={278}
      keyExtractor={(section) => section.category}
      recycleItems
      renderItem={({ item }) => <WardrobeSection section={item} />}
      showsVerticalScrollIndicator={false}
    />
  );
}

function getWardrobeSections(items: WardrobeGridItem[]): WardrobeCategorySection[] {
  return categoryDisplayOrder
    .map((category) => ({
      category,
      items: items.filter((item) => item.category === category),
    }))
    .filter((section) => section.items.length > 0);
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

function WardrobeSection({ section }: { section: WardrobeCategorySection }) {
  const { width } = useWindowDimensions();
  const listWidth = Math.max(width - screenHorizontalPadding, tileWidth);
  const centerPadding = Math.max((listWidth - tileWidth) / 2, 0);
  const snapToIndices = section.items.map((_, index) => index);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{getCategoryLabel(section.category)}</Text>
        <Text style={styles.sectionCount}>{section.items.length}</Text>
      </View>
      <LegendList
        contentContainerStyle={[
          styles.sectionListContent,
          { paddingLeft: centerPadding, paddingRight: centerPadding },
        ]}
        data={section.items}
        estimatedItemSize={tileWidth + tileGap}
        horizontal
        keyExtractor={(item) => item._id}
        recycleItems
        renderItem={({ item }) => <WardrobeTile item={item} />}
        showsHorizontalScrollIndicator={false}
        snapToIndices={snapToIndices}
      />
    </View>
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
    gap: 18,
    paddingBottom: 28,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "800",
  },
  sectionCount: {
    color: colors.text.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  sectionListContent: {
    gap: tileGap,
  },
  tile: {
    backgroundColor: colors.surface.raised,
    borderColor: colors.border.subtle,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
    width: tileWidth,
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
