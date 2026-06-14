import { useQuery } from "convex/react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { api } from "@/convex/_generated/api";
import { WardrobeGrid } from "@/features/wardrobe/components/WardrobeGrid";
import { colors } from "@/theme/colors";

export default function WardrobeScreen() {
  const wardrobeItems = useQuery(api.wardrobeItems.list, { limit: 100 });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScreenHeader kicker="Wardrobe" title="Saved pieces" />
        <WardrobeGrid
          items={wardrobeItems ?? []}
          loading={wardrobeItems === undefined}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.surface.app,
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.surface.app,
    gap: 20,
    padding: 24,
  },
});
